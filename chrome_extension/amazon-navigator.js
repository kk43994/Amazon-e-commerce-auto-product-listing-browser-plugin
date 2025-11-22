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
            // 步骤1: 导航到添加商品页
            await this.navigateToAddProduct();

            // 步骤2: 切换到搜索标签
            await this.switchToSearchTab();

            // 步骤3: 输入ASIN并搜索
            await this.searchASIN(asin);

            // 步骤4: 点击搜索结果
            await this.clickSearchResult();

            // 步骤5: 点击"复制商品信息"
            await this.clickCopyProduct();

            // 步骤6: 等待并切换到表单tab
            await this.switchToFormTab();

            console.log(`✅ ASIN搜索流程完成`);
            return { success: true };

        } catch (error) {
            console.error(`❌ ASIN搜索流程失败:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 步骤1: 导航到添加商品页
     */
    async navigateToAddProduct() {
        this.currentStep = '导航到添加商品页';
        console.log(`\n[步骤1] ${this.currentStep}`);

        // 检查是否已在添加商品页
        if (window.location.href.includes('/add-product')) {
            console.log('✓ 已在添加商品页');
            return true;
        }

        // 查找"添加商品"按钮
        const addProductBtn = await this.findAddProductButton();

        if (!addProductBtn) {
            throw new Error('未找到"添加商品"按钮');
        }

        // 点击按钮
        addProductBtn.click();
        console.log('✓ 已点击"添加商品"按钮');

        // 等待页面加载
        await this.waitForPageChange('/add-product', 5000);
        console.log('✓ 添加商品页面已加载');

        return true;
    }

    /**
     * 步骤2: 切换到搜索标签
     */
    async switchToSearchTab() {
        this.currentStep = '切换到搜索标签';
        console.log(`\n[步骤2] ${this.currentStep}`);

        await this.sleep(1000);

        // 查找"搜索"标签（可能需要点击）
        const searchTab = await this.findSearchTab();

        if (!searchTab) {
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

        // 查找ASIN输入框
        const input = await this.findASINInput();

        if (!input) {
            throw new Error('未找到ASIN输入框');
        }

        // 输入ASIN
        input.focus();
        input.value = '';
        await this.typeText(input, asin);
        console.log(`✓ 已输入ASIN: ${asin}`);

        await this.sleep(500);

        // 查找并点击搜索按钮
        const searchBtn = await this.findSearchButton();

        if (!searchBtn) {
            throw new Error('未找到搜索按钮');
        }

        searchBtn.click();
        console.log('✓ 已点击搜索按钮');

        // 等待搜索结果
        await this.waitForSearchResults(5000);
        console.log('✓ 搜索结果已加载');

        return true;
    }

    /**
     * 步骤4: 点击搜索结果
     */
    async clickSearchResult() {
        this.currentStep = '点击搜索结果';
        console.log(`\n[步骤4] ${this.currentStep}`);

        await this.sleep(1000);

        // 查找第一个搜索结果
        const result = await this.findFirstSearchResult();

        if (!result) {
            throw new Error('未找到搜索结果，ASIN可能不存在');
        }

        // 点击结果
        this.clickElement(result);
        console.log('✓ 已点击搜索结果');

        await this.sleep(1500);
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
            if (btn.textContent.includes('添加商品') ||
                btn.textContent.includes('Add a Product')) {
                return btn;
            }
        }

        // 策略2: 在Shadow DOM中查找
        return this.findInShadowDOM((el) => {
            return el.textContent.includes('添加商品') ||
                   el.textContent.includes('Add a Product');
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
            if (text === '搜索' || text === 'Search') {
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
     * 查找ASIN输入框
     */
    async findASINInput() {
        // 策略1: 通过placeholder查找
        let input = document.querySelector('input[placeholder*="ASIN" i]');
        if (input) return input;

        // 策略2: 通过label查找
        const labels = document.querySelectorAll('label');
        for (const label of labels) {
            if (label.textContent.includes('ASIN')) {
                const inputId = label.getAttribute('for');
                if (inputId) {
                    input = document.getElementById(inputId);
                    if (input) return input;
                }

                // label内部的input
                input = label.querySelector('input');
                if (input) return input;
            }
        }

        // 策略3: 查找附近的input
        const searchContainer = document.querySelector('[class*="search" i]');
        if (searchContainer) {
            input = searchContainer.querySelector('input[type="text"]');
            if (input) return input;
        }

        return null;
    }

    /**
     * 查找搜索按钮
     */
    async findSearchButton() {
        // 策略1: 通过文本查找
        const buttons = document.querySelectorAll('button');

        for (const btn of buttons) {
            const text = btn.textContent.trim();
            if (text === '搜索' || text === 'Search' ||
                text.includes('検索')) {
                return btn;
            }
        }

        // 策略2: 通过类型查找
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) return submitBtn;

        return null;
    }

    /**
     * 查找第一个搜索结果
     */
    async findFirstSearchResult() {
        await this.sleep(1000);

        // 策略1: 通过类名查找
        let result = document.querySelector('[class*="search-result" i]');
        if (result) return result;

        // 策略2: 通过结构查找（列表的第一项）
        const resultsList = document.querySelector('[class*="results" i], [role="list"]');
        if (resultsList) {
            result = resultsList.querySelector('[role="listitem"], li, [class*="item" i]');
            if (result) return result;
        }

        // 策略3: 查找包含商品信息的卡片
        const cards = document.querySelectorAll('[class*="card" i], [class*="product" i]');
        if (cards.length > 0) return cards[0];

        return null;
    }

    /**
     * 查找"复制商品信息"按钮
     */
    async findCopyProductButton() {
        const buttons = document.querySelectorAll('button');

        for (const btn of buttons) {
            if (btn.textContent.includes('复制商品信息') ||
                btn.textContent.includes('Copy') ||
                btn.textContent.includes('商品情報をコピー')) {
                return btn;
            }
        }

        return null;
    }

    // ========== 辅助方法 ==========

    /**
     * 在Shadow DOM中递归查找
     */
    findInShadowDOM(predicate) {
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

        for (const char of text) {
            element.value += char;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            await this.sleep(this.randomInt(50, 150));
        }

        element.dispatchEvent(new Event('change', { bubbles: true }));
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
     * 等待搜索结果加载
     */
    async waitForSearchResults(timeout = 5000) {
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                const results = this.findFirstSearchResult();

                if (results) {
                    clearInterval(checkInterval);
                    resolve(true);
                }

                if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
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
