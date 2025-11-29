/**
 * 调试搜索结果加载问题
 * 在亚马逊页面输入ASIN并按回车后，运行此脚本查看搜索结果元素
 */

console.log('=== 搜索结果调试工具 ===');
console.log('请先手动输入ASIN并按回车，等待页面变化后运行此脚本');

// 方法1：查找所有可能是搜索结果的元素
function findSearchResults() {
    console.log('\n--- 查找搜索结果元素 ---');

    const selectors = [
        // 通用选择器
        '[class*="search-result"]',
        '[class*="search-item"]',
        '[class*="product-list"]',
        '[class*="result-list"]',
        '[class*="catalog-item"]',
        '[data-testid*="search"]',
        '[data-testid*="result"]',
        '[data-testid*="product"]',

        // 列表相关
        '[role="list"] [role="listitem"]',
        '[role="grid"] [role="row"]',
        'ul li[class*="result"]',
        'div[class*="results"] > div',

        // 卡片/块状元素
        '[class*="card"][class*="product"]',
        '[class*="tile"][class*="product"]',
        '[class*="block"][class*="product"]',

        // 表格相关
        'table tbody tr',
        '[role="table"] [role="row"]',

        // 链接相关
        'a[href*="/dp/"]',
        'a[href*="product"]',
        'a[href*="ASIN"]',

        // kat组件相关
        'kat-table-row',
        'kat-card',
        'kat-list-item',
        '[class*="kat-"][class*="item"]'
    ];

    let foundElements = false;

    selectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`✓ 找到 ${elements.length} 个元素: ${selector}`);
                foundElements = true;

                // 显示第一个元素的内容
                if (elements[0]) {
                    const text = elements[0].textContent.substring(0, 100);
                    console.log(`  内容预览: ${text}...`);
                }
            }
        } catch (e) {
            // 忽略无效选择器
        }
    });

    if (!foundElements) {
        console.log('❌ 没有找到任何搜索结果元素');
    }

    return foundElements;
}

// 方法2：查找包含ASIN的元素
function findElementsWithASIN(asin) {
    console.log(`\n--- 查找包含ASIN "${asin}" 的元素 ---`);

    const allElements = document.querySelectorAll('*');
    const foundElements = [];

    allElements.forEach(el => {
        if (el.textContent && el.textContent.includes(asin) &&
            el.children.length < 5) { // 避免找到太大的容器
            foundElements.push(el);
        }
    });

    if (foundElements.length > 0) {
        console.log(`✓ 找到 ${foundElements.length} 个包含ASIN的元素`);
        foundElements.slice(0, 3).forEach((el, i) => {
            console.log(`元素 ${i + 1}:`, {
                tagName: el.tagName,
                className: el.className,
                id: el.id || '(无ID)',
                text: el.textContent.substring(0, 50)
            });
        });
    } else {
        console.log('❌ 没有找到包含ASIN的元素');
    }

    return foundElements;
}

// 方法3：监听页面变化
function watchForChanges() {
    console.log('\n--- 开始监听页面变化 ---');
    console.log('请现在输入ASIN并按回车...');

    let changeCount = 0;

    const observer = new MutationObserver((mutations) => {
        changeCount++;

        if (changeCount <= 5) { // 只显示前5个变化
            console.log(`检测到页面变化 #${changeCount}`);

            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            const className = node.className || '';
                            const id = node.id || '';

                            if (className.includes('search') ||
                                className.includes('result') ||
                                className.includes('product') ||
                                id.includes('search') ||
                                id.includes('result')) {
                                console.log('⭐ 可能的搜索结果元素:', {
                                    tagName: node.tagName,
                                    className: className,
                                    id: id
                                });
                            }
                        }
                    });
                }
            });
        }

        // 尝试查找搜索结果
        setTimeout(() => {
            if (findSearchResults()) {
                console.log('✅ 检测到搜索结果加载完成！');
                observer.disconnect();
            }
        }, 500);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 10秒后停止监听
    setTimeout(() => {
        observer.disconnect();
        console.log('--- 停止监听 ---');
    }, 10000);
}

// 方法4：检查URL变化
function checkURL() {
    console.log('\n--- URL信息 ---');
    console.log('当前URL:', window.location.href);

    if (window.location.href.includes('search') ||
        window.location.href.includes('keywords') ||
        window.location.href.includes('results')) {
        console.log('✓ URL表明在搜索结果页');
    } else {
        console.log('⚠️ URL不像搜索结果页');
    }
}

// 方法5：检查Shadow DOM
function checkShadowDOM() {
    console.log('\n--- 检查Shadow DOM ---');

    const customElements = document.querySelectorAll('*');
    let shadowCount = 0;

    customElements.forEach(el => {
        if (el.shadowRoot) {
            shadowCount++;
            console.log(`Shadow DOM 元素: <${el.tagName.toLowerCase()}>`);

            // 在Shadow DOM中查找搜索结果
            const shadowResults = el.shadowRoot.querySelectorAll('[class*="result"], [class*="search"]');
            if (shadowResults.length > 0) {
                console.log(`  ⭐ 在Shadow DOM中找到 ${shadowResults.length} 个可能的结果元素`);
            }
        }
    });

    console.log(`共找到 ${shadowCount} 个Shadow DOM元素`);
}

// 执行所有检查
console.log('\n========== 开始诊断 ==========');
checkURL();
findSearchResults();
checkShadowDOM();

console.log('\n💡 提示：');
console.log('1. 如果要测试实时监听，运行: watchForChanges()');
console.log('2. 如果要查找特定ASIN，运行: findElementsWithASIN("B08KXKQJP4")');
console.log('3. 复制找到的选择器，更新到amazon-navigator.js的findFirstSearchResult()方法中');

// 将函数暴露到全局
window.debugSearch = {
    findSearchResults,
    findElementsWithASIN,
    watchForChanges,
    checkURL,
    checkShadowDOM
};