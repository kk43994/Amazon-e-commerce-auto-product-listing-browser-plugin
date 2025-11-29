/**
 * Amazon Japan Seller Central 商品表单自动填写模块
 * 基于完整需求文档: AMAZON_AUTOMATION_REQUIREMENTS.md
 * 生成日期: 2025-11-21
 */

console.log('[Amazon表单填写器] 模块加载');

// Amazon表单字段定位配置（基于实际记录的UID和ID）
// Amazon表单字段定位配置（基于实际记录的UID和ID - 2025-11-27更新）
const AMAZON_FIELDS = {
    // === 产品详情页 (UID 46_xx) ===
    productDetails: {
        title: {
            uid: '46_38',
            type: 'textbox',
            multiline: true,
            fallback: {
                name: 'item_name',
                labels: ['商品名称', '商品名', 'Product Name']
            }
        },
        brand: {
            uid: '46_42',
            type: 'textbox',
            fallback: {
                name: 'brand_name',
                labels: ['品牌名', 'ブランド名', 'Brand Name']
            }
        },
        productId: {
            uid: '46_48',
            type: 'textbox',
            fallback: {
                name: 'external_product_id',
                labels: ['外部产品 ID', '外部产品ID', '製品コード', 'External Product ID']
            }
        },
        model: {
            uid: '46_71',
            type: 'textbox',
            fallback: {
                name: 'model_name',
                labels: ['型号', 'モデル名', 'Model Name']
            }
        },
        manufacturer: {
            uid: '46_75',
            type: 'textbox',
            fallback: {
                name: 'manufacturer',
                labels: ['制造商', 'メーカー名', 'Manufacturer']
            }
        },
        description: {
            uid: '46_79',
            type: 'textbox',
            multiline: true,
            fallback: {
                name: 'product_description',
                labels: ['产品描述', '商品説明', 'Product Description']
            }
        },
        bulletPoint1: {
            uid: '46_83',
            type: 'textbox',
            multiline: true,
            fallback: { labels: ['要点', '商品的规格和功能', '商品の仕様', 'Key Product Features'], index: 0 }
        },
        bulletPoint2: { uid: '46_84', type: 'textbox', multiline: true, fallback: { labels: ['要点', '商品的规格和功能', '商品の仕様', 'Key Product Features'], index: 1 } },
        bulletPoint3: { uid: '46_85', type: 'textbox', multiline: true, fallback: { labels: ['要点', '商品的规格和功能', '商品の仕様', 'Key Product Features'], index: 2 } },
        bulletPoint4: { uid: '46_86', type: 'textbox', multiline: true, fallback: { labels: ['要点', '商品的规格和功能', '商品の仕様', 'Key Product Features'], index: 3 } },
        bulletPoint5: { uid: '46_87', type: 'textbox', multiline: true, fallback: { labels: ['要点', '商品的规格和功能', '商品の仕様', 'Key Product Features'], index: 4 } },
        searchKeywords: {
            uid: '46_94',
            type: 'textbox',
            fallback: { labels: ['搜索关键字', '搜索关键词', '検索キーワード', 'Search Terms'] }
        },
        releaseDate: { uid: '46_214', type: 'textbox', format: 'date', fallback: { labels: ['提供发布日期', 'Release Date'] } },
        websiteReleaseDate: { uid: '46_218', type: 'textbox', format: 'date', fallback: { labels: ['产品网站发布日期', 'Website Release Date'] } },
        // 新增字段
        material: { type: 'textbox', fallback: { labels: ['材料', 'Material'] } },
        color: { type: 'textbox', fallback: { labels: ['颜色', 'Color'] } },
        size: { type: 'textbox', fallback: { labels: ['尺码', 'Size'] } },
        partNumber: { type: 'textbox', fallback: { labels: ['零件编号', 'Part Number'] } },
        itemPackageQuantity: { type: 'textbox', fallback: { labels: ['产品数量', 'Item Package Quantity'] } },
        numberOfItems: { type: 'textbox', fallback: { labels: ['成套产品数量', 'Number of Items'] } },
        includedComponents: { type: 'textbox', fallback: { labels: ['所包含组件', 'Included Components'] } },
        style: { type: 'textbox', fallback: { labels: ['风格', 'Style'] } },
        targetAudience: { type: 'textbox', fallback: { labels: ['目标受众', 'Target Audience'] } },
        // 更多属性 (基于日志)
        recommendedBrowseNodes: { type: 'textbox', fallback: { labels: ['推荐浏览节点', 'Recommended Browse Nodes'] } },
        careInstructions: { type: 'textbox', fallback: { labels: ['保养说明', 'Care Instructions'] } },
        capacity: { type: 'textbox', fallback: { labels: ['容量', 'Capacity'] } },
        capacityUnit: { type: 'dropdown', fallback: { labels: ['容量单位', 'Capacity Unit'] } },
        finishType: { type: 'textbox', fallback: { labels: ['抛光类型', 'Finish Type'] } },
        baseType: { type: 'textbox', fallback: { labels: ['底座类型', 'Base Type'] } },
        manufactureYear: { type: 'textbox', fallback: { labels: ['制造年份', 'Manufacture Year'] } },

        // 尺寸与重量 - 商品
        itemDepth: { type: 'textbox', fallback: { labels: ['商品从前到后的深度', 'Item Depth', 'Item Length'] } },
        itemHeight: { type: 'textbox', fallback: { labels: ['商品从底部到顶部的高度', 'Item Height'] } },
        itemWidth: { type: 'textbox', fallback: { labels: ['商品左右宽度', 'Item Width'] } },
        itemDimensionUnit: { type: 'dropdown', fallback: { labels: ['商品深度单位', '商品高度单位', '商品宽度单位', 'Item Dimensions Unit'] } }, // 简化处理，通常单位是一致的
        itemWeight: { type: 'textbox', fallback: { labels: ['商品重量', 'Item Weight'] } },
        itemWeightUnit: { type: 'dropdown', fallback: { labels: ['商品重量单位', 'Item Weight Unit'] } },

        // 尺寸与重量 - 包装
        packageDepth: { type: 'textbox', fallback: { labels: ['包装长度', 'Package Length'] } },
        packageHeight: { type: 'textbox', fallback: { labels: ['包装高度', 'Package Height'] } },
        packageWidth: { type: 'textbox', fallback: { labels: ['包装宽度', 'Package Width'] } },
        packageDimensionUnit: { type: 'dropdown', fallback: { labels: ['包装长度单位', '包装高度单位', '包装宽度单位', 'Package Dimensions Unit'] } },
        packageWeight: { type: 'textbox', fallback: { labels: ['包装重量', '包裹重量', 'Package Weight'] } },
        packageWeightUnit: { type: 'dropdown', fallback: { labels: ['包装重量单位', 'Package Weight Unit'] } }
    },

    // === 安全与合规页 (UID 53_xx) ===
    safetyCompliance: {
        countryOfOrigin: {
            uid: '53_30',
            type: 'dropdown',
            fallback: { labels: ['原产国/原产地', '原产国/地区', '原産国/地域', 'Country/Region of Origin'] }
        },
        warranty: { uid: '53_36', type: 'textbox', fallback: { labels: ['保修说明', 'Warranty Description'] } },
        dangerousGoods: { uid: '53_46', type: 'dropdown', fallback: { labels: ['危险商品规管', 'Dangerous Goods Regulations'] } },
        // 更多合规字段
        ageRangeDescription: { type: 'dropdown', fallback: { labels: ['该产品是否有买家年龄限制', 'Is this product subject to age restrictions'] } },
        responsiblePersonEmail: { type: 'textbox', fallback: { labels: ['负责人的电子邮件或电子地址', 'Responsible Person Email'] } },
        complianceMedia: { type: 'textbox', fallback: { labels: ['合规媒介', 'Compliance Media'] } },
        complianceMediaContent: { type: 'dropdown', fallback: { labels: ['合规媒介内容类型', 'Compliance Media Content Type'] } },
        complianceMediaLanguage: { type: 'dropdown', fallback: { labels: ['合规媒介语言', 'Compliance Media Language'] } },
        complianceMediaLocation: { type: 'textbox', fallback: { labels: ['合规媒体位置来源', 'Compliance Media Location'] } },
        gpsrSafetyCertification: { type: 'dropdown', fallback: { labels: ['GPSR 安全认证', 'GPSR Safety Certification'] } },
        manufacturerEmail: { type: 'textbox', fallback: { labels: ['制造商的电子邮件地址或电子地址', 'Manufacturer Email'] } },
        globalTrade: { type: 'dropdown', fallback: { labels: ['全球发货', 'Global Trade'] } },
        ghsClassification: { type: 'dropdown', fallback: { labels: ['GHS 化学 H 代码', 'GHS Classification'] } }
    },

    // === 变体页 (UID 46_xx) ===
    variations: {
        variationTheme: { type: 'variation_theme', fallback: { labels: ['选择变体类型：', 'Variation Theme'] } },
        // 变体具体字段 (勾选主题后出现)
        size: { type: 'textbox', fallback: { labels: ['尺码', 'Size'] } },
        color: { type: 'textbox', fallback: { labels: ['颜色', 'Color'] } },
        itemPackageQuantity: { type: 'textbox', fallback: { labels: ['成套产品数量', 'Item Package Quantity'] } },
        material: { type: 'textbox', fallback: { labels: ['材料', 'Material'] } }
    },

    // === 报价页 (UID 48_xx) ===
    offer: {
        quantity: {
            uid: '48_35',
            type: 'textbox',
            fallback: { labels: ['数量', '在庫数', 'Quantity'] }
        },
        handlingTime: { uid: '48_38', type: 'textbox', fallback: { labels: ['处理时间', 'Handling Time'] } },
        yourPrice: {
            uid: '48_53',
            type: 'textbox',
            fallback: { labels: ['您的价格', '销售价格', '販売価格', 'Your Price'] } // 销售价格有时也指这个
        },
        listPrice: {
            uid: '48_95',
            type: 'textbox',
            fallback: { labels: ['市场价', '价格表（含税）', 'List Price'] }
        },
        salePrice: { type: 'textbox', fallback: { labels: ['销售价格', 'Sale Price'] } },
        saleStartDate: { type: 'textbox', format: 'date', fallback: { labels: ['销售开始日期', 'Sale Start Date'] } },
        saleEndDate: { type: 'textbox', format: 'date', fallback: { labels: ['销售截止日期', 'Sale End Date'] } },
        condition: { type: 'dropdown', fallback: { labels: ['商品状况', 'Condition'] } },
        fulfillmentChannel: { uid: '48_163', type: 'radio', value: 'FBM', fallback: { labels: ['配送渠道', 'Fulfillment Channel'] } },
        // 更多报价字段
        restockDate: { type: 'textbox', format: 'date', fallback: { labels: ['重新库存日期', 'Restock Date'] } },
        mapPrice: { type: 'textbox', fallback: { labels: ['最低广告价格', 'Minimum Advertised Price'] } },
        minSellerPrice: { type: 'textbox', fallback: { labels: ['卖方允许的最低价格', 'Minimum Seller Allowed Price'] } },
        maxSellerPrice: { type: 'textbox', fallback: { labels: ['卖方允许的最高价格', 'Maximum Seller Allowed Price'] } },
        productTaxCode: { type: 'textbox', fallback: { labels: ['产品税码', 'Product Tax Code'] } },
        launchDate: { type: 'textbox', format: 'date', fallback: { labels: ['发售日期', 'Launch Date'] } },
        maxOrderQuantity: { type: 'textbox', fallback: { labels: ['最大订单数量', 'Max Order Quantity'] } },
        giftMessage: { type: 'dropdown', fallback: { labels: ['可以提供礼品信息', 'Gift Message'] } }, // 假设是下拉或单选
        giftWrap: { type: 'dropdown', fallback: { labels: ['表示礼品包装可用', 'Gift Wrap'] } },
        conditionNote: { type: 'textbox', fallback: { labels: ['补充状况信息', 'Condition Note'] } }
    },

    // === 图片页 (UID 47_xx) ===
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
    // 新增映射
    'material': 'productDetails.material',
    'color': 'productDetails.color',
    'size': 'productDetails.size',
    'part_number': 'productDetails.partNumber',
    'item_package_quantity': 'productDetails.itemPackageQuantity',
    'number_of_items': 'productDetails.numberOfItems',
    'included_components': 'productDetails.includedComponents',
    'style': 'productDetails.style',
    'target_audience': 'productDetails.targetAudience',
    'recommended_browse_nodes': 'productDetails.recommendedBrowseNodes',
    'care_instructions': 'productDetails.careInstructions',
    'capacity': 'productDetails.capacity',
    'capacity_unit': 'productDetails.capacityUnit',
    'finish_type': 'productDetails.finishType',
    'base_type': 'productDetails.baseType',
    'manufacture_year': 'productDetails.manufactureYear',

    // 尺寸重量
    'item_length': 'productDetails.itemDepth',
    'item_width': 'productDetails.itemWidth',
    'item_height': 'productDetails.itemHeight',
    'item_dimension_unit': 'productDetails.itemDimensionUnit',
    'item_weight': 'productDetails.itemWeight',
    'item_weight_unit': 'productDetails.itemWeightUnit',
    'package_length': 'productDetails.packageDepth',
    'package_width': 'productDetails.packageWidth',
    'package_height': 'productDetails.packageHeight',
    'package_dimension_unit': 'productDetails.packageDimensionUnit',
    'package_weight': 'productDetails.packageWeight',
    'package_weight_unit': 'productDetails.packageWeightUnit',

    // 安全与合规
    'country_of_origin': 'safetyCompliance.countryOfOrigin',
    'warranty': 'safetyCompliance.warranty',
    'dangerous_goods': 'safetyCompliance.dangerousGoods',
    'age_range_description': 'safetyCompliance.ageRangeDescription',
    'responsible_person_email': 'safetyCompliance.responsiblePersonEmail',
    'compliance_media': 'safetyCompliance.complianceMedia',
    'compliance_media_content': 'safetyCompliance.complianceMediaContent',
    'compliance_media_language': 'safetyCompliance.complianceMediaLanguage',
    'compliance_media_location': 'safetyCompliance.complianceMediaLocation',
    'gpsr_safety_certification': 'safetyCompliance.gpsrSafetyCertification',
    'manufacturer_email': 'safetyCompliance.manufacturerEmail',
    'global_trade': 'safetyCompliance.globalTrade',
    'ghs_classification': 'safetyCompliance.ghsClassification',

    'global_trade': 'safetyCompliance.globalTrade',
    'ghs_classification': 'safetyCompliance.ghsClassification',

    // 变体 (注意：size, color, material 等字段在 Product Details 页也有，这里主要映射主题)
    'variation_theme': 'variations.variationTheme',
    // 'size': 'variations.size', // 移除重复映射，默认映射到 productDetails
    // 'color': 'variations.color',
    // 'item_package_quantity': 'variations.itemPackageQuantity',
    // 'material': 'variations.material',

    // 报价
    'quantity': 'offer.quantity',
    'handling_time': 'offer.handlingTime',
    'your_price': 'offer.yourPrice',
    'list_price': 'offer.listPrice',
    'sale_price': 'offer.salePrice',
    'sale_start_date': 'offer.saleStartDate',
    'sale_end_date': 'offer.saleEndDate',
    'condition': 'offer.condition',
    'sale_end_date': 'offer.saleEndDate',
    'condition': 'offer.condition',
    'fulfillment_channel': 'offer.fulfillmentChannel',
    'restock_date': 'offer.restockDate',
    'map_price': 'offer.mapPrice',
    'min_seller_price': 'offer.minSellerPrice',
    'max_seller_price': 'offer.maxSellerPrice',
    'product_tax_code': 'offer.productTaxCode',
    'launch_date': 'offer.launchDate',
    'max_order_quantity': 'offer.maxOrderQuantity',
    'gift_message': 'offer.giftMessage',
    'gift_wrap': 'offer.giftWrap',
    'condition_note': 'offer.conditionNote',

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
        // 0. 等待页面完全加载
        await waitForPageLoad();

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
            case 'variations':
                await fillVariationsPage(productData, { humanLikeTyping, delayBetweenFields });
                break;
            default:
                throw new Error('未识别的页面类型');
        }

        console.log('[Amazon表单] 填写完成');
        showSuccessNotification();

        return { success: true };

    } catch (error) {
        console.error('[Amazon表单] 填写失败:', error);
        console.error('Stack:', error.stack);
        showErrorNotification(error.message || JSON.stringify(error));
        return { success: false, error: error.message || String(error) };
    }
}

/**
 * 等待页面完全加载
 */
async function waitForPageLoad() {
    console.log('[页面加载] 等待页面完全加载...');

    // 1. 等待 document.readyState
    if (document.readyState !== 'complete') {
        await new Promise(resolve => {
            window.addEventListener('load', resolve, { once: true });
            // Fallback timeout
            setTimeout(resolve, 5000);
        });
    }

    // 2. 额外等待 Amazon 的动态加载 (检查关键元素)
    let attempts = 0;
    while (attempts < 20) { // 最多等待 10秒
        const labels = document.querySelectorAll('kat-label, label');
        const inputs = document.querySelectorAll('input, kat-input, textarea, kat-textarea');

        // 如果页面上有一定数量的标签和输入框，认为加载差不多了
        if (labels.length > 3 && inputs.length > 3) {
            console.log(`[页面加载] 关键元素已出现 (Labels: ${labels.length}, Inputs: ${inputs.length})`);
            break;
        }

        await sleep(500);
        attempts++;
    }

    // 3. 最后的稳定等待
    console.log('[页面加载] 等待稳定...');
    await sleep(2000);
    console.log('[页面加载] 完成');
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
        { key: 'website_release_date', value: data.website_release_date },
        // 新增字段
        { key: 'material', value: data.material },
        { key: 'color', value: data.color },
        { key: 'size', value: data.size },
        { key: 'part_number', value: data.part_number },
        { key: 'item_package_quantity', value: data.item_package_quantity },
        { key: 'number_of_items', value: data.number_of_items },
        { key: 'included_components', value: data.included_components },
        { key: 'style', value: data.style },
        { key: 'target_audience', value: data.target_audience },
        { key: 'recommended_browse_nodes', value: data.recommended_browse_nodes },
        { key: 'care_instructions', value: data.care_instructions },
        { key: 'capacity', value: data.capacity },
        { key: 'capacity_unit', value: data.capacity_unit },
        { key: 'finish_type', value: data.finish_type },
        { key: 'base_type', value: data.base_type },
        { key: 'manufacture_year', value: data.manufacture_year },
        { key: 'item_length', value: data.item_length },
        { key: 'item_width', value: data.item_width },
        { key: 'item_height', value: data.item_height },
        { key: 'item_dimension_unit', value: data.item_dimension_unit },
        { key: 'item_weight', value: data.item_weight },
        { key: 'item_weight_unit', value: data.item_weight_unit },
        { key: 'package_length', value: data.package_length },
        { key: 'package_width', value: data.package_width },
        { key: 'package_height', value: data.package_height },
        { key: 'package_dimension_unit', value: data.package_dimension_unit },
        { key: 'package_weight', value: data.package_weight },
        { key: 'package_weight_unit', value: data.package_weight_unit },
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
        { key: 'country_of_origin', value: data.country_of_origin },
        { key: 'warranty', value: data.warranty },
        { key: 'dangerous_goods', value: data.dangerous_goods || '該当なし' },
        // Added safety fields
        { key: 'age_range_description', value: data.age_range_description },
        { key: 'responsible_person_email', value: data.responsible_person_email },
        { key: 'compliance_media', value: data.compliance_media },
        { key: 'compliance_media_content', value: data.compliance_media_content },
        { key: 'compliance_media_language', value: data.compliance_media_language },
        { key: 'compliance_media_location', value: data.compliance_media_location },
        { key: 'gpsr_safety_certification', value: data.gpsr_safety_certification },
        { key: 'manufacturer_email', value: data.manufacturer_email },
        { key: 'global_trade', value: data.global_trade },
        { key: 'ghs_classification', value: data.ghs_classification }
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
        { key: 'list_price', value: data.list_price },
        { key: 'sale_price', value: data.sale_price },
        { key: 'sale_start_date', value: data.sale_start_date },
        { key: 'sale_end_date', value: data.sale_end_date },
        { key: 'condition', value: data.condition },
        { key: 'restock_date', value: data.restock_date },
        { key: 'map_price', value: data.map_price },
        { key: 'min_seller_price', value: data.min_seller_price },
        { key: 'max_seller_price', value: data.max_seller_price },
        { key: 'product_tax_code', value: data.product_tax_code },
        { key: 'launch_date', value: data.launch_date },
        { key: 'max_order_quantity', value: data.max_order_quantity },
        { key: 'gift_message', value: data.gift_message },
        { key: 'gift_wrap', value: data.gift_wrap },
        { key: 'condition_note', value: data.condition_note }
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
 * 填写变体页
 */
async function fillVariationsPage(data, options) {
    console.log('[变体页] 开始填写');

    // 1. 选择变体主题
    if (data.variation_theme) {
        await fillFieldByPath('variations.variationTheme', data.variation_theme, options);
        await sleep(1000); // 等待字段出现
    }

    // 2. 填写变体具体字段
    // 注意：这里我们需要手动指定映射到 variations.*，因为全局映射现在指向 productDetails.*
    const variationFields = [
        { key: 'size', path: 'variations.size', value: data.size },
        { key: 'color', path: 'variations.color', value: data.color },
        { key: 'item_package_quantity', path: 'variations.itemPackageQuantity', value: data.item_package_quantity },
        { key: 'material', path: 'variations.material', value: data.material }
    ];

    for (const field of variationFields) {
        if (field.value) {
            // 检查该字段是否在当前变体主题下可见
            const fieldConfig = AMAZON_FIELDS.variations[field.path.split('.')[1]];
            const element = findElementByConfig(fieldConfig);

            if (element) {
                await fillFieldByPath(field.path, field.value, options);
                await sleep(options.delayBetweenFields);
            } else {
                console.log(`[变体页] 跳过字段 ${field.key} (当前主题下不可见)`);
            }
        }
    }

    console.log('[变体页] 填写完成');
}

/**
 * 填写图片页
 */
async function fillImagesPage(data) {
    console.log('[图片页] 开始上传图片');

    const images = [];
    if (data.main_image) images.push({ name: '主图片', path: data.main_image, index: 0 });
    for (let i = 1; i <= 8; i++) {
        if (data[`image_${i}`]) {
            images.push({ name: `附加图片${i}`, path: data[`image_${i}`], index: i });
        }
    }

    if (images.length === 0) {
        console.log('[图片] 无图片需要上传');
        return;
    }

    // 显示提示 (作为备用)
    showImageUploadGuide(data);

    // 尝试自动上传
    const fileInputs = document.querySelectorAll('input[type="file"]');
    if (fileInputs.length === 0) {
        console.warn('[图片] 未找到上传入口');
        return;
    }

    for (const img of images) {
        // 找到对应的上传框 (Amazon通常有多个上传框，对应主图和附图)
        // 假设顺序对应: 0=Main, 1=PT01, ...
        // 如果找不到对应的，就用第一个或者尝试匹配 name
        let targetInput = fileInputs[img.index];

        // 尝试更精确的匹配
        if (img.index === 0) {
            targetInput = document.querySelector('input[name*="MAIN"]') || fileInputs[0];
        } else {
            targetInput = document.querySelector(`input[name*="PT0${img.index}"]`) || fileInputs[img.index];
        }

        if (targetInput) {
            // 找到 Drop Zone (通常是 input 的父级或兄弟元素)
            const dropZone = targetInput.closest('.kat-upload-dragger') || targetInput.parentElement;

            console.log(`[图片] 正在上传 ${img.name}: ${img.path}`);
            const success = await uploadImageFromUrl(img.path, dropZone);
            if (success) {
                console.log(`[图片] ${img.name} 上传成功`);
                await sleep(2000); // 等待上传处理
            } else {
                console.warn(`[图片] ${img.name} 上传失败，请手动上传`);
            }
        }
    }
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
        // 尝试在页面顶部显示全局提示，告诉用户哪个字段没找到
        showFloatingError(`未找到字段: ${fieldName} (UID: ${fieldConfig.uid})`);
        return false;
    }

    // 滚动到元素可见
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(300);

    // 根据类型填写
    switch (fieldConfig.type) {
        case 'textbox':
            let finalValue = value;
            // 处理日期格式
            if (fieldConfig.format === 'date') {
                finalValue = excelDateToJSDate(value);
                console.log(`[日期转换] ${value} -> ${finalValue}`);
            }
            await fillTextbox(element, finalValue, options.humanLikeTyping);
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

    // 高亮并显示提示
    highlightAndHintField(element, value);
    return true;
}

/**
 * 高亮并显示提示信息
 */
function highlightAndHintField(element, value) {
    try {
        if (!element || !element.style || !element.parentNode) return;

        // 1. 高亮边框
        const originalBorder = element.style.border;
        const originalBg = element.style.background;

        element.style.border = '2px solid #2196f3';
        element.style.background = 'rgba(33, 150, 243, 0.1)';
        element.style.transition = 'all 0.3s ease';

        // 2. 插入提示文字
        // 检查是否已经有提示了
        const existingHint = element.parentNode.querySelector('.ziniao-field-hint');
        if (existingHint) existingHint.remove();

        const hint = document.createElement('div');
        hint.className = 'ziniao-field-hint';
        hint.style.color = '#2196f3';
        hint.style.fontSize = '12px';
        hint.style.marginTop = '4px';
        hint.style.fontWeight = 'bold';
        hint.style.display = 'flex';
        hint.style.alignItems = 'center';
        hint.style.animation = 'fadeIn 0.3s ease';

        // 截断过长的值
        const displayValue = String(value).length > 20 ? String(value).substring(0, 20) + '...' : value;

        hint.innerHTML = `
            <span style="margin-right: 5px;">⚡ 填写:</span>
            <span style="background: #e3f2fd; padding: 2px 6px; border-radius: 4px;">${displayValue}</span>
        `;

        // 插入到元素后面
        if (element.parentNode) {
            element.parentNode.insertBefore(hint, element.nextSibling);
        }

        // 3. 3秒后移除高亮
        setTimeout(() => {
            try {
                if (element && element.style) {
                    element.style.border = originalBorder;
                    element.style.background = originalBg;
                }
            } catch (e) {
                // ignore
            }
        }, 3000);
    } catch (error) {
        console.warn('[高亮提示] 失败 (非致命错误):', error);
    }
}

/**
 * 根据配置查找元素
 */
function findElementByConfig(config) {
    // 1. 优先通过ID查找
    if (config.id) {
        const element = document.getElementById(config.id);
        if (element) return element;
    }

    // 2. 通过UID查找（需要在Shadow DOM中）
    if (config.uid) {
        const element = findElementInShadowDOM(config.uid);
        if (element) return element;
    }

    // 3. 后备策略：通过name或label查找
    if (config.fallback) {
        // 尝试通过name查找
        if (config.fallback.name) {
            const element = document.querySelector(`[name="${config.fallback.name}"]`);
            if (element) return element;
        }

        // 尝试通过label查找 (支持多语言)
        if (config.fallback.labels) {
            return findElementByLabels(config.fallback.labels, config.type, config.fallback.index || 0);
        }

        // 尝试通过placeholder查找 (Shadow DOM支持)
        if (config.fallback.placeholder) {
            return findElementByPlaceholder(config.fallback.placeholder);
        }
    }

    return null;
}

/**
 * 通过Label文本查找对应的输入框
 * @param {string[]} labels 标签文本数组
 * @param {string} targetType 目标字段类型 (textbox, radio, etc.)
 * @param {number} index 匹配第几个Label (默认0，即第一个)
 */
function findElementByLabels(labels, targetType = 'textbox', index = 0) {
    console.log(`[查找] 开始查找Label: [${labels.join(', ')}], Type: ${targetType}, Index: ${index}`);

    // 1. 查找所有包含label文本的元素
    function search(root) {
        // 遍历所有可能的文本节点或元素
        // 这里简化策略：查找所有 span, div, label, p, h4, kat-label
        const candidates = root.querySelectorAll('span, div, label, p, h4, kat-label');

        let matchCount = -1; // 计数器

        for (const el of candidates) {
            // 检查文本内容是否匹配任一label
            let text = el.textContent.trim();
            // 清理常见的干扰文本
            text = text.replace(/报告问题|Report a problem|問題を報告/g, '').trim();

            // 优先检查 kat-label 的 text 属性
            if (el.tagName === 'KAT-LABEL' && el.hasAttribute('text')) {
                text = el.getAttribute('text');
            }

            // 精确匹配或包含匹配（如果是包含匹配，长度差异不能太大）
            const matchedLabel = labels.find(l => text === l || (text.includes(l) && text.length < l.length + 10));

            if (matchedLabel) {
                matchCount++;
                // console.log(`[查找] 候选Label: "${text}" (Match: ${matchCount})`);

                if (matchCount < index) continue; // 跳过前面的匹配

                // 找到了Label
                console.log(`[查找] 找到Label (Index: ${index}, Match: ${matchCount}): "${text}"`, el);

                // 关键修正：如果el在Shadow DOM中，先找到宿主元素(Host)
                let currentEl = el;
                const shadowRoot = el.getRootNode();
                if (shadowRoot instanceof ShadowRoot) {
                    currentEl = shadowRoot.host;
                    console.log(`[查找] Label在Shadow DOM中，切换到Host:`, currentEl.tagName);
                }

                // 情况A: Label有for属性
                const forId = currentEl.getAttribute('for');
                if (forId) {
                    const input = root.getElementById ? root.getElementById(forId) : root.querySelector(`#${forId}`);
                    if (input) return input;
                }

                // 情况B: Input在Label内部
                let innerSelector = 'input:not([type="hidden"]), textarea, select, kat-input, kat-textarea, kat-select, kat-combobox, kat-autocomplete';
                if (targetType === 'textbox' || targetType === 'textarea') {
                    innerSelector = 'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), textarea, select, kat-input, kat-textarea, kat-select, kat-combobox, kat-autocomplete';
                }
                const innerInput = currentEl.querySelector(innerSelector);
                if (innerInput) {
                    console.log(`[查找] 找到内部Input:`, innerInput);
                    return innerInput;
                }

                // 情况C: Input在Label附近 (通常是后面，或者在同一个kat-row中)
                // 向上找父级，然后在父级内找Input
                let parent = currentEl.parentElement;
                let attempts = 0;
                while (parent && parent !== root && attempts < 8) {
                    // 在父级范围内找 input
                    // 扩展支持 Amazon 的自定义元素 kat-input, kat-textarea
                    // 关键修正：排除 type="hidden" 的 input
                    // 关键修正2：根据 targetType 过滤 radio/checkbox
                    // 关键修正3：支持 kat-combobox, kat-autocomplete
                    let selector = 'input:not([type="hidden"]), textarea, select, kat-input, kat-textarea, kat-select, kat-combobox, kat-autocomplete';

                    // 如果目标是文本框，排除 radio 和 checkbox
                    if (targetType === 'textbox' || targetType === 'textarea') {
                        selector = 'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), textarea, select, kat-input, kat-textarea, kat-select, kat-combobox, kat-autocomplete';
                    }

                    const inputs = parent.querySelectorAll(selector);

                    for (const input of inputs) {
                        // 排除自己内部的input
                        if (currentEl.contains(input)) continue;

                        // 简单的位置判断：input 在 DOM 顺序上应该在 label 后面
                        // 或者如果是 kat-row 布局，input 可能在 label 的父级容器的后面
                        if (input.compareDocumentPosition(currentEl) & Node.DOCUMENT_POSITION_PRECEDING) {
                            console.log(`[查找] 找到关联Input:`, input);
                            return input;
                        }
                    }

                    parent = parent.parentElement;
                    attempts++;
                    // 如果遇到大的容器，停止
                    if (parent && (parent.tagName === 'KAT-CARD' || parent.classList.contains('a-box'))) break;
                }
                console.log(`[查找] 未找到关联Input (Attempts: ${attempts})`);
            }
        }

        // 递归 Shadow DOM
        const all = root.querySelectorAll('*');
        for (const el of all) {
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
 * 通过placeholder查找元素 (支持Shadow DOM)
 */
function findElementByPlaceholder(text) {
    function search(root) {
        const elements = root.querySelectorAll('input, textarea');
        for (const el of elements) {
            if (el.placeholder && el.placeholder.includes(text)) {
                return el;
            }
            if (el.shadowRoot) {
                const found = search(el.shadowRoot);
                if (found) return found;
            }
        }
        // Recursively check all elements' Shadow Root
        const all = root.querySelectorAll('*');
        for (const el of all) {
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
 * 填写文本框 (支持标准Input和kat-input/kat-textarea)
 */
async function fillTextbox(element, value, humanLike = true) {
    try {
        // 检查是否是 kat-input 或 kat-textarea
        const tagName = element.tagName.toLowerCase();
        let nativeInput = element;
        let isKatElement = false;

        if (tagName === 'kat-input' || tagName === 'kat-textarea') {
            isKatElement = true;
            // 尝试获取内部的 input/textarea
            if (element.shadowRoot) {
                nativeInput = element.shadowRoot.querySelector('input, textarea') || element;
            }
        }

        console.log(`[填写] 目标元素: ${tagName}, Value: ${value}`);

        nativeInput.focus();
        await sleep(100);

        // 清空
        nativeInput.value = '';
        nativeInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        if (isKatElement) {
            element.value = '';
            element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        }

        if (humanLike && typeof value === 'string') {
            // 模拟打字
            for (const char of value) {
                nativeInput.value += char;
                nativeInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

                // 同步更新 host 元素
                if (isKatElement) {
                    element.value = nativeInput.value;
                    // Amazon的组件可能监听 host 的 input 事件
                    element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                }
                await sleep(randomInt(30, 80)); // 稍微加快一点
            }
        } else {
            nativeInput.value = value;
            nativeInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            if (isKatElement) {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            }
        }

        // 触发 change 和 blur
        nativeInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        nativeInput.blur();

        if (isKatElement) {
            element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        }

    } catch (e) {
        console.error('[填写] fillTextbox 发生错误:', e);
        throw e;
    }
}

/**
 * 填写下拉框
 */
async function fillDropdown(element, value) {
    // 点击打开下拉框
    element.click();
    await sleep(300);

    // 尝试查找映射值
    const mappedValue = DROPDOWN_MAPPING[value] || value;

    // 在Shadow DOM中查找选项
    let options = findDropdownOptions(mappedValue);

    // 如果没找到，尝试原始值
    if ((!options || options.length === 0) && mappedValue !== value) {
        options = findDropdownOptions(value);
    }

    if (options && options.length > 0) {
        options[0].click();
        await sleep(200);
    } else {
        console.warn(`[下拉选项未找到] ${value} (Mapped: ${mappedValue})`);
    }
}

// 下拉框值映射 (English -> Japanese/Chinese)
const DROPDOWN_MAPPING = {
    'New': '新品',
    'Used': '中古',
    'Yes': 'はい', // 或者 'Yes'
    'No': 'いいえ', // 或者 'No'
    'China': '中国',
    'Japan': '日本',
    // 添加更多映射
};

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
    const radioButtons = document.querySelectorAll('input[type="radio"], kat-radio, kat-checkbox');

    for (const radio of radioButtons) {
        // 检查 label
        const label = radio.nextElementSibling || radio.parentElement;
        if (label) {
            const text = label.textContent.trim();
            if (text.includes('所有属性') || text.includes('すべての属性') || text.includes('All attributes')) {
                radio.click();
                console.log('[切换视图] 已切换到所有属性 (Label匹配)');
                return true;
            }
        }

        // 检查 radio 自身的 title 或 aria-label 或 label 属性 (kat-radio)
        const title = radio.title || radio.getAttribute('label') || '';
        if (title && (title.includes('所有属性') || title.includes('すべての属性'))) {
            radio.click();
            console.log('[切换视图] 已切换到所有属性 (Title/Attribute匹配)');
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

    // 尝试自动点击第一个文件上传按钮 (如果存在)
    setTimeout(() => {
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            // fileInput.click(); // 浏览器通常会拦截非用户触发的点击
            // 但我们可以高亮它
            highlightElement(fileInput.parentElement || fileInput);
        }
    }, 1000);
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
 * 显示悬浮错误提示 (用于字段未找到时)
 */
function showFloatingError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(244, 67, 54, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        pointer-events: none;
        animation: slideUp 0.3s ease;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.style.opacity = '0';
        setTimeout(() => errorDiv.remove(), 300);
    }, 4000);
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
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
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
/**
 * 调试工具：打印页面表单结构
 */
function dumpFormStructure() {
    console.log('=== 表单结构转储 ===');
    const labels = document.querySelectorAll('kat-label, label, span.label');
    labels.forEach(l => {
        console.log('Label:', l.tagName, l.textContent.trim().substring(0, 50), l.getAttribute('text'));
        // 尝试找关联Input
        let parent = l.parentElement;
        let foundInputs = [];
        for (let i = 0; i < 8 && parent; i++) {
            const inputs = parent.querySelectorAll('input, textarea, kat-input, kat-textarea, kat-select, kat-combobox, kat-autocomplete, kat-checkbox, kat-radio');
            if (inputs.length > 0) {
                inputs.forEach(input => {
                    // 排除自身
                    if (input !== l && !l.contains(input)) {
                        foundInputs.push(input);
                    }
                });
                if (foundInputs.length > 0) break;
            }
            parent = parent.parentElement;
        }

        if (foundInputs.length > 0) {
            console.log(`  -> Found ${foundInputs.length} Inputs: `);
            foundInputs.forEach((input, idx) => {
                console.log(`    [${idx}]Tag: ${input.tagName}, Type: ${input.type}, Name: ${input.name || input.id}, Hidden: ${input.type === 'hidden'} `);
            });
        } else {
            console.log('  -> No Input Found nearby');
        }
    });
    console.log('=== 转储结束 ===');
}

// 暴露给全局
window.dumpFormStructure = dumpFormStructure;

/**
 * 将Excel序列日期转换为 YYYY/MM/DD 格式
 * @param {number|string} serial Excel序列号 (e.g. 45525)
 * @returns {string} YYYY/MM/DD
 */
function excelDateToJSDate(serial) {
    // 如果已经是日期格式 (包含 / 或 -)，直接返回
    if (typeof serial === 'string' && (serial.includes('/') || serial.includes('-'))) {
        return serial;
    }

    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const year = date_info.getFullYear();
    const month = String(date_info.getMonth() + 1).padStart(2, '0');
    const day = String(date_info.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
}
/**
 * 从URL上传图片 (模拟拖拽)
 * 支持本地服务器路径转换
 */
async function uploadImageFromUrl(pathOrUrl, dropZone) {
    try {
        let url = pathOrUrl;

        // 智能路径转换: 如果不是 http 开头，假设是本地文件，转换为 localhost URL
        if (!url.startsWith('http')) {
            // 提取文件名 (支持 Windows 和 Unix 路径)
            const filename = pathOrUrl.split(/[/\\]/).pop();
            url = `http://localhost:8000/${filename}`;
            console.log(`[图片] 转换本地路径为URL: ${url}`);
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

        const blob = await response.blob();
        const filename = url.split('/').pop() || 'image.jpg';
        const file = new File([blob], filename, { type: blob.type });

        // 模拟拖拽事件
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        const events = ['dragenter', 'dragover', 'drop'];
        for (const eventType of events) {
            const event = new DragEvent(eventType, {
                bubbles: true,
                cancelable: true,
                dataTransfer: dataTransfer
            });
            dropZone.dispatchEvent(event);
            await sleep(50);
        }

        return true;
    } catch (e) {
        console.error(`[图片] 上传出错 (${pathOrUrl}):`, e);
        return false;
    }
}

// 暴露给全局
window.AmazonFormFiller = {
    fillAmazonForm,
    fillProductDetailsPage,
    fillVariationsPage,
    fillOfferPage,
    fillSafetyCompliancePage,
    fillImagesPage
};
