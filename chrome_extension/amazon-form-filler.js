/**
 * Amazon Japan Seller Central 商品表单自动填写模块
 * 基于完整需求文档: AMAZON_AUTOMATION_REQUIREMENTS.md
 * 生成日期: 2025-11-21
 */

console.log('[Amazon表单填写器] 模块加载');

// Amazon表单字段定位配置（基于实际记录的UID和ID）
const AMAZON_FIELDS = {
    // === 产品详情页 ===
    productDetails: {
        title: { uid: '22_40', type: 'textbox', multiline: true },
        brand: { uid: '22_44', type: 'textbox' },
        productId: { uid: '22_50', type: 'textbox' },
        model: { uid: '22_68', type: 'textbox' },
        manufacturer: { uid: '22_72', type: 'textbox' },
        description: { uid: '22_76', type: 'textbox', multiline: true },
        bulletPoint1: { uid: '22_80', type: 'textbox', multiline: true },
        bulletPoint2: { uid: '22_81', type: 'textbox', multiline: true },
        bulletPoint3: { uid: '22_82', type: 'textbox', multiline: true },
        bulletPoint4: { uid: '22_83', type: 'textbox', multiline: true },
        bulletPoint5: { uid: '22_84', type: 'textbox', multiline: true },
        searchKeywords: { uid: '22_92', type: 'textbox' },
        releaseDate: { uid: '22_213', type: 'textbox', format: 'date' },
        websiteReleaseDate: { uid: '22_217', type: 'textbox', format: 'date' }
    },

    // === 安全与合规页 ===
    safetyCompliance: {
        countryOfOrigin: { uid: '24_32', type: 'dropdown' },
        warranty: { uid: '24_36', type: 'textbox' },
        dangerousGoods: { uid: '24_48', type: 'dropdown' }
    },

    // === 报价页 ===
    offer: {
        quantity: { uid: '25_35', type: 'textbox' },
        handlingTime: { uid: '25_38', type: 'textbox' },
        yourPrice: { uid: '25_53', type: 'textbox' },
        listPrice: { uid: '25_95', type: 'textbox' },
        fulfillmentChannel: { uid: '25_163', type: 'radio', value: 'FBM' }
    },

    // === 图片页 ===
    images: {
        mainImage: { id: 'ProductImage_MAIN-input_input', type: 'file' },
        image1: { id: 'ProductImage_PT01-input_input', type: 'file' },
        image2: { id: 'ProductImage_PT02-input_input', type: 'file' },
        image3: { id: 'ProductImage_PT03-input_input', type: 'file' },
        image4: { id: 'ProductImage_PT04-input_input', type: 'file' },
        image5: { id: 'ProductImage_PT05-input_input', type: 'file' },
        image6: { id: 'ProductImage_PT06-input_input', type: 'file' },
        image7: { id: 'ProductImage_PT07-input_input', type: 'file' },
        image8: { id: 'ProductImage_PT08-input_input', type: 'file' }
    }
};

// Excel字段到Amazon字段的映射
const EXCEL_TO_AMAZON_MAPPING = {
    // 产品详情
    'title': 'productDetails.title',
    'brand': 'productDetails.brand',
    'product_id': 'productDetails.productId',
    'model': 'productDetails.model',
    'manufacturer': 'productDetails.manufacturer',
    'description': 'productDetails.description',
    'bullet_point_1': 'productDetails.bulletPoint1',
    'bullet_point_2': 'productDetails.bulletPoint2',
    'bullet_point_3': 'productDetails.bulletPoint3',
    'bullet_point_4': 'productDetails.bulletPoint4',
    'bullet_point_5': 'productDetails.bulletPoint5',
    'search_keywords': 'productDetails.searchKeywords',
    'release_date': 'productDetails.releaseDate',
    'website_release_date': 'productDetails.websiteReleaseDate',

    // 安全与合规
    'country_of_origin': 'safetyCompliance.countryOfOrigin',
    'warranty': 'safetyCompliance.warranty',
    'dangerous_goods': 'safetyCompliance.dangerousGoods',

    // 报价
    'quantity': 'offer.quantity',
    'handling_time': 'offer.handlingTime',
    'your_price': 'offer.yourPrice',
    'list_price': 'offer.listPrice',
    'fulfillment_channel': 'offer.fulfillmentChannel',

    // 图片
    'main_image': 'images.mainImage',
    'image_1': 'images.image1',
    'image_2': 'images.image2',
    'image_3': 'images.image3',
    'image_4': 'images.image4',
    'image_5': 'images.image5',
    'image_6': 'images.image6',
    'image_7': 'images.image7',
    'image_8': 'images.image8'
};

/**
 * 主填写函数
 */
async function fillAmazonForm(productData, options = {}) {
    const {
        humanLikeTyping = true,
        scrollBehavior = 'smooth',
        delayBetweenFields = 500
    } = options;

    console.log('[Amazon表单] 开始填写', productData);

    try {
        // 检测当前页面
        const currentPage = detectCurrentPage();
        console.log('[Amazon表单] 当前页面:', currentPage);

        // 根据页面填写对应字段
        switch (currentPage) {
            case 'productDetails':
                await fillProductDetailsPage(productData, { humanLikeTyping, delayBetweenFields });
                break;
            case 'safetyCompliance':
                await fillSafetyCompliancePage(productData, { humanLikeTyping, delayBetweenFields });
                break;
            case 'offer':
                await fillOfferPage(productData, { humanLikeTyping, delayBetweenFields });
                break;
            case 'images':
                await fillImagesPage(productData);
                break;
            default:
                throw new Error('未识别的页面类型');
        }

        console.log('[Amazon表单] 填写完成');
        showSuccessNotification();

        return { success: true };

    } catch (error) {
        console.error('[Amazon表单] 填写失败:', error);
        showErrorNotification(error.message);
        return { success: false, error: error.message };
    }
}

/**
 * 检测当前是哪个页面
 */
function detectCurrentPage() {
    const url = window.location.href;

    if (url.includes('/product_details')) return 'productDetails';
    if (url.includes('/safety_and_compliance')) return 'safetyCompliance';
    if (url.includes('/offer')) return 'offer';
    if (url.includes('/images')) return 'images';

    // 通过页面内容检测
    const pageText = document.body.textContent;
    if (pageText.includes('商品名称') && pageText.includes('品牌名')) return 'productDetails';
    if (pageText.includes('原产国') && pageText.includes('保修说明')) return 'safetyCompliance';
    if (pageText.includes('数量') && pageText.includes('您的价格')) return 'offer';
    if (pageText.includes('主图片') || pageText.includes('上传多个文件')) return 'images';

    return 'unknown';
}

/**
 * 填写产品详情页
 */
async function fillProductDetailsPage(data, options) {
    console.log('[产品详情页] 开始填写');

    // 切换到"所有属性"视图（某些字段只在此视图显示）
    await switchToAllAttributesView();
    await sleep(1000);

    // 按顺序填写字段
    const fields = [
        { key: 'title', value: data.title },
        { key: 'brand', value: data.brand },
        { key: 'product_id', value: data.product_id },
        { key: 'model', value: data.model },
        { key: 'manufacturer', value: data.manufacturer },
        { key: 'description', value: data.description },
        { key: 'bullet_point_1', value: data.bullet_point_1 },
        { key: 'bullet_point_2', value: data.bullet_point_2 },
        { key: 'bullet_point_3', value: data.bullet_point_3 },
        { key: 'bullet_point_4', value: data.bullet_point_4 },
        { key: 'bullet_point_5', value: data.bullet_point_5 },
        { key: 'search_keywords', value: data.search_keywords },
        { key: 'release_date', value: data.release_date },
        { key: 'website_release_date', value: data.website_release_date }
    ];

    for (const field of fields) {
        if (field.value) {
            const amazonPath = EXCEL_TO_AMAZON_MAPPING[field.key];
            if (amazonPath) {
                await fillFieldByPath(amazonPath, field.value, options);
                await sleep(options.delayBetweenFields);
            }
        }
    }

    console.log('[产品详情页] 填写完成');
}

/**
 * 填写安全与合规页
 */
async function fillSafetyCompliancePage(data, options) {
    console.log('[安全与合规页] 开始填写');

    const fields = [
        { key: 'country_of_origin', value: data.country_of_origin },
        { key: 'warranty', value: data.warranty },
        { key: 'dangerous_goods', value: data.dangerous_goods || '該当なし' }
    ];

    for (const field of fields) {
        if (field.value) {
            const amazonPath = EXCEL_TO_AMAZON_MAPPING[field.key];
            if (amazonPath) {
                await fillFieldByPath(amazonPath, field.value, options);
                await sleep(options.delayBetweenFields);
            }
        }
    }

    console.log('[安全与合规页] 填写完成');
}

/**
 * 填写报价页
 */
async function fillOfferPage(data, options) {
    console.log('[报价页] 开始填写');

    const fields = [
        { key: 'quantity', value: data.quantity },
        { key: 'handling_time', value: data.handling_time },
        { key: 'your_price', value: data.your_price },
        { key: 'list_price', value: data.list_price }
    ];

    for (const field of fields) {
        if (field.value) {
            const amazonPath = EXCEL_TO_AMAZON_MAPPING[field.key];
            if (amazonPath) {
                await fillFieldByPath(amazonPath, field.value, options);
                await sleep(options.delayBetweenFields);
            }
        }
    }

    // 选择配送渠道（自配送）
    await selectFulfillmentChannel('FBM');

    console.log('[报价页] 填写完成');
}

/**
 * 填写图片页
 */
async function fillImagesPage(data) {
    console.log('[图片页] 开始上传图片');

    // 注意：Chrome扩展无法直接访问本地文件系统
    // 这里只能提供文件选择器，由用户手动选择

    showImageUploadGuide(data);
}

/**
 * 根据路径填写字段
 */
async function fillFieldByPath(path, value, options) {
    const [section, fieldName] = path.split('.');
    const fieldConfig = AMAZON_FIELDS[section][fieldName];

    if (!fieldConfig) {
        console.warn(`[字段未定义] ${path}`);
        return false;
    }

    console.log(`[填写] ${path} = ${value}`);

    const element = findElementByConfig(fieldConfig);
    if (!element) {
        console.warn(`[元素未找到] ${path}`);
        return false;
    }

    // 滚动到元素可见
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(300);

    // 根据类型填写
    switch (fieldConfig.type) {
        case 'textbox':
            await fillTextbox(element, value, options.humanLikeTyping);
            break;
        case 'dropdown':
            await fillDropdown(element, value);
            break;
        case 'radio':
            await clickRadio(element);
            break;
        default:
            console.warn(`[未知类型] ${fieldConfig.type}`);
    }

    highlightElement(element);
    return true;
}

/**
 * 根据配置查找元素
 */
function findElementByConfig(config) {
    // 优先通过ID查找
    if (config.id) {
        const element = document.getElementById(config.id);
        if (element) return element;
    }

    // 通过UID查找（需要在Shadow DOM中）
    if (config.uid) {
        return findElementInShadowDOM(config.uid);
    }

    return null;
}

/**
 * 在Shadow DOM中查找元素
 */
function findElementInShadowDOM(targetUid) {
    // Amazon页面使用Shadow DOM，需要递归查找
    function searchShadow(root) {
        // 检查所有元素
        const allElements = root.querySelectorAll('*');

        for (const el of allElements) {
            // 检查当前元素的属性
            if (el.getAttribute('uid') === targetUid ||
                el.getAttribute('data-uid') === targetUid ||
                el.id?.includes(targetUid)) {
                return el;
            }

            // 递归检查Shadow DOM
            if (el.shadowRoot) {
                const found = searchShadow(el.shadowRoot);
                if (found) return found;
            }
        }

        return null;
    }

    return searchShadow(document);
}

/**
 * 填写文本框
 */
async function fillTextbox(element, value, humanLike = true) {
    element.focus();
    await sleep(100);

    // 清空
    element.value = '';
    element.dispatchEvent(new Event('input', { bubbles: true }));

    if (humanLike && typeof value === 'string') {
        // 模拟打字
        for (const char of value) {
            element.value += char;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            await sleep(randomInt(50, 150));
        }
    } else {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.blur();
}

/**
 * 填写下拉框
 */
async function fillDropdown(element, value) {
    // 点击打开下拉框
    element.click();
    await sleep(300);

    // 在Shadow DOM中查找选项
    const options = findDropdownOptions(value);
    if (options && options.length > 0) {
        options[0].click();
        await sleep(200);
    } else {
        console.warn(`[下拉选项未找到] ${value}`);
    }
}

/**
 * 查找下拉框选项
 */
function findDropdownOptions(value) {
    // 在Shadow DOM中查找包含目标值的option
    function searchOptions(root) {
        const options = [];
        const allElements = root.querySelectorAll('*');

        for (const el of allElements) {
            if ((el.role === 'option' || el.tagName === 'OPTION') &&
                el.textContent.includes(value)) {
                options.push(el);
            }

            if (el.shadowRoot) {
                options.push(...searchOptions(el.shadowRoot));
            }
        }

        return options;
    }

    return searchOptions(document);
}

/**
 * 点击单选按钮
 */
async function clickRadio(element) {
    element.click();
    await sleep(200);
}

/**
 * 切换到"所有属性"视图
 */
async function switchToAllAttributesView() {
    console.log('[切换视图] 所有属性');

    // 查找"所有属性"单选按钮
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    for (const radio of radioButtons) {
        const label = radio.nextElementSibling || radio.parentElement;
        if (label && label.textContent.includes('所有属性')) {
            radio.click();
            console.log('[切换视图] 已切换到所有属性');
            return true;
        }
    }

    console.warn('[切换视图] 未找到所有属性按钮');
    return false;
}

/**
 * 选择配送渠道
 */
async function selectFulfillmentChannel(channel) {
    const text = channel === 'FBM' ? '我将自行配送此商品' : '亚马逊将会配送并提供客户服务';

    const radioButtons = document.querySelectorAll('input[type="radio"]');
    for (const radio of radioButtons) {
        const label = radio.nextElementSibling || radio.parentElement;
        if (label && label.textContent.includes(text)) {
            radio.click();
            console.log(`[配送渠道] 已选择: ${text}`);
            return true;
        }
    }

    console.warn('[配送渠道] 未找到选项');
    return false;
}

/**
 * 显示图片上传指南
 */
function showImageUploadGuide(data) {
    const images = [];
    if (data.main_image) images.push({ name: '主图片', path: data.main_image });
    for (let i = 1; i <= 8; i++) {
        if (data[`image_${i}`]) {
            images.push({ name: `附加图片${i}`, path: data[`image_${i}`] });
        }
    }

    if (images.length === 0) {
        console.log('[图片] 无图片需要上传');
        return;
    }

    const guide = `
        <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px;">
            <h3 style="margin: 0 0 10px 0;">📷 需要上传 ${images.length} 张图片</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
                ${images.map(img => `<li><strong>${img.name}</strong>: ${img.path}</li>`).join('')}
            </ul>
            <p style="margin: 10px 0 0 0; color: #856404;">
                <strong>提示：</strong>Chrome扩展无法自动上传本地文件，请手动点击上传按钮选择文件。
            </p>
        </div>
    `;

    const container = document.querySelector('form') || document.body;
    container.insertAdjacentHTML('afterbegin', guide);
}

/**
 * 高亮显示元素
 */
function highlightElement(element) {
    const original = {
        border: element.style.border,
        background: element.style.background
    };

    element.style.border = '2px solid #4caf50';
    element.style.background = '#e8f5e9';

    setTimeout(() => {
        element.style.border = original.border;
        element.style.background = original.background;
    }, 1500);
}

/**
 * 显示成功通知
 */
function showSuccessNotification() {
    showNotification('✅ 填写完成！', 'success');
}

/**
 * 显示错误通知
 */
function showErrorNotification(message) {
    showNotification(`❌ 填写失败: ${message}`, 'error');
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info') {
    const colors = {
        success: { bg: '#4caf50', text: '#fff' },
        error: { bg: '#f44336', text: '#fff' },
        info: { bg: '#2196f3', text: '#fff' }
    };

    const color = colors[type] || colors.info;

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color.bg};
        color: ${color.text};
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 999999;
        font-family: sans-serif;
        font-size: 14px;
        animation: slideIn 0.5s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.5s ease-out reverse';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// 工具函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 导出给content.js使用
if (typeof window !== 'undefined') {
    window.AmazonFormFiller = {
        fillAmazonForm,
        detectCurrentPage
    };
}
