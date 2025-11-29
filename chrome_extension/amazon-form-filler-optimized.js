/**
 * Amazon Japan Seller Central 商品表单自动填写模块 - 优化版
 * 基于2025-11-27采集的实际页面元素
 * 优化版本：修复UID错误，添加必填字段，改进下拉框处理
 */

console.log('[Amazon表单填写器-优化版] 模块加载');

// ==================== 基于实际页面的字段配置 ====================
const AMAZON_FIELDS_OPTIMIZED = {
    // === 产品详情页 (基于实际UID) ===
    productDetails: {
        // 必填字段
        title: { uid: '46_38', type: 'textbox', multiline: true, required: true },
        brand: { uid: '46_42', type: 'textbox', required: true },
        noBrand: { uid: '46_43', type: 'checkbox' }, // 无品牌选项
        productId: { uid: '46_48', type: 'textbox', required: true },
        productIdType: { uid: '46_53-46_54', type: 'dropdown', required: true }, // 重要！之前缺失
        noProductId: { uid: '46_56', type: 'checkbox' }, // 无产品编码选项
        browseNode: { uid: '46_64-46_65', type: 'selector', required: true }, // 重要！之前缺失
        model: { uid: '46_71', type: 'textbox', required: true },
        manufacturer: { uid: '46_75', type: 'textbox', required: true },
        description: { uid: '46_79', type: 'textbox', multiline: true, required: true },

        // Bullet Points (要点)
        bulletPoint1: { uid: '46_83', type: 'textbox', multiline: true, required: true },
        bulletPoint2: { uid: '46_84', type: 'textbox', multiline: true },
        bulletPoint3: { uid: '46_85', type: 'textbox', multiline: true },
        bulletPoint4: { uid: '46_86', type: 'textbox', multiline: true },

        // 推荐字段
        searchKeywords: { uid: '46_94', type: 'textbox' },
        specialFeatures: { uid: '46_99', type: 'textbox' },
        style: { uid: '46_104', type: 'textbox' },
        material: { uid: '46_107', type: 'textbox' },
        productQuantity: { uid: '46_112', type: 'spinbutton' },
        color: { uid: '46_127', type: 'textbox' },
        size: { uid: '46_130', type: 'textbox' },
        partNumber: { uid: '46_138', type: 'textbox' },

        // 尺寸字段
        lengthUnit: { uid: '46_256-46_257', type: 'dropdown', required: true },
        length: { uid: '46_262', type: 'spinbutton', required: true },
        widthUnit: { uid: '46_266-46_267', type: 'dropdown', required: true },
        width: { uid: '46_272', type: 'spinbutton', required: true },

        // 其他必填
        distributionDesignation: { uid: '46_150-46_151', type: 'dropdown', required: true },
        isExclusive: { uid: '46_156-46_159', type: 'radio', required: true },
        components: { uid: '46_223', type: 'textbox', required: true }
    },

    // === 图片页 ===
    images: {
        mainImageSlot: { uid: '47_36-47_38', type: 'upload_slot' },
        imageSlot2: { uid: '47_39', type: 'upload_slot' },
        imageSlot3: { uid: '47_40', type: 'upload_slot' },
        imageSlot4: { uid: '47_41', type: 'upload_slot' },
        imageSlot5: { uid: '47_42', type: 'upload_slot' },
        imageSlot6: { uid: '47_43', type: 'upload_slot' },
        imageSlot7: { uid: '47_44', type: 'upload_slot' },
        imageSlot8: { uid: '47_45', type: 'upload_slot' },
        imageSlot9: { uid: '47_46', type: 'upload_slot' }
    },

    // === 报价页 ===
    offer: {
        sku: { uid: '48_31', type: 'textbox' },
        quantity: { uid: '48_35', type: 'textbox', required: true },
        handlingTime: { uid: '48_38', type: 'textbox' },
        yourPrice: { uid: '48_53', type: 'textbox', required: true },
        listPrice: { uid: '48_95', type: 'textbox', required: true },

        // 商品状况（重要！）
        condition: { uid: '48_88-48_89', type: 'dropdown', required: true },

        // 配件（下拉选项）
        accessories: { uid: '48_132-48_133', type: 'dropdown' },

        // 配送渠道
        fulfillmentFBM: { uid: '48_163', type: 'radio' },
        fulfillmentFBA: { uid: '48_168', type: 'radio' },

        // 产品尺寸（FBA必需）
        itemHeightUnit: { uid: '48_180-48_181', type: 'dropdown', required: true },
        itemHeight: { uid: '48_186', type: 'spinbutton', required: true },
        itemLengthUnit: { uid: '48_191-48_192', type: 'dropdown', required: true },
        itemLength: { uid: '48_197', type: 'spinbutton', required: true },
        itemWidthUnit: { uid: '48_202-48_203', type: 'dropdown', required: true },
        itemWidth: { uid: '48_208', type: 'spinbutton', required: true },

        // 包装尺寸
        packageHeightUnit: { uid: '48_215-48_216', type: 'dropdown', required: true },
        packageHeight: { uid: '48_221', type: 'spinbutton', required: true },
        packageLengthUnit: { uid: '48_226-48_227', type: 'dropdown', required: true },
        packageLength: { uid: '48_232', type: 'spinbutton', required: true },
        packageWidthUnit: { uid: '48_237-48_238', type: 'dropdown', required: true },
        packageWidth: { uid: '48_243', type: 'spinbutton', required: true },
        packageWeight: { uid: '48_249', type: 'spinbutton', required: true },
        packageWeightUnit: { uid: '48_253-48_254', type: 'dropdown', required: true }
    },

    // === 安全与合规页 ===
    safetyCompliance: {
        countryOfOrigin: { uid: '53_30-53_31', type: 'dropdown', required: true },
        warranty: { uid: '53_34', type: 'textbox' },
        dangerousGoods: { uid: '53_46-53_48', type: 'dropdown', required: true },
        itemWeight: { uid: '53_56', type: 'spinbutton', required: true },
        itemWeightUnit: { uid: '53_60-53_62', type: 'dropdown', required: true }
    }
};

// ==================== 下拉框选项配置 ====================
const DROPDOWN_OPTIONS = {
    // 外部产品ID类型
    productIdType: {
        'JAN': 'JAN',
        'EAN': 'EAN',
        'UPC': 'UPC/EAN/GTIN',
        'GTIN': 'UPC/EAN/GTIN'
    },

    // 商品状况
    condition: {
        'new': '新品',
        'used_like_new': '中古-ほぼ新品',
        'used_very_good': '中古-非常に良い',
        'used_good': '中古-良い',
        'used_acceptable': '中古-許容可能'
    },

    // 配件类型
    accessories: {
        'OEM': 'OEM',
        'generic': '一般',
        'not_applicable': '該当なし',
        'not_included': '含まれていない'
    },

    // 单位
    lengthUnit: {
        'cm': 'センチメートル',
        'inch': 'インチ',
        'meter': 'メートル'
    },

    weightUnit: {
        'kg': 'キログラム',
        'g': 'グラム',
        'pound': 'ポンド'
    },

    // 原产地
    countryOfOrigin: {
        'CN': '中国',
        'JP': '日本',
        'US': 'アメリカ',
        'KR': '韓国',
        'TW': '台湾'
    }
};

// ==================== Excel到Amazon字段映射（优化版） ====================
const EXCEL_TO_AMAZON_MAPPING_OPTIMIZED = {
    // 产品详情
    '商品名称': 'productDetails.title',
    'title': 'productDetails.title',

    '品牌': 'productDetails.brand',
    'brand': 'productDetails.brand',

    '外部产品ID': 'productDetails.productId',
    'product_id': 'productDetails.productId',
    'jan_code': 'productDetails.productId',
    'ean_code': 'productDetails.productId',

    '外部产品ID类型': 'productDetails.productIdType',
    'product_id_type': 'productDetails.productIdType',

    '浏览节点': 'productDetails.browseNode',
    'category': 'productDetails.browseNode',

    '型号': 'productDetails.model',
    'model': 'productDetails.model',

    '制造商': 'productDetails.manufacturer',
    'manufacturer': 'productDetails.manufacturer',

    '产品描述': 'productDetails.description',
    'description': 'productDetails.description',

    '要点1': 'productDetails.bulletPoint1',
    'bullet_point_1': 'productDetails.bulletPoint1',

    '要点2': 'productDetails.bulletPoint2',
    'bullet_point_2': 'productDetails.bulletPoint2',

    '要点3': 'productDetails.bulletPoint3',
    'bullet_point_3': 'productDetails.bulletPoint3',

    '要点4': 'productDetails.bulletPoint4',
    'bullet_point_4': 'productDetails.bulletPoint4',

    '搜索关键词': 'productDetails.searchKeywords',
    'keywords': 'productDetails.searchKeywords',

    '材料': 'productDetails.material',
    'material': 'productDetails.material',

    '颜色': 'productDetails.color',
    'color': 'productDetails.color',

    // 报价
    'SKU': 'offer.sku',
    'sku': 'offer.sku',

    '数量': 'offer.quantity',
    'quantity': 'offer.quantity',

    '价格': 'offer.yourPrice',
    'price': 'offer.yourPrice',

    '标价': 'offer.listPrice',
    'list_price': 'offer.listPrice',

    '商品状况': 'offer.condition',
    'condition': 'offer.condition',

    '配送方式': 'offer.fulfillment',
    'fulfillment': 'offer.fulfillment',

    // 安全与合规
    '原产地': 'safetyCompliance.countryOfOrigin',
    'country_of_origin': 'safetyCompliance.countryOfOrigin',

    '保修': 'safetyCompliance.warranty',
    'warranty': 'safetyCompliance.warranty'
};

// ==================== 核心类：优化版表单填充器 ====================
class AmazonFormFillerOptimized {
    constructor() {
        this.currentPage = null;
        this.filledFields = [];
        this.errors = [];
        this.logger = new Logger();
    }

    /**
     * 主填充方法
     */
    async fillCurrentPage(productData, settings = {}) {
        const {
            humanLikeTyping = true,
            delayBetweenFields = 500,
            validateRequired = true,
            autoSelectDropdown = true
        } = settings;

        try {
            // 1. 检测当前页面
            this.currentPage = this.detectCurrentPage();
            this.logger.log('INFO', 'PAGE_DETECT', `当前页面: ${this.currentPage}`);

            // 2. 预处理数据
            const processedData = this.preprocessData(productData);

            // 3. 获取当前页面的字段配置
            const pageFields = AMAZON_FIELDS_OPTIMIZED[this.currentPage];
            if (!pageFields) {
                throw new Error(`未知页面类型: ${this.currentPage}`);
            }

            // 4. 按优先级填写字段
            const fieldsByPriority = this.sortFieldsByPriority(pageFields);

            for (const [fieldName, fieldConfig] of fieldsByPriority) {
                const value = this.getFieldValue(fieldName, processedData);

                if (value !== undefined && value !== null && value !== '') {
                    try {
                        await this.fillField(fieldName, fieldConfig, value, {
                            humanLikeTyping,
                            autoSelectDropdown
                        });

                        this.filledFields.push(fieldName);
                        await this.sleep(delayBetweenFields);

                    } catch (error) {
                        this.logger.log('ERROR', 'FIELD_FILL', `字段填写失败: ${fieldName}`, error);
                        this.errors.push({ field: fieldName, error: error.message });

                        // 如果是必填字段，尝试重试
                        if (fieldConfig.required) {
                            await this.retryField(fieldName, fieldConfig, value);
                        }
                    }
                }
            }

            // 5. 验证必填字段
            if (validateRequired) {
                this.validateRequiredFields(pageFields);
            }

            // 6. 返回结果
            return {
                success: this.errors.length === 0,
                page: this.currentPage,
                filled: this.filledFields.length,
                errors: this.errors
            };

        } catch (error) {
            this.logger.log('ERROR', 'MAIN', '填写失败', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 检测当前页面类型（优化版）
     */
    detectCurrentPage() {
        const url = window.location.href;

        // URL路径检测
        if (url.includes('/product_details')) return 'productDetails';
        if (url.includes('/safety_and_compliance')) return 'safetyCompliance';
        if (url.includes('/offer')) return 'offer';
        if (url.includes('/images')) return 'images';

        // 基于导航标签的active状态检测
        const activeTabs = document.querySelectorAll('[role="tab"][aria-selected="true"], .active-tab, [class*="active"]');
        for (const tab of activeTabs) {
            const text = tab.textContent;
            if (text.includes('产品详情')) return 'productDetails';
            if (text.includes('安全与合规')) return 'safetyCompliance';
            if (text.includes('报价')) return 'offer';
            if (text.includes('图片')) return 'images';
        }

        return 'unknown';
    }

    /**
     * 数据预处理（格式化、验证、自动推断）
     */
    preprocessData(rawData) {
        const processed = { ...rawData };

        // 自动识别外部产品ID类型
        if (processed.product_id && !processed.product_id_type) {
            const id = processed.product_id.toString().replace(/\D/g, '');
            if (id.length === 13 && id.startsWith('45')) {
                processed.product_id_type = 'JAN';
            } else if (id.length === 13) {
                processed.product_id_type = 'EAN';
            } else if (id.length === 12) {
                processed.product_id_type = 'UPC';
            }
        }

        // 价格格式化
        ['price', 'list_price', 'your_price'].forEach(field => {
            if (processed[field]) {
                processed[field] = processed[field].toString()
                    .replace(/[^\d.]/g, '')
                    .replace(/^0+/, '');
            }
        });

        // 默认值设置
        if (!processed.condition) processed.condition = 'new';
        if (!processed.fulfillment) processed.fulfillment = 'FBM';
        if (!processed.quantity) processed.quantity = '1';
        if (!processed.country_of_origin) processed.country_of_origin = 'CN';

        // 组件默认值
        if (!processed.components) processed.components = 'なし';

        return processed;
    }

    /**
     * 按优先级排序字段（必填 > 推荐 > 可选）
     */
    sortFieldsByPriority(fields) {
        const sorted = [];
        const entries = Object.entries(fields);

        // 必填字段优先
        entries.filter(([_, config]) => config.required)
            .forEach(entry => sorted.push(entry));

        // 其他字段
        entries.filter(([_, config]) => !config.required)
            .forEach(entry => sorted.push(entry));

        return sorted;
    }

    /**
     * 获取字段值
     */
    getFieldValue(fieldName, data) {
        // 直接匹配
        if (data[fieldName]) return data[fieldName];

        // 通过映射查找
        for (const [excelField, amazonPath] of Object.entries(EXCEL_TO_AMAZON_MAPPING_OPTIMIZED)) {
            if (amazonPath.endsWith(`.${fieldName}`)) {
                if (data[excelField]) return data[excelField];
            }
        }

        return null;
    }

    /**
     * 填写单个字段（核心方法）
     */
    async fillField(fieldName, fieldConfig, value, options = {}) {
        const element = await this.findElement(fieldConfig);

        if (!element) {
            throw new Error(`元素未找到: ${fieldName}`);
        }

        // 滚动到元素可见
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await this.sleep(300);

        // 根据类型填写
        switch (fieldConfig.type) {
            case 'textbox':
                await this.fillTextbox(element, value, options.humanLikeTyping);
                break;

            case 'dropdown':
                await this.fillDropdown(element, value, fieldName, options.autoSelectDropdown);
                break;

            case 'radio':
                await this.clickRadio(element);
                break;

            case 'checkbox':
                await this.toggleCheckbox(element, value);
                break;

            case 'spinbutton':
                await this.fillSpinbutton(element, value);
                break;

            case 'selector':
                await this.selectBrowseNode(element, value);
                break;

            default:
                console.warn(`未知字段类型: ${fieldConfig.type}`);
        }

        // 高亮显示已填写的字段
        this.highlightElement(element);
    }

    /**
     * 查找元素（支持多种策略）
     */
    async findElement(fieldConfig) {
        // 策略1: 通过UID查找
        if (fieldConfig.uid) {
            const uids = fieldConfig.uid.split('-'); // 处理范围UID
            for (const uid of uids) {
                const element = this.findByUID(uid);
                if (element) return element;
            }
        }

        // 策略2: 通过ID查找
        if (fieldConfig.id) {
            const element = document.getElementById(fieldConfig.id);
            if (element) return element;
        }

        // 策略3: 通过选择器查找
        if (fieldConfig.selector) {
            const element = document.querySelector(fieldConfig.selector);
            if (element) return element;
        }

        return null;
    }

    /**
     * 通过UID查找元素
     */
    findByUID(uid) {
        // 直接属性匹配
        let element = document.querySelector(`[uid="${uid}"]`);
        if (element) return element;

        // data-uid属性
        element = document.querySelector(`[data-uid="${uid}"]`);
        if (element) return element;

        // aria-label包含UID
        element = document.querySelector(`[aria-label*="${uid}"]`);
        if (element) return element;

        return null;
    }

    /**
     * 填写文本框（支持人性化输入）
     */
    async fillTextbox(element, value, humanLike = true) {
        element.focus();
        await this.sleep(100);

        // 清空现有内容
        element.value = '';
        element.dispatchEvent(new Event('input', { bubbles: true }));

        if (humanLike) {
            // 模拟打字
            for (const char of value.toString()) {
                element.value += char;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                await this.sleep(this.randomInt(30, 100));
            }
        } else {
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }

        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.blur();
    }

    /**
     * 填写下拉框（改进版）
     */
    async fillDropdown(element, value, fieldName, autoSelect = true) {
        // 点击打开下拉框
        element.click();
        await this.sleep(500);

        // 等待下拉选项加载
        await this.waitForElement('[role="listbox"], [role="option"], .dropdown-menu', 2000);

        // 查找匹配的选项
        let targetOption = null;

        // 如果有预定义的选项映射
        if (DROPDOWN_OPTIONS[fieldName]) {
            const mappedValue = DROPDOWN_OPTIONS[fieldName][value];
            if (mappedValue) {
                targetOption = await this.findDropdownOption(mappedValue);
            }
        }

        // 直接查找
        if (!targetOption) {
            targetOption = await this.findDropdownOption(value);
        }

        // 模糊匹配
        if (!targetOption && autoSelect) {
            const options = document.querySelectorAll('[role="option"], option, .dropdown-item');
            for (const option of options) {
                if (option.textContent.toLowerCase().includes(value.toLowerCase())) {
                    targetOption = option;
                    break;
                }
            }
        }

        if (targetOption) {
            targetOption.click();
            await this.sleep(300);
            this.logger.log('INFO', 'DROPDOWN', `选择了选项: ${targetOption.textContent}`);
        } else {
            // 尝试输入搜索
            const searchInput = document.querySelector('.dropdown-search, [type="search"]');
            if (searchInput) {
                await this.fillTextbox(searchInput, value, false);
                await this.sleep(500);

                // 选择第一个结果
                const firstOption = document.querySelector('[role="option"]:first-child');
                if (firstOption) {
                    firstOption.click();
                }
            } else {
                throw new Error(`未找到下拉选项: ${value}`);
            }
        }
    }

    /**
     * 查找下拉选项
     */
    async findDropdownOption(text) {
        const options = document.querySelectorAll('[role="option"], option, li[role="option"]');

        for (const option of options) {
            const optionText = option.textContent.trim();
            if (optionText === text || optionText.includes(text)) {
                return option;
            }
        }

        return null;
    }

    /**
     * 选择浏览节点（商品分类）
     */
    async selectBrowseNode(element, value) {
        // 点击打开选择器
        element.click();
        await this.sleep(500);

        // 如果有搜索框，使用搜索
        const searchInput = await this.waitForElement('.browse-node-search, [placeholder*="搜索"]', 1000);

        if (searchInput) {
            await this.fillTextbox(searchInput, value, false);
            await this.sleep(1000);

            // 选择第一个匹配结果
            const firstResult = document.querySelector('.search-result:first-child, [role="treeitem"]:first-child');
            if (firstResult) {
                firstResult.click();
                await this.sleep(300);
            }
        } else {
            // 直接在树形结构中查找
            const nodes = document.querySelectorAll('[role="treeitem"], .node-item');
            for (const node of nodes) {
                if (node.textContent.includes(value)) {
                    node.click();
                    break;
                }
            }
        }
    }

    /**
     * 重试字段填写
     */
    async retryField(fieldName, fieldConfig, value, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                this.logger.log('INFO', 'RETRY', `重试填写字段 (${i + 1}/${maxRetries}): ${fieldName}`);
                await this.sleep(1000 * (i + 1)); // 递增延迟

                await this.fillField(fieldName, fieldConfig, value);

                // 成功则移除错误记录
                this.errors = this.errors.filter(e => e.field !== fieldName);
                return true;

            } catch (error) {
                this.logger.log('WARN', 'RETRY_FAIL', `重试失败: ${fieldName}`, error);
            }
        }

        return false;
    }

    /**
     * 验证必填字段
     */
    validateRequiredFields(fields) {
        const missing = [];

        for (const [fieldName, config] of Object.entries(fields)) {
            if (config.required && !this.filledFields.includes(fieldName)) {
                missing.push(fieldName);
            }
        }

        if (missing.length > 0) {
            this.logger.log('WARN', 'VALIDATION', `缺少必填字段: ${missing.join(', ')}`);
            this.errors.push({
                type: 'validation',
                message: `缺少必填字段: ${missing.join(', ')}`
            });
        }

        return missing.length === 0;
    }

    /**
     * 等待元素出现
     */
    async waitForElement(selector, timeout = 3000) {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) return element;
            await this.sleep(100);
        }

        return null;
    }

    /**
     * 高亮元素
     */
    highlightElement(element) {
        const originalStyle = element.style.cssText;
        element.style.cssText += 'border: 2px solid #4CAF50 !important; background-color: #E8F5E9 !important;';

        setTimeout(() => {
            element.style.cssText = originalStyle;
        }, 2000);
    }

    /**
     * 工具方法
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 填写Spinbutton（数字输入）
     */
    async fillSpinbutton(element, value) {
        element.focus();
        await this.sleep(100);

        // 清空并设置值
        element.value = '';
        element.value = value.toString();

        // 触发事件
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));

        element.blur();
    }

    /**
     * 切换复选框
     */
    async toggleCheckbox(element, shouldCheck) {
        const isChecked = element.checked;

        if (shouldCheck && !isChecked) {
            element.click();
        } else if (!shouldCheck && isChecked) {
            element.click();
        }

        await this.sleep(200);
    }

    /**
     * 点击单选按钮
     */
    async clickRadio(element) {
        if (!element.checked) {
            element.click();
            await this.sleep(200);
        }
    }
}

// ==================== 日志类 ====================
class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
    }

    log(level, category, message, data = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            category,
            message,
            data,
            url: window.location.href
        };

        this.logs.push(entry);

        // 限制日志数量
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // 控制台输出
        const color = {
            'INFO': 'color: blue',
            'WARN': 'color: orange',
            'ERROR': 'color: red'
        }[level] || 'color: black';

        console.log(`%c[${level}][${category}] ${message}`, color, data || '');

        // 保存到storage
        this.save();
    }

    async save() {
        try {
            await chrome.storage.local.set({
                'formFillerLogs': this.logs.slice(-100) // 只保存最近100条
            });
        } catch (error) {
            console.error('保存日志失败:', error);
        }
    }

    export() {
        const blob = new Blob([JSON.stringify(this.logs, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `amazon_form_logs_${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    clear() {
        this.logs = [];
        chrome.storage.local.remove('formFillerLogs');
    }
}

// ==================== 全局实例创建 ====================
if (typeof window !== 'undefined') {
    window.amazonFormFillerOptimized = new AmazonFormFillerOptimized();
    console.log('[Amazon表单填写器-优化版] 全局实例已创建: window.amazonFormFillerOptimized');

    // 向后兼容
    window.amazonFormFiller = window.amazonFormFillerOptimized;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmazonFormFillerOptimized;
}