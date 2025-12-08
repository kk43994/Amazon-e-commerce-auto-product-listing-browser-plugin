/**
 * Amazon自动导航模块
 * 功能：自动搜索ASIN并导航到商品表单页面
 * 基于实际记录的元素UID
 */

console.log('[Amazon导航器] 模块加载');

class AmazonNavigator {
    constructor() {
        this.currentStep = null;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    /**
     * 完整的ASIN搜索并进入表单流程
     */
    async searchASINAndEnterForm(asin) {
        console.log(`\n========== 开始ASIN搜索流程 ==========`);
        console.log(`ASIN: ${asin}`);

        try {
            const url = window.location.href;

            // 检查是否已在表单页面 (防止在表单页重复运行导致报错)
            // 优先使用 PageDetector
            // 检查是否已在表单页面 (防止在表单页重复运行导致报错)
            // 优先使用 PageDetector
            if (window.pageDetector) {
                let pageType = window.pageDetector.detectCurrentPage();

                // 如果检测结果未知，等待一下再试 (防止DOM未就绪)
                if (pageType === 'unknown') {
                    console.log('PageDetector检测结果未知，等待1.5秒重试...');
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    pageType = window.pageDetector.detectCurrentPage();
                }

                if (['productDetails', 'safetyCompliance', 'offer', 'images', 'variations'].includes(pageType)) {
                    console.log(`✓ PageDetector检测到已在表单页面 (${pageType})，跳过搜索流程`);
                    return { success: true, alreadyOnPage: true };
                }
            }

            // 后备URL检查
            if (url.includes('/product_details') ||
                url.includes('/safety_and_compliance') ||
                url.includes('/offer') ||
                url.includes('/images')) {
                console.log('✓ URL检测到已在商品表单页面，跳过搜索流程');
                return { success: true, alreadyOnPage: true };
            }

            // 检查是否已在产品搜索页
            if (url.includes('/product-search')) {
                console.log('✓ 已在产品搜索页，跳过导航步骤');

                // 直接搜索ASIN
                await this.searchASIN(asin);

                // 步骤4: 点击搜索结果
                await this.clickSearchResult(asin);

                // 步骤5: 点击"复制商品信息"或类似按钮
                await this.clickCopyProduct();

                // 步骤6: 等待并切换到表单tab
                await this.switchToFormTab();

            } else {
                // 传统流程
                // 步骤1: 导航到添加商品页
                await this.navigateToAddProduct();

                // 步骤2: 切换到搜索标签
                await this.switchToSearchTab();

                // 步骤3: 输入ASIN并搜索
                await this.searchASIN(asin);

                // 步骤4: 点击搜索结果
                await this.clickSearchResult(asin);

                // 步骤5: 点击"复制商品信息"
                await this.clickCopyProduct();

                // 步骤6: 等待并切换到表单tab
                await this.switchToFormTab();
            }

            console.log(`✅ ASIN搜索流程完成`);
            return { success: true };

        } catch (error) {
            console.error(`❌ ASIN搜索流程失败:`, error);
            console.error('Stack trace:', error.stack); // 添加堆栈跟踪
            return { success: false, error: error.message };
        }
    }

    /**
     * 步骤1: 导航到添加商品页
     */
    async navigateToAddProduct() {
        this.currentStep = '导航到添加商品页';
        console.log(`\n[步骤1] ${this.currentStep}`);

        const url = window.location.href;

        // 检查是否已在添加商品页或产品搜索页
        if (url.includes('/add-product') ||
            url.includes('/product-search') ||
            url.includes('/productsearch') ||
            url.includes('/catalog-items') ||
            url.includes('/listing/products')) {
            console.log('✓ 已在商品添加/搜索页');
            return true;
        }

        // 查找"添加商品"按钮
        const addProductBtn = await this.findAddProductButton();

        if (!addProductBtn) {
            // 对于日本亚马逊，可能已经在正确的页面
            if (url.includes('sellercentral-japan.amazon.com')) {
                console.log('⚠️ 未找到添加商品按钮，但可能已在正确页面');
                // 尝试查找搜索框直接进行搜索
                const input = await this.findASINInput();
                if (input) {
                    console.log('✓ 找到搜索框，可以直接开始搜索');
                    return true;
                }
            }
            throw new Error('未找到"添加商品"按钮或搜索框');
        }

        // 点击按钮
        addProductBtn.click();
        console.log('✓ 已点击"添加商品"按钮');

        // 等待页面加载
        await this.waitForPageChange('/add-product', 15000);
        console.log('✓ 添加商品页面已加载');

        return true;
    }

    /**
     * 步骤2: 切换到搜索标签
     */
    async switchToSearchTab() {
        this.currentStep = '切换到搜索标签';
        console.log(`\n[步骤2] ${this.currentStep}`);

        const url = window.location.href;

        // 如果已在产品搜索页，跳过此步骤
        if (url.includes('/product-search') || url.includes('/productsearch')) {
            console.log('✓ 已在搜索页面，跳过切换步骤');
            return true;
        }

        await this.sleep(1000);

        // 查找"搜索"标签（可能需要点击）
        const searchTab = await this.findSearchTab();

        if (!searchTab) {
            // 可能已经在搜索页面
            const input = await this.findASINInput();
            if (input) {
                console.log('✓ 找到搜索框，无需切换标签');
                return true;
            }
            throw new Error('未找到"搜索"标签');
        }

        // 点击搜索标签
        this.clickElement(searchTab);
        console.log('✓ 已切换到搜索标签');

        await this.sleep(500);
        return true;
    }

    /**
     * 步骤3: 输入ASIN并搜索
     */
    async searchASIN(asin) {
        this.currentStep = `搜索ASIN: ${asin}`;
        console.log(`\n[步骤3] ${this.currentStep}`);

        const url = window.location.href;

        // 日本亚马逊特殊处理：确保在搜索标签页
        if (url.includes('japan.amazon.com') && !url.includes('/keywords')) {
            console.log('需要切换到搜索标签页...');
            // 点击搜索标签 - 使用正确的选择器语法
            let searchTab = null;

            // 方法1: 通过文本内容查找span
            const spans = document.querySelectorAll('span');
            for (const span of spans) {
                if (span.textContent.includes('搜索') || span.textContent.includes('検索') || span.textContent.includes('Search')) {
                    searchTab = span;
                    break;
                }
            }

            // 方法2: 如果没找到span，查找包含tab类的元素
            if (!searchTab) {
                const tabs = document.querySelectorAll('[class*="tab"]');
                for (const tab of tabs) {
                    if (tab.textContent.includes('搜索') || tab.textContent.includes('検索') || tab.textContent.includes('Search')) {
                        searchTab = tab;
                        break;
                    }
                }
            }

            if (searchTab) {
                searchTab.click();
                console.log('✓ 已点击搜索标签');
                await this.sleep(1500); // 等待弹出框或新区域加载
            }
        }

        // 查找ASIN输入框            // 查找输入框
        let input = await this.findASINInputInModal();

        // 最后的防线：如果找不到输入框，再次检查是不是已经在表单页了
        // 有时候页面加载慢，或者之前的检测漏了
        if (!input && window.pageDetector) {
            console.log('未找到搜索输入框，再次检查页面状态...');
            const pageType = window.pageDetector.detectCurrentPage();
            if (['productDetails', 'safetyCompliance', 'offer', 'images', 'variations'].includes(pageType)) {
                console.log(`✓ 二次检测发现已在表单页面 (${pageType})，终止搜索并返回成功`);
                return { success: true, alreadyOnPage: true };
            }
        }

        if (!input) {
            throw new Error('未找到ASIN搜索输入框（弹出框）');
        }

        // 清空并输入ASIN
        input.focus();
        input.value = '';
        await this.typeText(input, asin);
        console.log(`✓ 已输入ASIN: ${asin}`);

        await this.sleep(500);

        // 查找并点击搜索按钮
        const searchBtn = await this.findSearchButton();

        if (searchBtn) {
            searchBtn.click();
            console.log('✓ 已点击搜索按钮');
        } else {
            // 如果没有搜索按钮，尝试按回车键作为后备方案
            console.log('未找到搜索按钮，尝试按回车键作为后备方案...');

            // 重要：确保输入框有焦点
            input.focus();
            await this.sleep(100);

            // 创建更真实的键盘事件（添加更多属性）
            const enterKeyDown = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                charCode: 13,
                bubbles: true,
                cancelable: true,
                view: window,
                composed: true,  // 重要：允许事件穿透Shadow DOM
                detail: 0,
                isTrusted: false  // 虽然是false但需要设置
            });

            const enterKeyUp = new KeyboardEvent('keyup', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                charCode: 13,
                bubbles: true,
                cancelable: true,
                view: window,
                composed: true,
                detail: 0,
                isTrusted: false
            });

            // 方法1：直接在input上触发（最简单有效）
            console.log('尝试直接在输入框触发回车...');
            input.dispatchEvent(enterKeyDown);
            await this.sleep(50);  // 模拟真实按键间隔
            input.dispatchEvent(enterKeyUp);

            console.log('✓ 已按下回车键');

            // 等待页面响应
            await this.sleep(500);

            // 如果页面没有变化，尝试备用方法
            const currentUrl = window.location.href;
            if (currentUrl === window.location.href) {
                console.log('页面无变化，尝试备用触发方法...');

                // 方法2：在Shadow DOM宿主元素上触发
                const katInput = document.querySelector('kat-predictive-input[data-testid="keywords-input"]');
                if (katInput) {
                    console.log('在kat-predictive-input元素上触发回车...');
                    katInput.dispatchEvent(enterKeyDown);
                    await this.sleep(50);
                    katInput.dispatchEvent(enterKeyUp);
                }

                // 方法3：尝试触发表单提交
                const form = input.closest('form');
                if (form) {
                    console.log('找到表单，尝试提交...');
                    try {
                        // 优先使用requestSubmit（保留验证）
                        if (typeof form.requestSubmit === 'function') {
                            form.requestSubmit();
                        } else {
                            form.submit();
                        }
                    } catch (e) {
                        console.log('表单提交失败:', e);
                    }
                }
            }

            console.log('✓ 搜索触发完成');
        }

        // 等待搜索结果
        console.log('等待搜索结果加载...');
        await this.sleep(1500); // 先等待一下

        try {
            await this.waitForSearchResults(12000);  // 增加超时时间到12秒
            console.log('✓ 搜索结果已加载');
        } catch (err) {
            console.error('搜索结果加载失败:', err);
            // 尝试手动查找一次搜索结果
            console.log('尝试手动查找搜索结果...');
            const result = await this.findFirstSearchResult();
            if (result) {
                console.log('✓ 手动找到搜索结果');
            } else {
                throw new Error('搜索结果加载超时');
            }
        }

        return true;
    }

    /**
     * 步骤4: 点击搜索结果
     */
    async clickSearchResult(asin) {
        this.currentStep = '点击搜索结果';
        console.log(`\n[步骤4] ${this.currentStep} (ASIN: ${asin})`);

        await this.sleep(1000);

        // 等待搜索结果完全加载
        await this.waitForSearchResultsStable();

        // 查找搜索结果（传入ASIN以精确匹配）
        const result = await this.findFirstSearchResult(asin);

        if (!result) {
            throw new Error('未找到搜索结果，ASIN可能不存在');
        }

        // 尝试在结果中找到更具体的点击目标
        // 根据用户反馈，必须点击商品标题
        let clickTarget = result;

        // 1. 查找标题链接 (最优先)
        // 策略：查找文本长度最长的span或div，通常是标题
        const allElements = result.querySelectorAll('*');
        let maxLen = 0;
        let titleElement = null;

        for (const el of allElements) {
            // 排除不可见元素
            if (el.offsetParent === null) continue;

            const text = el.textContent.trim();
            // 标题通常比较长，且不包含ASIN等元数据标签
            if (text.length > maxLen && text.length > 20 &&
                !text.includes('ASIN:') && !text.includes('EAN:')) {
                maxLen = text.length;
                titleElement = el;
            }
        }

        if (titleElement) {
            console.log('✓ 找到疑似商品标题元素 (长度: ' + maxLen + ')');
            clickTarget = titleElement;
        } else {
            // 2. 查找箭头图标 (Chevron) - 备选
            const chevron = result.querySelector('i[class*="chevron"], kat-icon[name*="chevron"], kat-icon[name*="arrow"], .chevron');
            if (chevron) {
                console.log('✓ 找到箭头图标作为点击目标');
                clickTarget = chevron;
            }
        }

        // 点击结果
        console.log('准备点击目标:', clickTarget);

        // 确保元素在视图中
        clickTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await this.sleep(500);

        this.clickElement(clickTarget);
        console.log('✓ 已点击搜索结果');

        await this.sleep(2000); // 点击后多等待一会儿
        return true;
    }

    /**
     * 步骤5: 点击"复制商品信息"
     */
    async clickCopyProduct() {
        this.currentStep = '点击复制商品信息';
        console.log(`\n[步骤5] ${this.currentStep}`);

        // 查找"复制商品信息"按钮
        const copyBtn = await this.findCopyProductButton();

        if (!copyBtn) {
            throw new Error('未找到"复制商品信息"按钮');
        }

        // 点击按钮
        this.clickElement(copyBtn);
        console.log('✓ 已点击"复制商品信息"');

        await this.sleep(2000);
        return true;
    }

    /**
     * 步骤6: 切换到新打开的表单tab
     */
    async switchToFormTab() {
        this.currentStep = '切换到表单tab';
        console.log(`\n[步骤6] ${this.currentStep}`);

        // 注意：这个需要在background.js中处理tab切换
        // 这里只是标记完成
        console.log('✓ 等待表单页面打开...');

        // 等待一下让页面有时间打开
        await this.sleep(2000);

        return true;
    }

    // ========== 元素查找方法 ==========

    /**
     * 查找"添加商品"按钮
     */
    async findAddProductButton() {
        // 策略1: 通过文本内容查找
        const buttons = document.querySelectorAll('button, a, [role="button"]');

        for (const btn of buttons) {
            const text = btn.textContent;
            if (text.includes('添加商品') ||
                text.includes('Add a Product') ||
                text.includes('商品を追加') ||
                text.includes('商品登録') ||
                text.includes('出品する')) {
                console.log('找到按钮:', text);
                return btn;
            }
        }

        // 策略2: 在Shadow DOM中查找
        return this.findInShadowDOMWithPredicate((el) => {
            const text = el.textContent;
            return text.includes('添加商品') ||
                text.includes('Add a Product') ||
                text.includes('商品を追加') ||
                text.includes('商品登録') ||
                text.includes('出品する');
        });
    }

    /**
     * 查找"搜索"标签
     */
    async findSearchTab() {
        // 策略1: 通过文本查找
        const allElements = document.querySelectorAll('*');

        for (const el of allElements) {
            const text = el.textContent.trim();
            if (text === '搜索' || text === 'Search' || text === '検索' || text === 'カタログから商品を検索') {
                // 检查是否可点击
                if (el.tagName === 'BUTTON' ||
                    el.tagName === 'A' ||
                    el.tagName === 'DIV' ||
                    el.role === 'tab') {
                    return el;
                }
            }
        }

        // 策略2: 通过JavaScript点击
        // 如果找不到直接元素，尝试触发点击事件
        return null;
    }

    /**
     * 查找弹出框中的ASIN输入框（专门查找搜索弹窗中的输入框）
     */
    async findASINInputInModal() {
        await this.sleep(500); // 等待弹出框完全显示

        // 策略1: 直接查找普通输入框（根据Chrome MCP实测，输入框不在Shadow DOM中）
        console.log('查找搜索输入框...');

        // 查找具有特定placeholder的输入框
        let input = document.querySelector('input[placeholder="输入商品名称、商品描述或关键词"]');
        if (input) {
            const rect = input.getBoundingClientRect();
            // 确保输入框可见且不是顶部搜索框（顶部搜索框Y坐标通常小于100）
            if (rect.width > 200 && rect.height > 20 && rect.top > 100) {
                console.log('✓ 找到搜索输入框（主搜索区域）');
                return input;
            }
        }

        // 策略2: 如果没找到，尝试查找所有文本输入框
        const allInputs = document.querySelectorAll('input[type="text"], input:not([type])');
        for (const inp of allInputs) {
            const placeholder = inp.getAttribute('placeholder');
            if (placeholder && (
                placeholder.includes('商品名称') ||
                placeholder.includes('商品描述') ||
                placeholder.includes('关键词') ||
                placeholder.includes('ASIN')
            )) {
                const rect = inp.getBoundingClientRect();
                if (rect.width > 200 && rect.height > 20 && rect.top > 100) {
                    console.log('✓ 找到搜索输入框（通过placeholder匹配）');
                    return inp;
                }
            }
        }

        // 策略3: 如果还找不到，检查Shadow DOM（作为后备方案）
        const katInputElements = document.querySelectorAll('kat-predictive-input');
        for (const katInput of katInputElements) {
            const testId = katInput.getAttribute('data-testid');
            if (testId === 'keywords-input') {
                console.log('找到 kat-predictive-input 元素');

                // 访问Shadow DOM
                const shadowRoot = katInput.shadowRoot;
                if (shadowRoot) {
                    const shadowInput = shadowRoot.querySelector('input[type="text"]');
                    if (shadowInput) {
                        console.log('✓ 在Shadow DOM中找到输入框（后备方案）');
                        return shadowInput;
                    }
                }
            }
        }

        // 策略4: 查找页面上任何可见的合适输入框（最后的备用方案）
        const visibleInputs = document.querySelectorAll('input[type="text"], input[type="search"]');
        for (const inp of visibleInputs) {
            const rect = inp.getBoundingClientRect();
            // 检查是否可见且位置合理
            if (rect.width > 200 && rect.height > 20 &&
                rect.top > 100 && rect.top < window.innerHeight) {
                console.log('✓ 找到可见的输入框（备用方案）');
                return inp;
            }
        }

        console.log('❌ 未找到合适的搜索输入框');
        return null;
    }

    /**
     * 查找ASIN输入框（原始方法，可选排除顶部）
     */
    async findASINInput(excludeTop = false) {
        // 策略0: 日本亚马逊搜索页面特定选择器
        let input = document.querySelector('input[placeholder="输入商品名称、商品描述或关键词"]');
        if (input) {
            if (excludeTop) {
                const rect = input.getBoundingClientRect();
                // 如果是顶部搜索框（y坐标小于100），跳过
                if (rect.top < 100) {
                    console.log('跳过顶部搜索框');
                    // 查找其他符合条件的输入框
                    const allInputs = document.querySelectorAll('input[placeholder="输入商品名称、商品描述或关键词"]');
                    for (const inp of allInputs) {
                        const r = inp.getBoundingClientRect();
                        if (r.top > 100) {
                            console.log('找到非顶部的搜索框');
                            return inp;
                        }
                    }
                } else {
                    console.log('找到日本亚马逊搜索框（中文界面）');
                    return input;
                }
            } else {
                console.log('找到日本亚马逊搜索框（中文界面）');
                return input;
            }
        }

        // 策略1: 通过placeholder模糊匹配
        input = document.querySelector('input[placeholder*="商品名称" i], input[placeholder*="商品描述" i], input[placeholder*="关键词" i], input[placeholder*="ASIN" i], input[placeholder*="JAN" i], input[placeholder*="EAN" i], input[placeholder*="ISBN" i]');
        if (input) {
            if (excludeTop) {
                const rect = input.getBoundingClientRect();
                if (rect.top < 100) {
                    console.log('跳过顶部搜索框');
                    return null;
                }
            }
            console.log('找到搜索框（placeholder匹配）');
            return input;
        }

        // 策略2: 通过label查找
        const labels = document.querySelectorAll('label');
        for (const label of labels) {
            const text = label.textContent;
            if (text.includes('ASIN') || text.includes('商品コード') || text.includes('商品番号') || text.includes('输入商品名称')) {
                const inputId = label.getAttribute('for');
                if (inputId) {
                    input = document.getElementById(inputId);
                    if (input) {
                        if (excludeTop) {
                            const rect = input.getBoundingClientRect();
                            if (rect.top < 100) continue;
                        }
                        return input;
                    }
                }

                // label内部的input
                input = label.querySelector('input');
                if (input) {
                    if (excludeTop) {
                        const rect = input.getBoundingClientRect();
                        if (rect.top < 100) continue;
                    }
                    return input;
                }
            }
        }

        // 策略3: 查找附近的input
        const searchContainer = document.querySelector('[class*="search" i], [class*="検索" i]');
        if (searchContainer) {
            input = searchContainer.querySelector('input[type="text"], input[type="search"]');
            if (input) {
                if (excludeTop) {
                    const rect = input.getBoundingClientRect();
                    if (rect.top < 100) return null;
                }
                return input;
            }
        }

        // 策略4: 查找任何可见的文本输入框（作为最后手段）
        const visibleInputs = document.querySelectorAll('input[type="text"], input[type="search"]');
        for (const inp of visibleInputs) {
            const rect = inp.getBoundingClientRect();
            // 检查是否可见且大小合理
            if (rect.width > 100 && rect.height > 20 &&
                rect.top >= 0 && rect.left >= 0) {
                if (excludeTop && rect.top < 100) continue;
                console.log('⚠️ 使用通用搜索框');
                return inp;
            }
        }

        return null;
    }

    /**
     * 查找kat-box元素（日本亚马逊特有）
     */
    async findKatBox() {
        // 策略1: 通过class查找
        let katBox = document.querySelector('kat-box, [class*="kat-box" i], .kat-box');
        if (katBox) {
            console.log('找到kat-box元素（通过class）');
            return katBox;
        }

        // 策略2: 通过自定义元素标签查找
        katBox = document.getElementsByTagName('kat-box')[0];
        if (katBox) {
            console.log('找到kat-box元素（通过标签）');
            return katBox;
        }

        // 策略3: 查找包含特定文本的容器
        const containers = document.querySelectorAll('div[role="button"], div[tabindex="0"], [class*="clickable" i]');
        for (const container of containers) {
            if (container.className && container.className.includes('kat')) {
                console.log('找到类似kat-box的容器');
                return container;
            }
        }

        console.log('⚠️ 未找到kat-box元素');
        return null;
    }

    /**
     * 查找搜索按钮
     */
    async findSearchButton() {
        // 策略0: Amazon自定义组件 (kat-button) - 最高优先级
        // 根据用户截图，这是新的搜索按钮形式
        const katBtn = document.querySelector('kat-button[label="搜索"], kat-button[label="Search"], kat-button[data-testid="omnibox-submit-button"]');
        if (katBtn) {
            console.log('✓ 找到kat-button搜索按钮');
            // 尝试获取内部按钮（如果存在Shadow DOM）
            if (katBtn.shadowRoot) {
                const innerBtn = katBtn.shadowRoot.querySelector('button');
                if (innerBtn) {
                    console.log('  (使用Shadow DOM内部按钮)');
                    return innerBtn;
                }
            }
            return katBtn;
        }

        // 策略1: 通过文本查找（优先找启用状态的按钮）
        const buttons = document.querySelectorAll('button');

        for (const btn of buttons) {
            const text = btn.textContent.trim();
            if (text === '搜索' || text === 'Search' || text.includes('検索')) {
                // 检查按钮是否启用（不是disabled状态）
                if (!btn.disabled && !btn.hasAttribute('disabled')) {
                    console.log('✓ 找到启用的搜索按钮');
                    return btn;
                }
            }
        }

        // 策略2: 查找输入框附近的按钮（通常搜索按钮在输入框旁边）
        const input = document.querySelector('input[placeholder*="商品名称"], input[placeholder*="商品描述"], input[placeholder*="关键词"]');
        if (input) {
            // 查找输入框的父容器
            let parent = input.parentElement;
            let depth = 0;
            while (parent && depth < 3) {
                const nearbyBtn = parent.querySelector('button');
                if (nearbyBtn && !nearbyBtn.disabled) {
                    const btnText = nearbyBtn.textContent.trim();
                    if (btnText === '搜索' || btnText === 'Search' || btnText === '検索' || btnText === '') {
                        console.log('✓ 找到输入框附近的搜索按钮');
                        return nearbyBtn;
                    }
                }
                parent = parent.parentElement;
                depth++;
            }
        }

        // 策略3: 通过类型查找
        const submitBtn = document.querySelector('button[type="submit"]:not([disabled]), input[type="submit"]:not([disabled])');
        if (submitBtn) {
            console.log('✓ 找到提交按钮');
            return submitBtn;
        }

        // 策略4: 通过role="button"查找
        const roleBtns = document.querySelectorAll('[role="button"]');
        for (const btn of roleBtns) {
            const text = btn.textContent.trim();
            if ((text === '搜索' || text === 'Search' || text.includes('検索')) &&
                !btn.getAttribute('aria-disabled')) {
                console.log('✓ 找到role="button"的搜索按钮');
                return btn;
            }
        }

        console.log('❌ 未找到搜索按钮');
        return null;
    }

    /**
     * 查找第一个搜索结果
     * @param {string} asin - 可选，用于精确匹配
     */
    async findFirstSearchResult(asin) {
        console.log(`查找搜索结果${asin ? ` (ASIN: ${asin})` : ''}...`);
        console.log('提示：使用Shadow DOM穿透技术查找搜索结果');
        await this.sleep(1000);

        // 策略-0: 深度Shadow DOM搜索（最高优先级）
        // 直接查找所有具有Shadow DOM的元素，并检查其内容
        console.log('策略0: 深度Shadow DOM搜索...');
        const elementsWithShadow = document.querySelectorAll('*');
        for (const element of elementsWithShadow) {
            if (element.shadowRoot) {
                // 在Shadow DOM中查找列表项
                const shadowItems = element.shadowRoot.querySelectorAll('*');
                for (const item of shadowItems) {
                    const fullText = this.getFullTextContent(item);
                    // 检查是否包含ASIN或产品信息
                    if (asin && fullText.includes(asin)) {
                        console.log(`✓ 在Shadow DOM中找到包含ASIN的元素: <${item.tagName.toLowerCase()}>`);
                        // 返回Shadow Host或找到的元素
                        return element.tagName.startsWith('KAT-') ? element : item;
                    }
                    // 即使没有指定ASIN，也检查是否是产品
                    if (fullText.includes('ASIN') || fullText.includes('EAN') || fullText.includes('JAN')) {
                        console.log(`✓ 在Shadow DOM中找到产品元素`);
                        return element.tagName.startsWith('KAT-') ? element : item;
                    }
                }
            }
        }


        // 策略-0.5: 精确结构查找 (Data-TestID Strategy)
        // 根据用户截图，结果在 div[data-testid="search-results-rows"] > div
        console.log('策略0.5: 精确结构查找 (data-testid="search-results-rows")...');
        const rowsContainer = await this.findInShadowDOMSelector('div[data-testid="search-results-rows"]');
        if (rowsContainer) {
            console.log('✓ 找到搜索结果容器 (search-results-rows)');
            // 获取第一个子div
            const firstRow = rowsContainer.querySelector('div');
            if (firstRow) {
                const text = (firstRow.textContent || '') + (firstRow.innerHTML || '');
                // 再次确认不是"创建新商品" (虽然通常这个容器里都是结果)
                if (!text.includes('创建新商品') && !text.includes('Create a new product')) {
                    console.log('✓ 找到第一个搜索结果行 (通过结构)');
                    return firstRow;
                }
            }
        }

        // 策略-1: 锚点文本搜索 (Anchor Text Strategy)
        // 不依赖特定的标签名 (kat-list-item)，而是依赖内容特征
        // 正确的结果一定包含 "ASIN:" 或 "EAN:"
        // 错误的结果一定包含 "创建新商品"
        console.log('策略1: 锚点文本搜索 (ASIN:/EAN:)...');

        const anchorResult = this.findInShadowDOMWithPredicate(el => {
            // 排除脚本、样式和隐藏元素
            if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return false;

            // 获取文本内容
            const text = (el.textContent || '') + (el.innerHTML || ''); // 简单检查，不用getFullTextContent以提高性能

            // 排除包含"创建新商品"的元素 (绝对黑名单)
            if (text.includes('创建新商品') ||
                text.includes('Create a new product') ||
                text.includes('未找到商品信息') ||
                text.includes('新商品を登録')) {
                return false;
            }

            // 检查是否包含关键锚点文本
            // 注意：我们需要找到包含这些文本的"行容器"，而不是整个body
            // 所以我们检查：包含锚点文本，且不包含太多的子元素（避免选中整个列表容器）
            if (text.includes('ASIN:') || text.includes('EAN:') || text.includes('JAN:')) {
                // 进一步验证：确保它是一个独立的行或卡片
                // 检查子元素数量，如果太多可能是一个大容器
                if (el.children.length > 20) return false;

                // 检查是否是"最深"的有效容器
                // 如果子元素也包含这些文本，说明当前元素是父容器，应该让子元素被选中
                const children = Array.from(el.children);
                const childHasAnchor = children.some(c => {
                    const cText = (c.textContent || '') + (c.innerHTML || '');
                    return cText.includes('ASIN:') || cText.includes('EAN:') || cText.includes('JAN:');
                });

                return !childHasAnchor;
            }

            return false;
        });

        if (anchorResult) {
            console.log('✓ 找到基于锚点文本的搜索结果:', anchorResult);
            // 向上找一下，确保是可点击的容器 (例如 kat-list-item 或 tr)
            // 如果本身就是 div 且看起来像行，就用它
            let container = anchorResult;
            // 尝试向上查找3层，看有没有更像容器的元素
            for (let i = 0; i < 3; i++) {
                if (!container.parentElement) break;
                const p = container.parentElement;
                const pTag = p.tagName.toLowerCase();
                if (pTag === 'kat-list-item' || pTag === 'tr' || p.getAttribute('role') === 'button') {
                    container = p;
                    break;
                }
                // 如果父元素也是包含该文本的（这很正常），且父元素看起来像是一个卡片
                if (p.classList.contains('kat-list-item') || p.getAttribute('data-testid') === 'search-result-item') {
                    container = p;
                    break;
                }
            }
            return container;
        }

        console.log('未找到锚点文本结果，尝试旧的列表项查找...');

        // 策略-2: 查找列表项容器 (kat-list-item) - 作为备选
        // ... (保留之前的逻辑，但加上严格过滤)
        const findAllListItems = async () => {
            const items = [];
            this.findInShadowDOMWithPredicate(el => {
                if (el.tagName === 'KAT-LIST-ITEM' ||
                    (el.tagName === 'TR' && el.hasAttribute('data-asin')) ||
                    (el.tagName === 'DIV' && el.getAttribute('data-testid') === 'search-result-item')) {
                    items.push(el);
                }
                return false;
            });

            // 严格过滤
            return items.filter(item => {
                const text = (item.textContent || '') + (item.innerHTML || '');
                if (text.includes('创建新商品') || text.includes('Create a new product') || text.includes('未找到商品信息')) {
                    return false;
                }
                return true;
            });
        };

        const results = await findAllListItems();
        if (results.length > 0) {
            console.log(`找到 ${results.length} 个备选列表项，返回第一个`);
            return results[0];
        }


        // 策略2: 针对新版UI (kat-list-item)
        // 查找"搜索结果"面板中的列表项
        const searchPanel = this.findSearchPanel();
        if (searchPanel) {
            console.log('策略2: 在搜索结果面板中查找...');
            // 在面板中查找列表项
            const listItems = searchPanel.querySelectorAll('kat-list-item, div[role="button"], li');
            for (const item of listItems) {
                // 确保不是头部或无关元素
                const fullText = this.getFullTextContent(item);
                if (fullText.includes('ASIN') || fullText.includes('EAN') || fullText.includes(asin) ||
                    item.querySelector('img') || item.querySelector('.product-image')) {
                    console.log('✓ 在面板中找到搜索结果项（Shadow DOM支持）');
                    return item;
                }
            }
        }

        // 策略1: 查找kat-list-item (全局)
        const katItems = document.querySelectorAll('kat-list-item');
        for (const item of katItems) {
            const fullText = this.getFullTextContent(item);
            if (fullText.includes('ASIN') || fullText.includes('EAN') || fullText.includes(asin)) {
                console.log('✓ 找到kat-list-item搜索结果（包含Shadow DOM文本）');
                return item;
            }
        }

        // 策略2: 通过产品文本内容查找（最可靠）
        // 查找包含典型产品特征的元素
        const productKeywords = [
            'アイリスオーヤマ', 'IRIS OHYAMA', // 品牌名
            '鍋', 'フライパン', '調理器具',   // 锅具类
            'cm', '㎝', '厘米',              // 尺寸
            'IH対応', 'ガス火', 'IH适用',    // 兼容性
            'コーティング', 'ガラス蓋',      // 材质
            'EAN:', 'ASIN:', 'JAN:',        // 产品编码
            '亚马逊销售排名', 'ランキング',   // 排名
            '両手鍋', '片手鍋',              // 锅的类型
            'ブラック', 'ホワイト'            // 颜色
        ];

        // 查找所有可能的容器元素
        const containers = document.querySelectorAll('div, li, tr, a, article, section, kat-list-item');

        for (const container of containers) {
            const text = this.getFullTextContent(container);

            // 检查是否包含至少2个产品关键词
            let matchCount = 0;
            for (const keyword of productKeywords) {
                if (text.includes(keyword)) {
                    matchCount++;
                    if (matchCount >= 2) break;
                }
            }

            if (matchCount >= 2) {
                const rect = container.getBoundingClientRect();

                // 检查元素位置和大小（排除页面顶部的导航区域）
                if (rect.width > 100 && rect.height > 20 &&
                    rect.top > 100 && rect.top < window.innerHeight && // 放宽top限制
                    rect.left >= 0) {

                    // 检查元素层级（避免选择太大的容器）
                    if (container.children.length <= 15) { // 放宽子元素数量限制
                        // 查找可点击的元素
                        const clickableElement = container.tagName === 'A' ? container :
                            container.querySelector('a, button, [role="button"], [role="link"], kat-link');

                        if (clickableElement) {
                            console.log('✓ 找到搜索结果（通过产品文本）');
                            return clickableElement;
                        }

                        // 如果没有明显的可点击元素，返回容器本身
                        console.log('✓ 找到搜索结果容器（通过产品文本）');
                        return container;
                    }
                }
            }
        }

        // 策略3: 使用选择器列表查找
        const selectors = [
            // kat组件相关（亚马逊可能使用自定义组件）
            'kat-table-row',
            'kat-card[class*="product"]',
            'kat-list-item',

            // 新版UI选择器
            '.kat-list-item',
            '[data-testid="search-result-item"]',

            // 表格行（搜索结果可能以表格形式展示）
            'table tbody tr[class*="result"]',
            'table tbody tr[data-asin]',
            '[role="table"] [role="row"]:not(:first-child)', // 排除表头

            // 通用搜索结果选择器
            '[class*="search-result" i]',
            '[class*="search-item" i]',
            '[class*="catalog-item" i]',
            '[data-testid*="search-result" i]',
            '[data-testid*="product-item" i]',

            // 列表项
            '[role="list"] [role="listitem"]',
            'ul li[class*="result" i]',
            'div[class*="results" i] > div[class*="item" i]',

            // 卡片/块状元素
            '[class*="card"][class*="product"]',
            '[class*="tile"][class*="product"]',

            // 链接（产品链接通常包含/dp/）
            'a[href*="/dp/"]:not([class*="navigation"])',
            'a[href*="product"]:not([class*="navigation"])',

            // 包含ASIN属性的元素
            '[data-asin]:not([data-asin=""])',

            // 通用后备选项
            '.results-container > div',
            '#search-results > div'
        ];

        // 遍历选择器尝试查找
        for (const selector of selectors) {
            try {
                const elements = document.querySelectorAll(selector);

                if (elements.length > 0) {
                    // 过滤掉太小或隐藏的元素
                    for (const element of elements) {
                        const rect = element.getBoundingClientRect();

                        // 确保元素可见且有合理大小，且不在顶部导航区
                        if (rect.width > 50 && rect.height > 20 &&
                            rect.top > 100 && rect.top < window.innerHeight) {

                            console.log(`✓ 找到搜索结果 (选择器: ${selector})`);

                            // 如果元素本身不可点击，查找内部的链接
                            if (element.tagName !== 'A' && element.tagName !== 'KAT-LIST-ITEM') {
                                const link = element.querySelector('a, kat-link');
                                if (link) {
                                    console.log('  找到内部链接');
                                    return link;
                                }
                            }

                            return element;
                        }
                    }
                }
            } catch (e) {
                // 忽略无效的选择器
                continue;
            }
        }

        // 方法4: 查找Shadow DOM中的搜索结果
        const customElements = document.querySelectorAll('*');
        for (const el of customElements) {
            if (el.shadowRoot) {
                const shadowResults = el.shadowRoot.querySelectorAll(
                    '[class*="result"], [class*="search"], [class*="product"], kat-list-item'
                );

                if (shadowResults.length > 0) {
                    console.log(`✓ 在 <${el.tagName.toLowerCase()}> 的Shadow DOM中找到搜索结果`);
                    return shadowResults[0];
                }
            }
        }

        console.log('❌ 未找到搜索结果');
        return null;
    }

    /**
     * 在Shadow DOM中查找元素 (递归) - 使用选择器
     * @param {string} selector - CSS选择器
     * @param {Node} root - 起始节点，默认为document.body
     */
    async findInShadowDOMSelector(selector, root = document.body) {
        try {
            // 1. 在当前root中查找
            if (root.querySelectorAll) {
                const element = root.querySelector(selector);
                if (element) return element;
            }

            // 2. 查找所有Shadow Roots
            let shadowHosts = [];
            if (root.querySelectorAll) {
                // 使用try-catch包裹Array.from和filter
                try {
                    const allElements = root.querySelectorAll('*');
                    shadowHosts = Array.from(allElements).filter(el => el && el.shadowRoot);
                } catch (e) {
                    console.warn('findInShadowDOM: querySelectorAll/filter error', e);
                    // 降级处理
                    if (root.children) {
                        shadowHosts = Array.from(root.children).filter(el => el && el.shadowRoot);
                    }
                }
            } else if (root.children) {
                shadowHosts = Array.from(root.children).filter(el => el && el.shadowRoot);
            }

            // 3. 递归查找
            for (const host of shadowHosts) {
                const found = await this.findInShadowDOMSelector(selector, host.shadowRoot);
                if (found) return found;
            }

            return null;
        } catch (error) {
            console.error('findInShadowDOMSelector internal error:', error);
            throw error;
        }
    }

    /**
     * 查找搜索结果面板
     */
    findSearchPanel() {
        // 查找标题为"搜索结果"或"Search Results"的容器
        const headers = document.querySelectorAll('h1, h2, h3, h4, div[role="heading"]');
        for (const header of headers) {
            if (header.textContent.includes('搜索结果') || header.textContent.includes('Search Results')) {
                // 返回其父容器或最近的面板容器
                return header.closest('div[role="dialog"]') ||
                    header.closest('div[class*="panel"]') ||
                    header.closest('div[class*="modal"]') ||
                    header.parentElement.parentElement;
            }
        }
        return null;
    }

    /**
     * 查找"复制商品信息"按钮
     */
    async findCopyProductButton() {
        // 方法0: 针对新版UI (kat-button) - 最高优先级
        // 根据用户截图，按钮是 kat-button[data-testid="copy-listing"]
        console.log('正在查找"复制商品信息"按钮 (kat-button)...');

        // 尝试通过 data-testid 查找
        const katBtnTestId = await this.findInShadowDOMSelector('kat-button[data-testid="copy-listing"]');
        if (katBtnTestId) {
            console.log('✓ 找到"复制商品信息"按钮 (data-testid="copy-listing")');
            return katBtnTestId;
        }

        // 尝试通过 label 查找
        const katBtnLabel = await this.findInShadowDOMSelector('kat-button[label="复制商品信息"]');
        if (katBtnLabel) {
            console.log('✓ 找到"复制商品信息"按钮 (label="复制商品信息")');
            return katBtnLabel;
        }

        // 尝试在Shadow DOM中查找包含特定文本的按钮
        // 使用更激进的遍历策略，因为querySelector有时候在深层Shadow DOM中会失效
        console.log('使用深度遍历查找复制按钮...');
        const shadowBtn = await this.findInShadowDOMWithPredicate(el => {
            // 检查标签名
            const tagName = el.tagName.toLowerCase();
            if (tagName !== 'button' && tagName !== 'kat-button') return false;

            // 检查属性
            const testId = el.getAttribute('data-testid') || '';
            const label = el.getAttribute('label') || '';

            if (testId === 'copy-listing') return true;
            if (label === '复制商品信息' || label === 'Copy product information') return true;

            // 检查文本内容 (包括Shadow DOM内的文本)
            const text = (el.textContent || '') + (el.innerHTML || '');
            if (text.includes('复制商品信息') || text.includes('Copy product information')) return true;

            // 检查内部的 button 元素 (针对 kat-button)
            if (tagName === 'kat-button' && el.shadowRoot) {
                const innerBtn = el.shadowRoot.querySelector('button');
                if (innerBtn) {
                    const innerText = innerBtn.textContent || '';
                    if (innerText.includes('复制商品信息') || innerText.includes('Copy')) return true;
                }
            }

            return false;
        });

        if (shadowBtn) {
            console.log('✓ 在Shadow DOM中找到"复制商品信息"按钮 (深度匹配)');
            return shadowBtn;
        }

        // 方法1: 通过按钮文本查找 (Light DOM)
        const buttons = document.querySelectorAll('button, kat-button');

        for (const btn of buttons) {
            const text = btn.textContent.trim();
            if (text.includes('复制商品信息') ||
                text.includes('Copy') ||
                text.includes('複製') ||
                text.includes('商品情報をコピー') ||
                text.includes('商品を複製')) {

                const rect = btn.getBoundingClientRect();
                // 确保按钮可见
                if (rect.width > 0 && rect.height > 0 &&
                    rect.top >= 0 && rect.top < window.innerHeight) {
                    console.log('✓ 找到"复制商品信息"按钮');
                    return btn;
                }
            }
        }

        // 方法2: 通过图标或样式查找
        const allButtons = document.querySelectorAll('button, [role="button"], a[class*="button"]');
        for (const btn of allButtons) {
            // 检查是否包含复制相关的图标类
            if (btn.className && (
                btn.className.includes('copy') ||
                btn.className.includes('duplicate') ||
                btn.className.includes('clone'))) {

                const rect = btn.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    console.log('✓ 找到复制按钮（通过类名）');
                    return btn;
                }
            }
        }

        console.log('❌ 未找到"复制商品信息"按钮');
        return null;
    }

    // ========== 辅助方法 ==========

    /**
     * 获取元素的完整文本内容（包括Shadow DOM内部的文本）
     */
    getFullTextContent(element) {
        if (!element) return '';

        let text = '';

        // 如果元素有Shadow DOM，优先获取Shadow DOM内的文本
        if (element.shadowRoot) {
            const shadowText = this.getFullTextContent(element.shadowRoot);
            if (shadowText) {
                text += shadowText;
            }
        }

        // 获取当前节点的文本
        if (element.nodeType === Node.TEXT_NODE) {
            text += element.textContent || '';
        } else if (element.childNodes) {
            // 遍历所有子节点
            for (const child of element.childNodes) {
                if (child.nodeType === Node.TEXT_NODE) {
                    text += child.textContent || '';
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    // 递归获取子元素的文本
                    text += this.getFullTextContent(child);
                }
            }
        }

        return text.trim();
    }

    /**
     * 在Shadow DOM中递归查找（使用predicate函数）
     */
    findInShadowDOMWithPredicate(predicate) {
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
     * 点击元素（支持各种场景）
     */
    clickElement(element) {
        if (!element) return false;

        try {
            // 方法1: 直接点击
            element.click();
            return true;
        } catch (e1) {
            try {
                // 方法2: 触发click事件
                element.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));
                return true;
            } catch (e2) {
                console.error('点击失败:', e2);
                return false;
            }
        }
    }

    /**
     * 模拟打字
     */
    async typeText(element, text) {
        element.value = '';
        element.focus();

        // 模拟真实输入
        for (const char of text) {
            const key = char;
            const code = `Key${char.toUpperCase()}`;

            // 1. keydown
            element.dispatchEvent(new KeyboardEvent('keydown', {
                key: key,
                code: code,
                bubbles: true,
                cancelable: true,
                view: window,
                composed: true
            }));

            // 2. keypress
            element.dispatchEvent(new KeyboardEvent('keypress', {
                key: key,
                code: code,
                bubbles: true,
                cancelable: true,
                view: window,
                composed: true
            }));

            // 3. textInput (旧版但有些网站需要)
            try {
                const textEvent = document.createEvent('TextEvent');
                textEvent.initTextEvent('textInput', true, true, window, char);
                element.dispatchEvent(textEvent);
            } catch (e) { }

            // 4. input (最重要)
            element.value += char;
            element.dispatchEvent(new InputEvent('input', {
                bubbles: true,
                cancelable: false,
                view: window,
                data: char,
                inputType: 'insertText',
                composed: true
            }));

            // 5. keyup
            element.dispatchEvent(new KeyboardEvent('keyup', {
                key: key,
                code: code,
                bubbles: true,
                cancelable: true,
                view: window,
                composed: true
            }));

            await this.sleep(this.randomInt(30, 80));
        }

        // 触发change事件
        element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

        // 触发blur以确保某些验证逻辑运行
        // element.blur(); 
        // element.focus();
    }

    /**
     * 等待页面URL变化
     */
    async waitForPageChange(urlPattern, timeout = 5000) {
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if (window.location.href.includes(urlPattern)) {
                    clearInterval(checkInterval);
                    resolve(true);
                }

                if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error(`等待页面超时: ${urlPattern}`));
                }
            }, 500);
        });
    }

    /**
     * 等待搜索结果加载并稳定
     */
    async waitForSearchResultsStable(timeout = 15000) {
        console.log('等待搜索结果加载并稳定...');
        const startTime = Date.now();
        let lastCount = 0;
        let stableCount = 0;

        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                // 检查搜索结果数量
                // 查找包含ASIN或EAN文本的元素数量作为指标
                const results = document.querySelectorAll('kat-list-item, tr[class*="result"], div[data-asin]');
                const currentCount = results.length;

                // 同时也检查是否有"搜索结果"标题
                try {
                    const allHeaders = document.querySelectorAll('h1, h2, h3, div');
                    const hasHeader = Array.from(allHeaders).some(
                        el => el.textContent && (el.textContent.includes('搜索结果') || el.textContent.includes('Search Results'))
                    );

                    if (currentCount > 0 || hasHeader) {
                        // ... (rest of logic)
                        if (currentCount === lastCount) {
                            stableCount++;
                        } else {
                            stableCount = 0;
                        }
                        lastCount = currentCount;

                        // 如果连续3次检查（1.5秒）数量稳定，或者已经找到了结果且时间超过3秒
                        if (stableCount >= 3 || (currentCount > 0 && Date.now() - startTime > 3000)) {
                            clearInterval(checkInterval);
                            console.log(`✓ 搜索结果已稳定 (数量: ${currentCount})`);
                            resolve(true);
                            return;
                        }
                    }

                    if (Date.now() - startTime > timeout) {
                        clearInterval(checkInterval);
                        console.warn('⚠️ 等待搜索结果稳定超时，继续尝试查找');
                        resolve(true); // 超时也继续，尝试查找
                    }
                } catch (e) {
                    console.error('waitForSearchResultsStable check error:', e);
                }
            }, 500);
        });
    }

    /**
     * 等待搜索结果加载 (旧版)
     */
    async waitForSearchResults(timeout = 10000) {
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(async () => {
                // 需要await异步方法
                const results = await this.findFirstSearchResult();

                if (results) {
                    clearInterval(checkInterval);
                    console.log('✓ 检测到搜索结果');
                    resolve(true);
                }

                if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    console.error('❌ 搜索结果加载超时');
                    reject(new Error('搜索结果加载超时'));
                }
            }, 500);
        });
    }

    /**
     * 延迟
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 随机整数
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 获取当前步骤
     */
    getCurrentStep() {
        return this.currentStep;
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.amazonNavigator = new AmazonNavigator();
    console.log('[Amazon导航器] 全局实例已创建: window.amazonNavigator');
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmazonNavigator;
}
