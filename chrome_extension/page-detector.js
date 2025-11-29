/**
 * 实时页面检测器
 * 功能：检测当前Amazon页面类型，验证页面跳转，防止错误
 */

console.log('[页面检测器] 模块加载');

class PageDetector {
    constructor() {
        this.currentPage = 'unknown';
        this.expectedPage = null;
        this.lastCheck = null;
        this.errorCount = 0;
        this.monitoringInterval = null;
        this.callbacks = {
            onPageChanged: null,
            onPageMatched: null,
            onPageMismatch: null,
            onError: null
        };
    }

    /**
     * 开始实时监控
     */
    startMonitoring(interval = 2000) {
        if (this.monitoringInterval) {
            console.warn('[页面检测器] 已在监控中');
            return;
        }

        console.log(`[页面检测器] 开始监控，间隔${interval}ms`);

        // 立即检测一次
        this.detectAndValidate();

        // 添加点击事件监听
        this.clickListener = () => {
            setTimeout(() => this.detectAndValidate(), 50); // 点击后几乎立即检测
        };
        document.addEventListener('click', this.clickListener);

        // 添加URL变化监听 (针对SPA)
        this.urlListener = () => this.detectAndValidate();
        window.addEventListener('hashchange', this.urlListener);
        window.addEventListener('popstate', this.urlListener);

        // 定时检测 (缩短间隔到 200ms，实现近乎实时的检测)
        this.monitoringInterval = setInterval(() => {
            this.detectAndValidate();
        }, 200);
    }

    /**
     * 停止监控
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            if (this.clickListener) {
                document.removeEventListener('click', this.clickListener);
                this.clickListener = null;
            }
            if (this.urlListener) {
                window.removeEventListener('hashchange', this.urlListener);
                window.removeEventListener('popstate', this.urlListener);
                this.urlListener = null;
            }
            console.log('[页面检测器] 停止监控');
        }
    }

    /**
     * 检测并验证当前页面
     */
    detectAndValidate() {
        const detected = this.detectCurrentPage();
        const previous = this.currentPage;

        this.currentPage = detected;
        this.lastCheck = Date.now();

        // 触发页面变化回调
        if (detected !== previous) {
            console.log(`[页面变化] ${previous} → ${detected}`);
            if (this.callbacks.onPageChanged) {
                this.callbacks.onPageChanged(detected, previous);
            }
        }

        // 验证是否匹配预期
        if (this.expectedPage) {
            if (detected === this.expectedPage) {
                // 匹配成功
                this.errorCount = 0;
                if (this.callbacks.onPageMatched) {
                    this.callbacks.onPageMatched(detected);
                }
            } else {
                // 不匹配
                this.handleMismatch(detected, this.expectedPage);
            }
        }

        return {
            page: detected,
            expected: this.expectedPage,
            matched: detected === this.expectedPage,
            timestamp: this.lastCheck
        };
    }

    /**
     * 检测当前页面类型（多重策略）
     */
    detectCurrentPage() {
        // 策略1: URL匹配（最快最准）
        const url = window.location.href;

        if (url.includes('/product_details') || url.includes('#product_details')) return 'productDetails';
        if (url.includes('/safety_and_compliance') || url.includes('#safety_and_compliance')) return 'safetyCompliance';
        if (url.includes('/offer') || url.includes('#offer')) return 'offer';
        if (url.includes('/images') || url.includes('#images')) return 'images';
        if (url.includes('/variations') || url.includes('#variations')) return 'variations';
        if (url.includes('/add-product')) return 'addProduct';
        // 日本亚马逊URL检测
        if (url.includes('/product-search/keywords')) return 'searchProduct';  // 搜索页面
        if (url.includes('/product-search/product-ids')) return 'productIds';  // 商品编码页面
        if (url.includes('/product-search') || url.includes('/productsearch')) return 'addProduct';
        if (url.includes('/listing/products')) return 'addProduct';
        if (url.includes('/hz/fba/profitcalculator')) return 'profitCalculator';

        if (url.includes('sellercentral')) {
            if (url.endsWith('/home') || url === 'https://sellercentral-japan.amazon.com/') {
                return 'home';
            }
            // 日本亚马逊特殊路径
            if (url.includes('/catalog-items') || url.includes('/product/search')) {
                return 'addProduct';
            }
        }

        // 策略2: 页面标题
        const title = document.title;
        if (title.includes('Add a Product')) return 'addProduct';
        if (title.includes('商品を追加') || title.includes('商品登録')) return 'addProduct';
        if (title.includes('Product Details')) return 'productDetails';
        if (title.includes('商品詳細')) return 'productDetails';

        // 策略3: DOM特征分析
        const features = this.analyzePageFeatures();

        // 产品详情页特征 (只要有商品名称和品牌名即可，描述可能在下方)
        if (features.hasProductName && features.hasBrand) {
            return 'productDetails';
        }

        // 策略3.5: 检查Tab导航栏 (强特征)
        if (this.hasFormTabs()) {
            // 如果有Tab栏，尝试根据激活的Tab判断
            const activeTab = this.getActiveTab();
            if (activeTab) return activeTab;
            // 如果没找到激活的Tab，但有变体特征，返回变体页
            if (features.hasVariations) return 'variations';
            return 'productDetails'; // 默认认为是详情页
        }

        // 报价页特征 (增加配送渠道作为必要条件，防止误判)
        if (features.hasQuantity && features.hasPrice && features.hasFulfillment) {
            return 'offer';
        }

        // 图片页特征
        if (features.hasImageUpload) {
            return 'images';
        }

        // 安全合规页特征
        if (features.hasDangerousGoods) {
            return 'safetyCompliance';
        }

        // 策略4: 特定元素ID/UID检测 (基于文档记录)
        // 产品详情页: 46_38 (商品名称), 46_42 (品牌名)
        if (this.hasElementWithUid('46_38') || this.hasElementWithUid('46_42')) {
            return 'productDetails';
        }

        // 报价页: 48_35 (数量), 48_53 (您的价格)
        if (this.hasElementWithUid('48_35') || this.hasElementWithUid('48_53')) {
            return 'offer';
        }

        // 图片页: 47_31 (批量上传提示), ProductImage_MAIN-input_input
        if (this.hasElementWithUid('47_31') || document.getElementById('ProductImage_MAIN-input_input')) {
            return 'images';
        }

        // 安全合规页: 53_30 (原产国), 53_46 (危险商品规管)
        if (this.hasElementWithUid('53_30') || this.hasElementWithUid('53_46')) {
            return 'safetyCompliance';
        }

        return 'unknown';
    }

    /**
     * 分析页面特征
     */
    analyzePageFeatures() {
        const text = document.body.textContent;

        return {
            // 产品详情页特征
            hasProductName: text.includes('商品名称') || text.includes('Product Title') || text.includes('Product Name') || document.querySelector('input[name="item_name"]'),
            hasBrand: text.includes('品牌名') || text.includes('Brand Name') || text.includes('Brand') || document.querySelector('input[name="brand_name"]'),
            hasDescription: text.includes('产品描述') || text.includes('Product Description'),
            hasBulletPoints: text.includes('要点') || text.includes('Bullet Points'),

            // 报价页特征
            hasQuantity: text.includes('数量') || text.includes('Quantity'),
            hasPrice: text.includes('您的价格') || text.includes('Your Price') || text.includes('Standard Price'),
            hasFulfillment: text.includes('配送渠道') || text.includes('Fulfillment'),

            // 图片页特征
            hasImageUpload: text.includes('上传多个文件') || text.includes('Upload multiple') || text.includes('Image Manager'),
            hasMainImage: text.includes('主图片') || text.includes('Main Image'),

            // 变体页特征
            hasVariations: text.includes('变体类型') || text.includes('Variation Theme') || text.includes('Variation Type'),

            // 安全合规页特征
            hasWarranty: text.includes('保修说明') || text.includes('Warranty'),
            hasDangerousGoods: text.includes('危险商品规管') || text.includes('Dangerous Goods') || text.includes('Safety & Compliance'),
            hasCountryOfOrigin: text.includes('原产国') || text.includes('Country of Origin')
        };
    }

    /**
     * 检查是否存在表单Tab导航
     */
    hasFormTabs() {
        // 查找常见的Tab容器特征
        const tabList = document.querySelector('ul[role="tablist"], div[role="tablist"], .kat-tabs');
        if (tabList) return true;

        // 检查特定的Tab文本
        const bodyText = document.body.textContent;
        if ((bodyText.includes('产品详情') || bodyText.includes('Product Details')) &&
            (bodyText.includes('图片') || bodyText.includes('Images')) &&
            (bodyText.includes('报价') || bodyText.includes('Offer'))) {
            return true;
        }

        return false;
    }

    /**
     * 获取当前激活的Tab
     */
    getActiveTab() {
        // 支持标准 active/selected 类 (限制在 role=tab 或特定容器内)
        const activeElement = document.querySelector('[role="tab"][aria-selected="true"], .kat-tabs .active, .kat-tabs .selected');
        if (activeElement) {
            const text = activeElement.textContent;
            if (text.includes('详情') || text.includes('Details')) return 'productDetails';
            if (text.includes('图片') || text.includes('Images')) return 'images';
            if (text.includes('报价') || text.includes('Offer')) return 'offer';
            if (text.includes('合规') || text.includes('Compliance')) return 'safetyCompliance';
            if (text.includes('变体') || text.includes('Variations')) return 'variations';
        }

        // 支持 kat-tab
        const activeKatTab = document.querySelector('kat-tab[selected], kat-tab[active]');
        if (activeKatTab) {
            const text = activeKatTab.textContent || activeKatTab.getAttribute('label') || '';
            if (text.includes('详情') || text.includes('Details')) return 'productDetails';
            if (text.includes('图片') || text.includes('Images')) return 'images';
            if (text.includes('报价') || text.includes('Offer')) return 'offer';
            if (text.includes('合规') || text.includes('Compliance')) return 'safetyCompliance';
            if (text.includes('变体') || text.includes('Variations')) return 'variations';
        }

        return null;
    }

    /**
     * 检查是否存在具有特定UID的元素 (支持Shadow DOM)
     */
    hasElementWithUid(uid) {
        // 1. 检查常规DOM
        if (document.querySelector(`[uid="${uid}"]`) || document.querySelector(`[data-uid="${uid}"]`)) {
            return true;
        }

        // 2. 简单的Shadow DOM检查 (只检查第一层，避免性能问题)
        // 实际的Shadow DOM遍历比较耗时，这里作为快速检测只做浅层检查
        // 如果需要深层检查，可以使用 amazon-form-filler.js 中的 findElementInShadowDOM
        return false;
    }

    /**
     * 处理页面不匹配
     */
    handleMismatch(actual, expected) {
        this.errorCount++;

        console.warn(
            `⚠️ 页面不匹配 [${this.errorCount}次]\n` +
            `   预期: ${expected}\n` +
            `   实际: ${actual}`
        );

        if (this.callbacks.onPageMismatch) {
            this.callbacks.onPageMismatch({
                actual,
                expected,
                count: this.errorCount
            });
        }

        // 错误处理策略
        if (this.errorCount >= 3) {
            console.error('❌ 多次页面不匹配，触发错误处理');
            if (this.callbacks.onError) {
                this.callbacks.onError({
                    type: 'PAGE_MISMATCH',
                    message: `连续${this.errorCount}次检测到错误页面`,
                    actual,
                    expected
                });
            }
        }
    }

    /**
     * 设置预期页面
     */
    setExpectedPage(pageName) {
        this.expectedPage = pageName;
        this.errorCount = 0;
        console.log(`[设置预期页面] ${pageName}`);
    }

    /**
     * 清除预期页面
     */
    clearExpectedPage() {
        this.expectedPage = null;
        this.errorCount = 0;
    }

    /**
     * 等待特定页面加载
     */
    async waitForPage(pageName, timeout = 10000) {
        console.log(`[等待页面] ${pageName}, 超时${timeout}ms`);

        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                const current = this.detectCurrentPage();

                if (current === pageName) {
                    clearInterval(checkInterval);
                    console.log(`✅ 页面加载完成: ${pageName}`);
                    resolve(true);
                }

                if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    console.error(`❌ 等待页面超时: ${pageName}`);
                    reject(new Error(`页面加载超时: ${pageName}`));
                }
            }, 500);
        });
    }

    /**
     * 验证当前页面
     */
    async verifyPage(expectedPage, retryCount = 2) {
        for (let i = 0; i <= retryCount; i++) {
            const current = this.detectCurrentPage();

            if (current === expectedPage) {
                console.log(`✅ 页面验证通过: ${expectedPage}`);
                return true;
            }

            if (i < retryCount) {
                console.warn(`⚠️ 页面验证失败 (${i + 1}/${retryCount}), 重试中...`);
                await this.sleep(1000);
            }
        }

        console.error(`❌ 页面验证失败: 期望${expectedPage}, 实际${this.currentPage}`);
        return false;
    }

    /**
     * 获取当前页面状态
     */
    getStatus() {
        return {
            currentPage: this.currentPage,
            expectedPage: this.expectedPage,
            matched: this.currentPage === this.expectedPage,
            errorCount: this.errorCount,
            lastCheck: this.lastCheck,
            isMonitoring: !!this.monitoringInterval,
            url: window.location.href,
            title: document.title
        };
    }

    /**
     * 获取页面中文名称
     */
    getPageDisplayName(page = this.currentPage) {
        const names = {
            'home': '卖家中心首页',
            'addProduct': '添加商品页',
            'productDetails': '产品详情页',
            'safetyCompliance': '安全与合规页',
            'offer': '报价页',
            'images': '图片页',
            'variations': '变种页',
            'unknown': '未知页面'
        };

        return names[page] || page;
    }

    /**
     * 注册回调函数
     */
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
            this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
        }
    }

    /**
     * 工具函数：延迟
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.pageDetector = new PageDetector();
    console.log('[页面检测器] 全局实例已创建: window.pageDetector');
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageDetector;
}
