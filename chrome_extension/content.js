/**
 * Content.js - 主消息处理器和模块协调器
 * 集成: PageDetector, AmazonNavigator, AmazonFormFiller
 */

console.log('[亚马逊上传助手] Content script加载完成');

// ========== 全局实例引用 ==========
// 这些实例由各自的模块创建 (page-detector.js, amazon-navigator.js, amazon-form-filler.js)
let pageDetector = null;
let amazonNavigator = null;
let formFiller = null;

// ========== 初始化 ==========
function initialize() {
    console.log('[初始化] 开始...');

    // 获取全局实例
    if (typeof window.pageDetector !== 'undefined') {
        pageDetector = window.pageDetector;
        console.log('✓ PageDetector已加载');

        // 启动页面监控
        pageDetector.startMonitoring(2000);
    } else {
        console.warn('⚠️ PageDetector未加载');
    }

    if (typeof window.amazonNavigator !== 'undefined') {
        amazonNavigator = window.amazonNavigator;
        console.log('✓ AmazonNavigator已加载');
    } else {
        console.warn('⚠️ AmazonNavigator未加载');
    }

    if (typeof window.AmazonFormFiller !== 'undefined') {
        formFiller = window.AmazonFormFiller;
        console.log('✓ AmazonFormFiller已加载');
    } else {
        console.warn('⚠️ AmazonFormFiller未加载');
    }

    console.log('[初始化] 完成');

    // 调试信息
    console.log('当前URL:', window.location.href);
    if (pageDetector) {
        const status = pageDetector.detectCurrentPage();
        console.log('检测到的页面类型:', status);
    }
}

// 延迟初始化，确保其他脚本已加载
setTimeout(initialize, 500);

// ========== 消息处理 ==========
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[收到消息]', request.action);

    // 处理各种action
    switch (request.action) {
        case 'getPageStatus':
            handleGetPageStatus(sendResponse);
            break;

        case 'searchASIN':
            handleSearchASIN(request.asin, sendResponse);
            break;

        case 'fillPage':
            handleFillPage(request.page, request.product, request.settings, sendResponse);
            break;

        case 'navigateToPage':
            handleNavigateToPage(request.page, sendResponse);
            break;

        case 'fillProduct':
            // 旧版兼容（通用填写）
            handleFillProduct(request.product, request.settings, sendResponse);
            break;

        case 'startLearning':
            // 学习模式（页面分析器）
            handleStartLearning(sendResponse);
            break;

        case 'analyzePage':
            // 页面分析
            handleAnalyzePage(sendResponse);
            break;

        case 'getLearned':
            // 获取学习数据
            handleGetLearned(sendResponse);
            break;

        default:
            console.warn('[未知action]', request.action);
            sendResponse({ success: false, error: '未知操作' });
            return false;
    }

    // 返回true表示异步响应
    return true;
});

// ========== Action处理函数 ==========

/**
 * 获取当前页面状态
 */
function handleGetPageStatus(sendResponse) {
    if (!pageDetector) {
        sendResponse({ page: 'unknown', expected: null });
        return;
    }

    const status = pageDetector.getStatus();

    sendResponse({
        page: status.currentPage,
        expected: status.expectedPage,
        matched: status.matched,
        url: status.url
    });
}

/**
 * 搜索ASIN并进入表单
 */
function handleSearchASIN(asin, sendResponse) {
    if (!amazonNavigator) {
        sendResponse({ success: false, error: 'AmazonNavigator未加载' });
        return;
    }

    console.log(`\n[开始ASIN搜索] ${asin}`);

    // 使用Promise包装async操作，确保sendResponse总是被调用
    amazonNavigator.searchASINAndEnterForm(asin)
        .then(result => {
            if (result && result.success) {
                sendResponse({ success: true });
            } else {
                sendResponse({ success: false, error: result ? result.error : '搜索失败' });
            }
        })
        .catch(error => {
            console.error('[ASIN搜索失败]', error);
            sendResponse({ success: false, error: error ? error.message : '搜索失败' });
        });
}

/**
 * 填写指定页面
 */
function handleFillPage(page, product, settings, sendResponse) {
    if (!formFiller) {
        sendResponse({ success: false, error: 'FormFiller未加载' });
        return;
    }

    console.log(`\n[填写页面] ${page}`);

    // 异步操作封装
    const fillPageAsync = async () => {
        try {
            // 等待页面稳定
            await sleep(1000);

            // 根据页面类型调用对应的填写方法
            let result;

            switch (page) {
                case 'productDetails':
                    result = await formFiller.fillProductDetails(product, settings);
                    break;

                case 'safetyCompliance':
                    result = await formFiller.fillSafetyCompliance(product, settings);
                    break;

                case 'offer':
                    result = await formFiller.fillOffer(product, settings);
                    break;

                case 'images':
                    result = await formFiller.uploadImages(product, settings);
                    break;

                default:
                    // 通用填写（尝试智能匹配）
                    result = await formFiller.fillCurrentPage(product, settings);
            }

            return result;
        } catch (error) {
            throw error;
        }
    };

    // 执行异步操作并确保sendResponse总是被调用
    fillPageAsync()
        .then(result => {
            if (result && result.success) {
                sendResponse({ success: true, filled: result.filled });
            } else {
                sendResponse({ success: false, error: result ? result.error : '填写失败' });
            }
        })
        .catch(error => {
            console.error('[页面填写失败]', error);
            sendResponse({ success: false, error: error ? error.message : '填写失败' });
        });
}

/**
 * 导航到指定页面
 */
function handleNavigateToPage(page, sendResponse) {
    console.log(`[导航到] ${page}`);

    const navigateAsync = async () => {
        try {
            // 页面对应的tab文本
            const tabTexts = {
                'productDetails': '产品详情',
                'safetyCompliance': '安全与合规',
                'offer': '报价',
                'images': '图片'
            };

            const tabText = tabTexts[page];
            if (!tabText) {
                throw new Error(`未知页面类型: ${page}`);
            }

            // 查找并点击tab
            const tab = findTabByText(tabText);

            if (!tab) {
                throw new Error(`未找到tab: ${tabText}`);
            }

            // 点击tab
            tab.click();
            console.log(`✓ 已点击tab: ${tabText}`);

            // 等待页面加载
            await sleep(1500);

            // 设置预期页面
            if (pageDetector) {
                pageDetector.setExpectedPage(page);
            }

            return { success: true };
        } catch (error) {
            throw error;
        }
    };

    navigateAsync()
        .then(() => {
            sendResponse({ success: true });
        })
        .catch(error => {
            console.error('[导航失败]', error);
            sendResponse({ success: false, error: error ? error.message : '导航失败' });
        });
}

/**
 * 旧版通用填写（兼容）
 */
function handleFillProduct(product, settings, sendResponse) {
    if (!formFiller) {
        sendResponse({ success: false, error: 'FormFiller未加载' });
        return;
    }

    formFiller.fillCurrentPage(product, settings)
        .then(result => {
            if (result && result.success) {
                sendResponse({ success: true, filled: result.filled });
            } else {
                sendResponse({ success: false, error: result ? result.error : '填写失败' });
            }
        })
        .catch(error => {
            console.error('[填写失败]', error);
            sendResponse({ success: false, error: error ? error.message : '填写失败' });
        });
}

/**
 * 启动学习模式
 */
function handleStartLearning(sendResponse) {
    // 调用学习模式模块
    if (typeof window.learningMode !== 'undefined' && window.learningMode.start) {
        window.learningMode.start()
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
    } else {
        sendResponse({ success: false, error: '学习模式未加载' });
    }
}

/**
 * 分析页面
 */
function handleAnalyzePage(sendResponse) {
    if (typeof window.pageAnalyzer !== 'undefined' && window.pageAnalyzer.analyze) {
        const data = window.pageAnalyzer.analyze();
        sendResponse({ success: true, data: data });
    } else {
        sendResponse({ success: false, error: '页面分析器未加载' });
    }
}

/**
 * 获取学习数据
 */
function handleGetLearned(sendResponse) {
    chrome.storage.local.get(['learnedData'], (result) => {
        if (result.learnedData) {
            sendResponse({ success: true, data: result.learnedData });
        } else {
            sendResponse({ success: false });
        }
    });
}

// ========== 辅助函数 ==========

/**
 * 根据文本查找tab
 */
function findTabByText(text) {
    // 策略1: 查找包含指定文本的可点击元素
    const allElements = document.querySelectorAll('*');

    for (const el of allElements) {
        const elementText = el.textContent.trim();

        // 精确匹配或包含匹配
        if (elementText === text || elementText.includes(text)) {
            // 检查是否是可点击的tab
            if (el.tagName === 'BUTTON' ||
                el.tagName === 'A' ||
                el.role === 'tab' ||
                el.className.includes('tab')) {
                return el;
            }
        }
    }

    // 策略2: 查找shadow DOM中的tab
    return findInShadowDOM((el) => {
        const text = el.textContent.trim();
        return (text === text || text.includes(text)) &&
            (el.tagName === 'BUTTON' || el.tagName === 'A' || el.role === 'tab');
    });
}

/**
 * 在Shadow DOM中递归查找
 */
function findInShadowDOM(predicate) {
    function search(root) {
        const allElements = root.querySelectorAll('*');

        for (const el of allElements) {
            if (predicate(el)) {
                return el;
            }

            if (el.shadowRoot) {
                const found = search(el.shadowRoot);
                if (found) return found;
            }
        }

        return null;
    }

    return search(document);
}

/**
 * 延迟函数
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 随机整数
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ========== 页面加载完成提示 ==========
console.log('[亚马逊上传助手] 准备就绪！');
console.log('- PageDetector:', pageDetector ? '✓' : '✗');
console.log('- AmazonNavigator:', amazonNavigator ? '✓' : '✗');
console.log('- FormFiller:', formFiller ? '✓' : '✗');
