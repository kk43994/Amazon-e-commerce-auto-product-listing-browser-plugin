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

        // 定时检测
        this.monitoringInterval = setInterval(() => {
            this.detectAndValidate();
        }, interval);
    }

    /**
     * 停止监控
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
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

        if (url.includes('/product_details')) return 'productDetails';
        if (url.includes('/safety_and_compliance')) return 'safetyCompliance';
        if (url.includes('/offer')) return 'offer';
        if (url.includes('/images')) return 'images';
        if (url.includes('/variations')) return 'variations';
        if (url.includes('/add-product')) return 'addProduct';
        if (url.includes('sellercentral')) {
            if (url.endsWith('/home') || url === 'https://sellercentral-japan.amazon.com/') {
                return 'home';
            }
        }

        // 策略2: 页面标题
        const title = document.title;
        if (title.includes('Add a Product')) return 'addProduct';
        if (title.includes('Product Details')) return 'productDetails';

        // 策略3: DOM特征分析
        const features = this.analyzePageFeatures();

        // 产品详情页特征
        if (features.hasProductName && features.hasBrand && features.hasDescription) {
            return 'productDetails';
        }

        // 报价页特征
        if (features.hasQuantity && features.hasPrice && features.hasFulfillment) {
            return 'offer';
        }

        // 图片页特征
        if (features.hasImageUpload) {
            return 'images';
        }

        // 安全合规页特征
        if (features.hasWarranty && features.hasDangerousGoods) {
            return 'safetyCompliance';
        }

        // 策略4: 特定元素ID检测
        if (document.getElementById('ProductImage_MAIN-input_input')) {
            return 'images';
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
            hasProductName: text.includes('商品名称') || text.includes('Product Title'),
            hasBrand: text.includes('品牌名') || text.includes('Brand Name'),
            hasDescription: text.includes('产品描述') || text.includes('Product Description'),
            hasBulletPoints: text.includes('要点') || text.includes('Bullet Points'),

            // 报价页特征
            hasQuantity: text.includes('数量') || text.includes('Quantity'),
            hasPrice: text.includes('您的价格') || text.includes('Your Price'),
            hasFulfillment: text.includes('配送渠道') || text.includes('Fulfillment'),

            // 图片页特征
            hasImageUpload: text.includes('上传多个文件') || text.includes('Upload multiple'),
            hasMainImage: text.includes('主图片') || text.includes('Main Image'),

            // 安全合规页特征
            hasWarranty: text.includes('保修说明') || text.includes('Warranty'),
            hasDangerousGoods: text.includes('危险商品规管') || text.includes('Dangerous Goods'),
            hasCountryOfOrigin: text.includes('原产国') || text.includes('Country of Origin')
        };
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
