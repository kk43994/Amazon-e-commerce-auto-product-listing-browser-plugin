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
                name: 'item_name-0-value',
                labels: ['商品名称', '商品名', 'Item Name', 'Product Name']
            }
        },
        brand: {
            uid: '46_42',
            type: 'textbox',
            fallback: {
                name: 'brand-0-value',
                labels: ['品牌名', 'ブランド名', 'Brand Name']
            }
        },
        productIdType: {
            type: 'dropdown',
            fallback: {
                name: 'externally_assigned_product_identifier-0-type',
                labels: ['External Product ID']
            }
        },
        productId: {
            uid: '46_48',
            type: 'textbox',
            fallback: {
                name: 'externally_assigned_product_identifier-0-value',
                labels: ['外部产品 ID', '外部产品ID', '製品コード', 'External Product ID']
            }
        },
        model: {
            uid: '46_71',
            type: 'textbox',
            fallback: {
                name: 'model_number-0-value',
                labels: ['型号', 'モデル名', 'Model Number', 'Model Name']
            }
        },
        manufacturer: {
            uid: '46_75',
            type: 'textbox',
            fallback: {
                name: 'manufacturer-0-value',
                labels: ['制造商', 'メーカー名', 'Manufacturer']
            }
        },
        description: {
            uid: '46_79',
            type: 'textbox',
            multiline: true,
            fallback: {
                name: 'product_description-0-value',
                labels: ['产品描述', '商品説明', 'Product Description']
            }
        },
        bulletPoint1: {
            uid: '46_83',
            type: 'textbox',
            multiline: true,
            fallback: { name: 'bullet_point-0-value', labels: ['要点', '商品的规格和功能', '商品の仕様', 'Key Product Features', 'Bullet Point'], index: 0 }
        },
        bulletPoint2: { uid: '46_84', type: 'textbox', multiline: true, fallback: { name: 'bullet_point-1-value', labels: ['要点', '商品的规格和功能', '商品の仕様', 'Key Product Features', 'Bullet Point'], index: 1 } },
        bulletPoint3: { uid: '46_85', type: 'textbox', multiline: true, fallback: { name: 'bullet_point-2-value', labels: ['要点', '商品的规格和功能', '商品の仕様', 'Key Product Features', 'Bullet Point'], index: 2 } },
        bulletPoint4: { uid: '46_86', type: 'textbox', multiline: true, fallback: { name: 'bullet_point-3-value', labels: ['要点', '商品的规格和功能', '商品の仕様', 'Key Product Features', 'Bullet Point'], index: 3 } },
        bulletPoint5: { uid: '46_87', type: 'textbox', multiline: true, fallback: { name: 'bullet_point-4-value', labels: ['要点', '商品的规格和功能', '商品の仕様', 'Key Product Features', 'Bullet Point'], index: 4 } },
        searchKeywords: {
            uid: '46_94',
            type: 'textbox',
            fallback: { name: 'generic_keyword-0-value', labels: ['搜索关键字', '搜索关键词', '検索キーワード', 'Search Terms', 'Generic Keyword'] }
        },
        productIdType: {
            type: 'dropdown',
            fallback: {
                names: ['externally_assigned_product_identifier-0-type', 'external_product_id_type', 'external_product_id_type-0-value'],
                labels: ['外部产品 ID 类型', 'External Product ID Type', 'GTIN', 'EAN', 'JAN']
            }
        },
        productId: { uid: '46_212', type: 'textbox', fallback: { name: 'external_product_id-0-value', labels: ['外部产品 ID', 'External Product ID'] } },
        releaseDate: { uid: '46_214', type: 'textbox', format: 'date', fallback: { labels: ['提供发布日期', 'Release Date'] } },
        websiteReleaseDate: { uid: '46_218', type: 'textbox', format: 'date', fallback: { name: 'product_site_launch_date-0-value', labels: ['产品网站发布日期', 'Product Site Launch Date', 'Website Release Date'] } },
        // 新增字段
        material: { type: 'textbox', fallback: { name: 'material-0-value', labels: ['材料', 'Material'] } },
        color: { type: 'textbox', fallback: { name: 'color-0-value', labels: ['颜色', 'Color'] } },
        size: { type: 'textbox', fallback: { name: 'size-0-value', labels: ['尺码', 'Size'] } },
        partNumber: { type: 'textbox', fallback: { name: 'part_number-0-value', labels: ['零件编号', 'Part Number'] } },
        itemPackageQuantity: { type: 'textbox', fallback: { name: 'item_package_quantity-0-value', labels: ['产品数量', 'Item Package Quantity'] } },
        numberOfItems: { type: 'textbox', fallback: { name: 'number_of_items-0-value', labels: ['成套产品数量', 'Number of Items'] } },
        includedComponents: { type: 'textbox', fallback: { name: 'included_components-0-value', labels: ['所包含组件', 'Included Components'] } },
        style: { type: 'textbox', fallback: { labels: ['风格', 'Style'] } },
        targetAudience: { type: 'textbox', fallback: { labels: ['目标受众', 'Target Audience'] } },
        // 更多属性 (基于日志)
        recommendedBrowseNodes: { type: 'textbox', fallback: { labels: ['推荐浏览节点', 'Recommended Browse Nodes'] } },
        careInstructions: { type: 'textbox', fallback: { name: 'care_instructions-0-value', labels: ['保养说明', 'Care Instructions'] } },
        capacity: { type: 'textbox', fallback: { name: 'capacity-0-value', labels: ['容量', 'Capacity'] } },
        capacityUnit: { type: 'dropdown', fallback: { labels: ['容量单位', 'Capacity Unit'] } },
        finishType: { type: 'textbox', fallback: { name: 'finish_type-0-value', labels: ['抛光类型', 'Finish Type'] } },
        baseType: { type: 'textbox', fallback: { name: 'base_type-0-value', labels: ['底座类型', 'Base Type'] } },
        manufactureYear: { type: 'textbox', fallback: { name: 'manufacture_year-0-value', labels: ['制造年份', 'Manufacture Year'] } },

        // 尺寸与重量 - 商品
        itemDepth: { type: 'textbox', fallback: { name: 'item_depth_width_height-0-depth-value', labels: ['商品从前到后的深度', 'Item Depth', 'Item Length'] } },
        itemHeight: { type: 'textbox', fallback: { name: 'item_depth_width_height-0-height-value', labels: ['商品从底部到顶部的高度', 'Item Height'] } },
        itemWidth: { type: 'textbox', fallback: { name: 'item_depth_width_height-0-width-value', labels: ['商品左右宽度', 'Item Width'] } },
        itemDimensionUnit: { type: 'dropdown', fallback: { labels: ['商品深度单位', '商品高度单位', '商品宽度单位', 'Item Dimensions Unit'] } }, // 简化处理，通常单位是一致的
        itemWeight: { type: 'textbox', fallback: { name: 'item_weight-0-value', labels: ['商品重量', 'Item Weight'] } },
        itemWeightUnit: { type: 'dropdown', fallback: { labels: ['商品重量单位', 'Item Weight Unit'] } },

        // 尺寸与重量 - 包装
        packageDepth: { type: 'textbox', fallback: { name: 'item_package_dimensions-0-length-value', labels: ['包装长度', 'Package Length'] } },
        packageHeight: { type: 'textbox', fallback: { name: 'item_package_dimensions-0-height-value', labels: ['包装高度', 'Package Height'] } },
        packageWidth: { type: 'textbox', fallback: { name: 'item_package_dimensions-0-width-value', labels: ['包装宽度', 'Package Width'] } },
        packageDimensionUnit: { type: 'dropdown', fallback: { labels: ['包装长度单位', '包装高度单位', '包装宽度单位', 'Package Dimensions Unit'] } },
        packageWeight: { type: 'textbox', fallback: { name: 'item_package_weight-0-value', labels: ['包装重量', '包裹重量', 'Package Weight'] } },
        packageWeightUnit: { type: 'dropdown', fallback: { labels: ['包装重量单位', 'Package Weight Unit'] } }
    },

    // === 安全与合规页 (UID 53_xx) ===
    safetyCompliance: {
        countryOfOrigin: {
            uid: '53_30',
            type: 'dropdown',
            fallback: { name: 'country_of_origin-0-value', labels: ['原产国/原产地', '原产国/地区', '原産国/地域', 'Country/Region of Origin'] }
        },
        warranty: { uid: '53_36', type: 'textbox', fallback: { name: 'warranty_description-0-value', labels: ['保修说明', 'Warranty Description'] } },
        dangerousGoods: { uid: '53_46', type: 'dropdown', fallback: { name: 'supplier_declared_dg_hz_regulation-0-value', labels: ['危险商品规管', 'Dangerous Goods Regulations'] } },
        // 更多合规字段
        ageRangeDescription: { type: 'radio', fallback: { name: 'is_this_product_subject_to_buyer_age_restrictions-0-value', labels: ['该产品是否有买家年龄限制', 'Is this product subject to age restrictions'] } },
        responsiblePersonEmail: { type: 'textbox', fallback: { name: 'dsa_responsible_party_address-0-value', labels: ['负责人的电子邮件或电子地址', 'Responsible Person Email'] } },
        complianceMediaLocation: { type: 'textbox', fallback: { name: 'compliance_media-0-source_location', labels: ['合规媒体位置来源', 'Compliance Media Location'] } },
        gpsrSafetyCertification: { type: 'radio', fallback: { name: 'gpsr_safety_attestation-0-value', labels: ['GPSR 安全认证', 'GPSR Safety Attestation'] } }, // Yes/No Radio
        manufacturerEmail: { type: 'textbox', fallback: { name: 'gpsr_manufacturer_reference-0-gpsr_manufacturer_email_address', labels: ['制造商的电子邮件地址或电子地址', 'Manufacturer Email'] } },
        globalTrade: { type: 'radio', fallback: { name: 'ships_globally-0-value', labels: ['全球发货', 'Ships Globally', 'Global Trade'] } },
        ghsClassification: { type: 'dropdown', fallback: { labels: ['GHS 化学 H 代码', 'GHS Classification'] } }
    },

    // === 变体页 (UID 46_xx) ===
    variations: {
        variationTheme: { type: 'variation_theme', fallback: { labels: ['选择变体类型：', 'Variation Theme'] } },
        // 变体具体字段 (勾选主题后出现)
        size: { type: 'textbox', fallback: { labels: ['尺码', 'Size'] } },
        mainImage: { id: 'ProductImage_MAIN-input_input', type: 'file' },
        image1: { id: 'ProductImage_PT01-input_input', type: 'file' },
        image2: { id: 'ProductImage_PT02-input_input', type: 'file' },
        image3: { id: 'ProductImage_PT03-input_input', type: 'file' },
        image4: { id: 'ProductImage_PT04-input_input', type: 'file' },
        image5: { id: 'ProductImage_PT05-input_input', type: 'file' },
        image6: { id: 'ProductImage_PT06-input_input', type: 'file' },
        image7: { id: 'ProductImage_PT07-input_input', type: 'file' },
        image8: { id: 'ProductImage_PT08-input_input', type: 'file' }
    },

    // === 报价页 (UID 48_xx) ===
    offer: {
        sku: { type: 'textbox', fallback: { name: 'contribution_sku-0-value', labels: ['SKU', 'Seller SKU'] } },
        quantity: { uid: '48_35', type: 'textbox', id: 'fulfillment_availability#1.quantity', fallback: { labels: ['数量', '在庫数', 'Quantity'] } },
        handlingTime: { uid: '48_38', type: 'textbox', id: 'fulfillment_availability#1.lead_time_to_ship_max_days', fallback: { labels: ['处理时间', 'Handling Time'] } },
        yourPrice: { uid: '48_53', type: 'textbox', fallback: { name: 'purchasable_offer-0-our_price-0-schedule-0-value_with_tax', labels: ['您的价格', '销售价格', '販売価格', 'Your Price'] } },
        listPrice: { uid: '48_95', type: 'textbox', fallback: { name: 'list_price-0-value', labels: ['市场价', '价格表（含税）', 'List Price including tax', 'List Price'] } },
        salePrice: { type: 'textbox', fallback: { name: 'purchasable_offer-0-discounted_price-0-schedule-0-value_with_tax', labels: ['销售价格', 'Sale Price'] } },
        saleStartDate: { type: 'textbox', format: 'date', fallback: { name: 'purchasable_offer-0-discounted_price-0-schedule-0-start_at', labels: ['销售开始日期', 'Sale Start Date'] } },
        saleEndDate: { type: 'textbox', format: 'date', fallback: { name: 'purchasable_offer-0-discounted_price-0-schedule-0-end_at', labels: ['销售截止日期', 'Sale End Date'] } },
        condition: { type: 'dropdown', fallback: { labels: ['商品状况', 'Item Condition', 'Condition'] } },
        fulfillmentChannel: { uid: '48_163', type: 'radio', value: 'FBM', fallback: { name: 'offerFulfillment', labels: ['配送渠道', 'Fulfillment Channel', 'I will ship this item myself'] } },
        restockDate: { uid: '48_163', type: 'textbox', format: 'date', id: 'fulfillment_availability#1.restock_date', fallback: { labels: ['重新库存日期', 'Restock Date'] } },
        mapPrice: { type: 'textbox', fallback: { name: 'purchasable_offer-0-map_price-0-schedule-0-value_with_tax', labels: ['最低广告价格', 'Minimum Advertised Price'] } },
        minSellerPrice: { type: 'textbox', fallback: { name: 'purchasable_offer-0-minimum_seller_allowed_price-0-schedule-0-value_with_tax', labels: ['卖方允许的最低价格', 'Minimum Seller Allowed Price'] } },
        maxSellerPrice: { type: 'textbox', fallback: { name: 'purchasable_offer-0-maximum_seller_allowed_price-0-schedule-0-value_with_tax', labels: ['卖方允许的最高价格', 'Maximum Seller Allowed Price'] } },
        productTaxCode: { type: 'dropdown', fallback: { name: 'product_tax_code-0-value', labels: ['产品税码', 'Product Tax Code'] } },
        launchDate: { type: 'textbox', format: 'date', fallback: { name: 'product_site_launch_date-0-value', labels: ['发售日期', 'Launch Date'] } },
        merchantReleaseDate: { type: 'textbox', format: 'date', fallback: { name: 'merchant_release_date-0-value', labels: ['商家发布日期', 'Merchant Release Date'] } },
        maxOrderQuantity: { type: 'textbox', fallback: { name: 'max_order_quantity-0-value', labels: ['最大订单数量', 'Max Order Quantity'] } },
        giftMessage: { type: 'radio', fallback: { name: 'gift_options-0-can_be_messaged', labels: ['礼品信息', 'Gift Message'] } },
        giftWrap: { type: 'radio', fallback: { name: 'gift_options-0-can_be_wrapped', labels: ['礼品包装', 'Gift Wrap'] } },
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

/**
 * 注入样式
 */
function injectStyles() {
    const styleId = 'amazon-plugin-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .amazon-plugin-filled {
                border: 2px solid #2196F3 !important;
                background-color: #f0f9ff !important;
                position: relative;
                transition: all 0.3s ease;
            }
            .amazon-plugin-filled::after {
                content: '⚡ 填写: ' attr(data-filled-value);
                position: absolute;
                top: -20px;
                left: 0;
                background: #2196F3;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                white-space: nowrap;
                z-index: 1000;
                pointer-events: none;
                opacity: 0.9;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            kat-input.amazon-plugin-filled, 
            kat-textarea.amazon-plugin-filled,
            kat-select.amazon-plugin-filled,
            kat-date-picker.amazon-plugin-filled {
                border: 2px solid #2196F3 !important;
                box-shadow: 0 0 5px rgba(33, 150, 243, 0.3);
            }
        `;
        document.head.appendChild(style);
        console.log('[样式注入] 插件样式已注入');
    }
}

/**
 * 标记元素为已填写
 */
function markAsFilled(element, value) {
    if (!element) return;

    // 如果是 Wrapper (比如 kat-input 内部的 input)，尝试标记父级自定义元素
    const parent = element.closest('kat-input, kat-textarea, kat-select, kat-date-picker');
    const target = parent || element;

    target.classList.add('amazon-plugin-filled');

    // 截断过长显示文案
    let displayValue = String(value);
    if (displayValue.length > 10) displayValue = displayValue.substring(0, 10) + '...';
    target.setAttribute('data-filled-value', displayValue);
}

/**
 * 检查元素是否已填写正确
 */
function isAlreadyFilled(element, value) {
    if (!element) return false;

    // 1. 检查是否有标记
    const parent = element.closest('kat-input, kat-textarea, kat-select, kat-date-picker');
    const target = parent || element;

    if (target.classList.contains('amazon-plugin-filled') && target.getAttribute('data-filled-value')) {
        return true;
    }

    // 2. 检查值是否一致 (弱类型比较)
    let currentValue = element.value;

    // 特殊处理 Checkbox/Radio
    if (element.type === 'checkbox' || element.type === 'radio') {
        return element.checked === true; // 对于 check/radio，value 只是 option value，重点是 checked
    }

    return currentValue == value;
}

// 初始化注入样式
injectStyles();

// Excel字段到Amazon字段的映射
const EXCEL_TO_AMAZON_MAPPING = {
    // 产品详情 - 基础字段（旧模板）
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
    // 兼容无下划线版本 (wanzhengbiaodan.csv 格式)
    'bullet_point1': 'productDetails.bulletPoint1',
    'bullet_point2': 'productDetails.bulletPoint2',
    'bullet_point3': 'productDetails.bulletPoint3',
    'bullet_point4': 'productDetails.bulletPoint4',
    'bullet_point5': 'productDetails.bulletPoint5',
    'search_keywords': 'productDetails.searchKeywords',
    'release_date': 'productDetails.releaseDate',
    'website_release_date': 'productDetails.websiteReleaseDate',

    // 产品详情 - 基础字段（新模板）
    'item_name': 'productDetails.title',
    'brand_name': 'productDetails.brand',
    'external_product_id_type': 'productDetails.productIdType',
    'external_product_id': 'productDetails.productId',
    'model_number': 'productDetails.model',
    'model_name': 'productDetails.model',
    'product_description': 'productDetails.description',
    'generic_keyword': 'productDetails.searchKeywords',
    'generic_keywords': 'productDetails.searchKeywords', // 兼容复数形式
    'product_site_launch_date': 'productDetails.websiteReleaseDate',
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

    // 尺寸重量（旧模板）
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

    // 尺寸重量（新模板）
    'item_depth_front_to_back': 'productDetails.itemDepth',
    'item_depth_unit': 'productDetails.itemDimensionUnit',
    'item_height_base_to_top': 'productDetails.itemHeight',
    'item_height_unit': 'productDetails.itemDimensionUnit',
    'item_width_side_to_side': 'productDetails.itemWidth',
    'item_width_unit': 'productDetails.itemDimensionUnit',

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
    'sku': 'offer.sku',
    'quantity': 'offer.quantity',
    'handling_time': 'offer.handlingTime',
    'restock_date': 'offer.restockDate',
    'your_price': 'offer.yourPrice',
    'list_price': 'offer.listPrice',
    'sale_price': 'offer.salePrice',
    'sale_start_date': 'offer.saleStartDate',
    'sale_end_date': 'offer.saleEndDate',
    'condition': 'offer.condition',
    'fulfillment_channel': 'offer.fulfillmentChannel',
    'map_price': 'offer.mapPrice',
    'min_seller_price': 'offer.minSellerPrice',
    'max_seller_price': 'offer.maxSellerPrice',
    'product_tax_code': 'offer.productTaxCode',
    'launch_date': 'offer.launchDate',
    'merchant_release_date': 'offer.merchantReleaseDate',
    'max_order_quantity': 'offer.maxOrderQuantity',
    'gift_message': 'offer.giftMessage',
    'gift_wrap': 'offer.giftWrap',
    'condition_note': 'offer.conditionNote',

    // 安全与合规（添加缺少的映射）
    'ships_globally': 'safetyCompliance.globalTrade',

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
    if (url.includes('/variations')) return 'variations';

    // 通过页面内容检测
    const pageText = document.body.textContent;
    if (pageText.includes('商品名称') && pageText.includes('品牌名')) return 'productDetails';
    if (pageText.includes('原产国') && pageText.includes('保修说明')) return 'safetyCompliance';
    if (pageText.includes('数量') && pageText.includes('您的价格')) return 'offer';
    if (pageText.includes('主图片') || pageText.includes('上传多个文件')) return 'images';
    if (pageText.includes('Variation Theme') || pageText.includes('变体主题') || pageText.includes('Add variation')) return 'variations';

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

    // 按顺序填写字段（支持新旧字段名）
    const fields = [
        { key: 'title', value: data.item_name || data.title },
        { key: 'brand', value: data.brand_name || data.brand },
        { key: 'external_product_id_type', value: data.external_product_id_type },
        { key: 'product_id', value: data.external_product_id || data.product_id },
        { key: 'model', value: data.model_number || data.model_name || data.model },
        { key: 'manufacturer', value: data.manufacturer },
        { key: 'description', value: data.product_description || data.description },
        { key: 'bullet_point_1', value: data.bullet_point_1 || data.bullet_point1 },
        { key: 'bullet_point_2', value: data.bullet_point_2 || data.bullet_point2 },
        { key: 'bullet_point_3', value: data.bullet_point_3 || data.bullet_point3 },
        { key: 'bullet_point_4', value: data.bullet_point_4 || data.bullet_point4 },
        { key: 'bullet_point_5', value: data.bullet_point_5 || data.bullet_point5 },
        { key: 'search_keywords', value: data.generic_keyword || data.generic_keywords || data.search_keywords },
        { key: 'release_date', value: data.release_date },
        { key: 'website_release_date', value: data.product_site_launch_date || data.website_release_date },
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
        { key: 'item_length', value: data.item_depth_front_to_back || data.item_length },
        { key: 'item_width', value: data.item_width_side_to_side || data.item_width },
        { key: 'item_height', value: data.item_height_base_to_top || data.item_height },
        { key: 'item_dimension_unit', value: data.item_depth_unit || data.item_height_unit || data.item_width_unit || data.item_dimension_unit },
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
        // 检查是否暂停
        const { workflowStatus } = await chrome.storage.local.get(['workflowStatus']);
        if (workflowStatus === 'paused') {
            console.log('🔴 [暂停检查] 检测到暂停状态，停止填写');
            throw new Error('用户暂停了工作流');
        }
        if (workflowStatus === 'stopped') {
            console.log('⛔ [停止检查] 检测到停止状态，终止填写');
            throw new Error('用户停止了工作流');
        }

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

    // 切换到"所有属性"视图
    await switchToAllAttributesView();
    await sleep(500);

    const fields = [
        { key: 'country_of_origin', value: data.country_of_origin },
        { key: 'warranty', value: data.warranty },
        { key: 'dangerous_goods', value: data.dangerous_goods || 'Not Applicable' }, // Default to Not Applicable/該当なし
        { key: 'age_range_description', value: data.age_range_description },
        { key: 'responsible_person_email', value: data.responsible_person_email },
        { key: 'compliance_media_location', value: data.compliance_media || data.compliance_media_location },
        { key: 'gpsr_safety_certification', value: data.gpsr_safety_certification },
        { key: 'manufacturer_email', value: data.manufacturer_email },
        { key: 'global_trade', value: data.ships_globally || data.global_trade }, // Support both keys
        { key: 'ghs_classification', value: data.ghs_classification }
    ];

    for (const field of fields) {
        // 检查是否暂停
        const { workflowStatus } = await chrome.storage.local.get(['workflowStatus']);
        if (workflowStatus === 'paused') {
            console.log('🔴 [暂停检查] 检测到暂停状态，停止填写');
            throw new Error('用户暂停了工作流');
        }
        if (workflowStatus === 'stopped') {
            console.log('⛔ [停止检查] 检测到停止状态，终止填写');
            throw new Error('用户停止了工作流');
        }

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

    // 切换到"所有属性"视图
    await switchToAllAttributesView();
    await sleep(500);

    const fields = [
        { key: 'sku', value: data.sku },
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
        // 检查是否暂停
        const { workflowStatus } = await chrome.storage.local.get(['workflowStatus']);
        if (workflowStatus === 'paused') {
            console.log('🔴 [暂停检查] 检测到暂停状态，停止填写');
            throw new Error('用户暂停了工作流');
        }
        if (workflowStatus === 'stopped') {
            console.log('⛔ [停止检查] 检测到停止状态，终止填写');
            throw new Error('用户停止了工作流');
        }

        if (field.value) {
            const amazonPath = EXCEL_TO_AMAZON_MAPPING[field.key];
            if (amazonPath) {
                await fillFieldByPath(amazonPath, field.value, options);
                await sleep(options.delayBetweenFields);
            }
        }
    }

    // 选择配送渠道
    console.log('>>> [报价页] 准备调用配送渠道选择函数...');
    console.log('>>> [报价页] fulfillment_channel 值:', data.fulfillment_channel);
    try {
        await selectFulfillmentChannel(data.fulfillment_channel || 'FBM');
        console.log('>>> [报价页] 配送渠道选择完成');
    } catch (e) {
        console.error('>>> [报价页] 配送渠道选择失败:', e);
    }

    console.log('[报价页] 填写完成');
}

/**
 * 选择配送渠道 (Fulfillment Channel)
 * @param {string} channel - 'FBM' (Merchant Fulfilled) 或 'FBA' (Fulfilled by Amazon)
 */
async function selectFulfillmentChannel(channel = 'FBM') {
    console.log(`[配送渠道] 选择: ${channel}`);

    const isFBM = channel.toUpperCase() === 'FBM' ||
        channel.toLowerCase().includes('merchant') ||
        channel.toLowerCase().includes('myself');

    // 定义搜索关键词 (小写)
    const fbmKeywords = [
        'i will ship this item myself',
        'merchant fulfilled',
        'i will ship',
        '卖家自行配送',
        '我将自行配送',
        '自行配送此商品',
        '自己で配送',
        '出品者から出荷'
    ];
    const fbaKeywords = [
        'amazon will ship',
        'fulfilled by amazon',
        'fba',
        '亚马逊配送',
        '亚马逊将会配送',
        'amazonが配送',
        'フルフィルメント by amazon'
    ];

    const targetKeywords = isFBM ? fbmKeywords : fbaKeywords;
    console.log(`[配送渠道] 搜索: ${isFBM ? 'FBM' : 'FBA'}, 关键词: ${targetKeywords.slice(0, 3).join(', ')}`);

    // 方法1: 直接通过 name="offerFulfillment" 查找 (参考礼品选项的成功方式)
    console.log('[配送渠道] 通过 name="offerFulfillment" 查找...');

    // 查找所有 kat-radiobutton[name="offerFulfillment"]
    const fulfillmentRadios = document.querySelectorAll('kat-radiobutton[name="offerFulfillment"]');
    console.log(`[配送渠道] 找到 ${fulfillmentRadios.length} 个 offerFulfillment radio`);

    for (const radioBtn of fulfillmentRadios) {
        const label = (radioBtn.getAttribute('label') || '').toLowerCase();
        const katAriaLabel = (radioBtn.getAttribute('kat-aria-label') || '').toLowerCase();
        const value = radioBtn.getAttribute('value') || '';

        console.log(`[配送渠道] 检查: label="${label}", value="${value}"`);

        // 匹配关键词或value (MFN=FBM, AFN=FBA)
        const matchesByKeyword = targetKeywords.some(keyword => label.includes(keyword) || katAriaLabel.includes(keyword));
        const matchesByValue = (isFBM && value === 'MFN') || (!isFBM && value === 'AFN');

        if (matchesByKeyword || matchesByValue) {
            console.log(`[配送渠道] ✓ 找到匹配: label="${radioBtn.getAttribute('label')}", value="${value}"`);

            // 滚动到元素
            radioBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(200);

            // 关键修复: input 是 kat-radiobutton 的子元素 (slot="radio")，不在 Shadow DOM 中！
            const innerRadio = radioBtn.querySelector('input[type="radio"]');
            if (innerRadio) {
                console.log('[配送渠道] 找到子元素 input[type="radio"]，开始点击...');

                // 多重点击策略
                innerRadio.click();
                innerRadio.checked = true;
                innerRadio.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                innerRadio.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

                console.log('[配送渠道] ✓ 已选择 input radio');
            } else {
                // 备用: 点击 kat-radiobutton 组件本身
                console.log('[配送渠道] 未找到内部input，点击 kat-radiobutton 本身');
                radioBtn.click();
            }

            console.log('[配送渠道] ✓ 已选择 (offerFulfillment)');
            await sleep(500);
            return;
        }
    }

    // 方法2: 查找 kat-radiobutton (不限定 name, 通过 label 匹配)
    console.log('[配送渠道] 查找所有 kat-radiobutton 组件...');
    const allRadioButtons = document.querySelectorAll('kat-radiobutton');
    for (const radioBtn of allRadioButtons) {
        const label = (radioBtn.getAttribute('label') || '').toLowerCase();
        const text = (radioBtn.textContent || '').toLowerCase();
        const matches = targetKeywords.some(keyword => label.includes(keyword) || text.includes(keyword));

        if (matches) {
            console.log(`[配送渠道] 找到匹配的 kat-radiobutton: label="${radioBtn.getAttribute('label')}"`);

            radioBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(200);

            radioBtn.click();

            if (radioBtn.shadowRoot) {
                const innerRadio = radioBtn.shadowRoot.querySelector('input[type="radio"]');
                if (innerRadio) {
                    innerRadio.click();
                    innerRadio.checked = true;
                    innerRadio.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                    innerRadio.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
                }
            }

            console.log('[配送渠道] ✓ 已选择 (kat-radiobutton)');
            await sleep(500);
            return;
        }
    }

    // 方法3: 查找kat-box-toggle组件（Amazon常用）
    const boxToggles = document.querySelectorAll('kat-box-toggle');
    for (const toggle of boxToggles) {
        const text = (toggle.textContent || toggle.getAttribute('label') || '').toLowerCase();
        const matches = targetKeywords.some(keyword => text.includes(keyword));
        if (matches) {
            console.log(`[配送渠道] 找到 kat-box-toggle，点击中...`);
            toggle.click();
            await sleep(500);
            return;
        }
    }

    // 方法2: 使用Shadow DOM遍历查找
    console.log('[配送渠道] 使用Shadow DOM遍历查找...');

    // 定义Shadow DOM遍历函数
    const findInShadowDOM = (root, predicate) => {
        const elements = root.querySelectorAll('*');
        for (const el of elements) {
            if (predicate(el)) return el;
            if (el.shadowRoot) {
                const found = findInShadowDOM(el.shadowRoot, predicate);
                if (found) return found;
            }
        }
        return null;
    };

    // 在Shadow DOM中查找包含关键词的元素
    const matchedElement = findInShadowDOM(document, el => {
        const text = (el.textContent || '').toLowerCase();
        const label = (el.getAttribute('label') || '').toLowerCase();
        return targetKeywords.some(keyword => text.includes(keyword) || label.includes(keyword));
    });

    if (matchedElement) {
        console.log(`[配送渠道] 在Shadow DOM中找到: <${matchedElement.tagName}>`);

        // 尝试在该元素及其祖先中找到radio
        let radioFound = false;
        let current = matchedElement;
        for (let i = 0; i < 10 && current && !radioFound; i++) {
            // 检查当前元素是否是radio
            if (current.tagName === 'INPUT' && current.type === 'radio') {
                current.click();
                current.checked = true;
                current.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('[配送渠道] ✓ 已选择 (Shadow DOM radio)');
                await sleep(500);
                return;
            }

            // 检查是否是kat-radio-button
            if (current.tagName === 'KAT-RADIO-BUTTON' || current.tagName === 'KAT-RADIO') {
                current.click();
                if (current.shadowRoot) {
                    const innerRadio = current.shadowRoot.querySelector('input[type="radio"]');
                    if (innerRadio) innerRadio.click();
                }
                console.log('[配送渠道] ✓ 已选择 (Shadow DOM kat-radio)');
                await sleep(500);
                return;
            }

            // 查找内部或相邻的radio
            const radio = current.querySelector?.('input[type="radio"]');
            if (radio) {
                radio.click();
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('[配送渠道] ✓ 已选择 (Shadow DOM内部radio)');
                await sleep(500);
                return;
            }

            current = current.parentElement;
        }

        // 直接点击找到的元素
        console.log('[配送渠道] 直接点击匹配的元素');
        matchedElement.click();
        await sleep(500);
        return;
    }

    // 方法3: 通过文本内容查找包含关键词的父容器，然后找到其中的radio
    console.log('[配送渠道] 使用普通DOM文本匹配方式查找...');

    // 获取所有文本节点并找到包含关键词的元素
    const allTextContainers = document.querySelectorAll('div, span, label, p');
    for (const container of allTextContainers) {
        const text = (container.textContent || '').toLowerCase();
        const matches = targetKeywords.some(keyword => text.includes(keyword));
        if (!matches) continue;

        // 找到了包含关键词的容器，现在查找相关的radio按钮
        console.log(`[配送渠道] 找到包含关键词的容器: "${text.substring(0, 50)}..."`);

        // 策略1: 在容器内部查找radio
        let radio = container.querySelector('input[type="radio"]');

        // 策略2: 在父元素或祖父元素中查找radio
        if (!radio) {
            let parent = container.parentElement;
            for (let i = 0; i < 5 && parent && !radio; i++) {
                radio = parent.querySelector('input[type="radio"]');
                parent = parent.parentElement;
            }
        }

        // 策略3: 查找同级元素中的radio
        if (!radio && container.parentElement) {
            const siblings = container.parentElement.children;
            for (const sibling of siblings) {
                radio = sibling.querySelector('input[type="radio"]') ||
                    (sibling.tagName === 'INPUT' && sibling.type === 'radio' ? sibling : null);
                if (radio) break;
            }
        }

        if (radio) {
            console.log(`[配送渠道] 找到关联的radio按钮`);
            radio.click();
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
            radio.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('[配送渠道] ✓ 已选择 (通过文本匹配)');
            await sleep(500);
            return;
        }

        // 如果没找到radio，尝试直接点击这个容器
        console.log('[配送渠道] 未找到radio，尝试直接点击容器');
        container.click();
        await sleep(500);
        return;
    }

    // 查找所有单选按钮和相关元素
    const allElements = document.querySelectorAll('input[type="radio"], kat-radio-button, kat-radio, kat-label, [role="radio"], label, span, div');

    for (const el of allElements) {
        const text = (el.textContent || el.getAttribute('label') || '').toLowerCase();

        // 检查是否包含目标关键词 (已经是小写)
        const matches = targetKeywords.some(keyword => text.includes(keyword));
        if (!matches) continue;

        // 找到匹配的元素，尝试点击
        console.log(`[配送渠道] 找到匹配元素: "${text.substring(0, 50)}..."`);

        // 如果是radio input，直接点击
        if (el.tagName === 'INPUT' && el.type === 'radio') {
            el.click();
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('[配送渠道] 已选择 (input radio)');
            await sleep(500);
            return;
        }

        // 如果是kat-radio-button
        if (el.tagName === 'KAT-RADIO-BUTTON') {
            el.click();
            if (el.shadowRoot) {
                const innerInput = el.shadowRoot.querySelector('input');
                if (innerInput) {
                    innerInput.click();
                }
            }
            console.log('[配送渠道] 已选择 (kat-radio-button)');
            await sleep(500);
            return;
        }

        // 如果是kat-label（Amazon自定义标签）
        if (el.tagName === 'KAT-LABEL') {
            console.log('[配送渠道] 找到 kat-label，尝试点击');
            // 获取for属性指向的元素ID
            const forId = el.getAttribute('for');
            if (forId) {
                const targetInput = document.getElementById(forId);
                if (targetInput) {
                    targetInput.click();
                    if (targetInput.type === 'radio') {
                        targetInput.checked = true;
                        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    console.log(`[配送渠道] 已点击 for=${forId} 的目标元素`);
                    await sleep(500);
                    return;
                }
            }
            // 如果没有for属性，直接点击label
            el.click();
            console.log('[配送渠道] 已点击 kat-label');
            await sleep(500);
            return;
        }

        // 如果是label或其他包装元素，尝试点击它
        if (['LABEL', 'SPAN', 'DIV'].includes(el.tagName)) {
            // 先检查for属性
            const forId = el.getAttribute('for');
            if (forId) {
                const targetInput = document.getElementById(forId);
                if (targetInput) {
                    targetInput.click();
                    if (targetInput.type === 'radio') {
                        targetInput.checked = true;
                        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    console.log(`[配送渠道] 已点击 for=${forId} 的目标元素`);
                    await sleep(500);
                    return;
                }
            }

            // 查找内部或相邻的radio
            const radio = el.querySelector('input[type="radio"]') ||
                el.parentElement?.querySelector('input[type="radio"]');
            if (radio) {
                radio.click();
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('[配送渠道] 已选择 (via label)');
                await sleep(500);
                return;
            }

            // 直接点击元素
            el.click();
            console.log('[配送渠道] 已点击包装元素');
            await sleep(500);
            return;
        }
    }

    console.warn(`[配送渠道] 未找到 ${channel} 选项`);
}

/**
 * 填写变体页 (Variations Page)
 * 支持多行变体数据
 */
async function fillVariationsPage(data, options) {
    console.log('[变体页] 开始填写');

    // 切换到"所有属性"视图
    await switchToAllAttributesView();
    await sleep(500);

    // 支持多行变体模式: data.variations 是数组
    const variations = data.variations || [data];
    console.log(`[变体页] 检测到 ${variations.length} 个变体`);

    // 1. 选择 Variation Theme (使用第一个变体的主题)
    const firstVar = variations[0];
    const themes = [];
    if (firstVar.size) themes.push('Size');
    if (firstVar.color) themes.push('Color');
    if (firstVar.style) themes.push('Style');
    if (firstVar.item_package_quantity) themes.push('Item Package Quantity');

    console.log(`[变体页] 需要选择的主题: ${themes.join(', ')}`);

    for (const theme of themes) {
        const checkboxes = document.querySelectorAll('kat-checkbox, input[type="checkbox"]');
        for (const cb of checkboxes) {
            const label = cb.getAttribute('label') || cb.textContent || '';
            if (label.includes(theme)) {
                // 检查是否已勾选 (kat-checkbox 用 attribute，input 用 property)
                const isChecked = cb.tagName === 'KAT-CHECKBOX'
                    ? cb.getAttribute('checked') === 'true' || cb.hasAttribute('checked')
                    : cb.checked;

                if (!isChecked) {
                    console.log(`[变体页] 尝试勾选主题: ${theme}`, cb);

                    // 策略 1: 直接点击
                    cb.click();

                    // 策略 2: 如果是 kat-checkbox，尝试点击其内部的 input (Shadow DOM)
                    if (cb.tagName === 'KAT-CHECKBOX' && cb.shadowRoot) {
                        const innerInput = cb.shadowRoot.querySelector('input');
                        if (innerInput) {
                            innerInput.click();
                        }
                    }

                    // 策略 3: 手动设置属性并触发事件
                    if (cb.tagName === 'KAT-CHECKBOX') {
                        cb.setAttribute('checked', 'true');
                        cb.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
                    } else {
                        cb.checked = true;
                        cb.dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    console.log(`[变体页] 已勾选主题: ${theme}`);
                    await sleep(500);
                }
                break;
            }
        }
    }

    // 等待主题勾选后的输入框生成
    await sleep(2500);

    // 2. 填写每个变体的属性并点击 Add
    console.log('[变体页] 开始逐个添加变体');

    for (let i = 0; i < variations.length; i++) {
        // 检查是否暂停或停止
        const { workflowStatus } = await chrome.storage.local.get(['workflowStatus']);
        if (workflowStatus === 'paused') {
            console.log('🔴 [暂停检查] 检测到暂停状态，停止填写');
            throw new Error('用户暂停了工作流');
        }
        if (workflowStatus === 'stopped') {
            console.log('⛔ [停止检查] 检测到停止状态，终止填写');
            throw new Error('用户停止了工作流');
        }

        const varData = variations[i];
        console.log(`[变体页] 正在添加变体 ${i + 1}/${variations.length}`);

        // 构建属性列表
        const attributes = [];
        if (varData.size) attributes.push({ key: 'size', value: varData.size });
        if (varData.color) attributes.push({ key: 'color', value: varData.color });
        if (varData.style) attributes.push({ key: 'style', value: varData.style });
        if (varData.item_package_quantity) attributes.push({ key: 'item_package_quantity', value: varData.item_package_quantity });

        // 填写每个属性
        for (const attr of attributes) {
            // 查找输入框策略：
            // 1. 精确ID: size#1.value-input
            // 2. 包含key的ID: [id*="size"][id*="value"]
            // 3. 包含key的kat-input: kat-input[id*="size"]
            const inputId = `${attr.key}#1.value-input`;
            let input = document.getElementById(inputId);

            if (!input) {
                console.log(`[变体页] 精确ID未找到 (${inputId})，尝试备用查找...`);
                // 备用1: 通过 querySelector 查找 id 包含 attr.key 的输入框
                input = document.querySelector(`[id*="${attr.key}"][id*="value-input"]`);
            }

            if (!input) {
                // 备用2: 查找 kat-input
                input = document.querySelector(`kat-input[id*="${attr.key}"]`);
            }

            if (input) {
                console.log(`[变体页] 找到输入框: ${attr.key}`, input.id || input.tagName);
                await fillField(input, attr.value, options);
                await sleep(300);

                // 立即查找并点击该属性对应的 "Add" 按钮
                // Add 按钮通常是 input 的 nextElementSibling 或在父级里
                let addButton = input.nextElementSibling;
                if (!addButton || !(addButton.tagName === 'BUTTON' || addButton.tagName === 'KAT-BUTTON')) {
                    // 在父级里查找
                    const parent = input.parentElement;
                    if (parent) {
                        addButton = parent.querySelector('button, kat-button');
                    }
                }

                if (addButton) {
                    const btnText = (addButton.textContent || addButton.getAttribute('label') || '').toLowerCase();
                    if (btnText.includes('add') || btnText.includes('添加')) {
                        addButton.click();
                        console.log(`[变体页] 已点击 Add 按钮 (${attr.key})`);
                        await sleep(800); // 等待 UI 更新
                    }
                }
            } else {
                console.warn(`[变体页] 未找到属性输入框: ${attr.key}`);
            }
        }
    }

    // 等待矩阵生成
    await sleep(3000);

    // 3. 填写变体矩阵 (Offer Matrix) - 使用 ID 后缀匹配
    console.log('[变体页] 开始填写报价矩阵 - 启动 ID 后缀匹配模式');

    const matrixInputs = Array.from(document.querySelectorAll('input, kat-input, select, kat-select'));

    for (let i = 0; i < variations.length; i++) {
        // 检查是否暂停或停止
        const { workflowStatus } = await chrome.storage.local.get(['workflowStatus']);
        if (workflowStatus === 'paused') {
            console.log('🔴 [暂停检查] 检测到暂停状态，停止填写');
            throw new Error('用户暂停了工作流');
        }
        if (workflowStatus === 'stopped') {
            console.log('⛔ [停止检查] 检测到停止状态，终止填写');
            throw new Error('用户停止了工作流');
        }

        const varData = variations[i];
        console.log(`[变体页] 正在为变体匹配矩阵行: ${varData.item_name || 'Item ' + (i + 1)}`);

        let matchedSuffix = null;

        // 构建特征值列表
        const featureValues = [];
        if (varData.size) featureValues.push({ key: 'size', val: varData.size });
        if (varData.color) featureValues.push({ key: 'color', val: varData.color });
        if (varData.style) featureValues.push({ key: 'style', val: varData.style });
        if (varData.item_package_quantity) featureValues.push({ key: 'item_package_quantity', val: varData.item_package_quantity });

        if (featureValues.length === 0) {
            console.warn('[变体页] 变体缺少特征值，无法定位矩阵行');
            continue;
        }

        // 寻找锚点输入框（用来获取 ID 后缀）
        for (const feature of featureValues) {
            const targetVal = String(feature.val).trim().toLowerCase();

            const candidate = matrixInputs.find(inp => {
                const v = String(inp.value || inp.getAttribute('value') || '').trim().toLowerCase();
                const id = String(inp.id || inp.getAttribute('uid') || '').toLowerCase();

                // 排除批量修改行
                if (id.includes('bulk-update-row')) return false;

                // 排除创建输入框 (value-input 结尾的)
                if (id.endsWith('value-input')) return false;

                // 只匹配矩阵行 (通常包含 gio_child, child, row 等关键词)
                if (!id.includes('gio_child') && !id.includes('-child-') && !id.includes('_row')) {
                    // 如果ID不包含明显的行标识符，跳过
                    return false;
                }

                return v === targetVal && id.includes(feature.key);
            });

            if (candidate) {
                const idObj = candidate.id || candidate.getAttribute('uid');
                const lastDashIndex = idObj.lastIndexOf('-');
                if (lastDashIndex !== -1) {
                    matchedSuffix = idObj.substring(lastDashIndex);
                    console.log(`[变体页] 成功定位矩阵行! 后缀: ${matchedSuffix} (通过 ${feature.key}=${feature.val})`);
                    break;
                }
            }
        }

        if (matchedSuffix) {
            // 使用后缀查找同行的字段并填写

            // Price
            const priceInput = document.querySelector(`[id*="our_price"][id$="${matchedSuffix}"], [id*="standard_price"][id$="${matchedSuffix}"]`);
            if (priceInput && (varData.your_price || varData.sale_price)) {
                await fillField(priceInput, varData.your_price || varData.sale_price, options);
            }

            // SKU - 使用变体专用SKU (variation_sku)，如果没有则fallback到sku
            const skuInput = document.querySelector(`[id*="contribution_sku"][id$="${matchedSuffix}"], [id*="sku"][id$="${matchedSuffix}"]`);
            const variationSku = varData.variation_sku || varData.sku;
            if (skuInput && variationSku) {
                await fillField(skuInput, variationSku, options);
            }

            // Quantity
            const qtyInput = document.querySelector(`[id*="quantity"][id$="${matchedSuffix}"]`);
            if (qtyInput && varData.quantity) {
                await fillField(qtyInput, varData.quantity, options);
            }

            // External ID - 使用变体专用ID (variation_external_product_id)
            const extIdInput = document.querySelector(`[id*="externally_assigned_product_identifier"][id$="${matchedSuffix}"], [id*="external_product_id"][id$="${matchedSuffix}"]`);
            const variationExtId = varData.variation_external_product_id || varData.external_product_id;
            if (extIdInput && variationExtId) {
                await fillField(extIdInput, variationExtId, options);
            }

            // External ID Type - 使用变体专用类型，默认UPC/EAN/GTIN
            const extIdTypeInput = document.querySelector(`[id*="external_product_id_type"][id$="${matchedSuffix}"]`);
            const variationExtIdType = varData.variation_external_product_id_type || 'UPC/EAN/GTIN';
            if (extIdTypeInput) {
                await fillField(extIdTypeInput, variationExtIdType, options);
            }

            // Condition - 使用变体专用状况，默认New
            const condInput = document.querySelector(`[id*="condition"][id$="${matchedSuffix}"]`);
            const variationCondition = varData.variation_condition || 'New';
            if (condInput) {
                await fillField(condInput, variationCondition, options);
            }

        } else {
            console.warn(`[变体页] 无法定位变体 "${varData.item_name}" 的矩阵行，尝试备用方法`);

            // 备用方法：直接通过标签文本查找下拉框
            await fillVariationDropdownsByLabel(varData, options);
        }
    }

    console.log('[变体页] 填写完成');
}

/**
 * 备用方法：通过标签文本查找并填写变体页的下拉框
 */
async function fillVariationDropdownsByLabel(varData, options) {
    console.log('[变体页备用] 开始通过标签查找下拉框');

    // External Product ID Type - 使用变体专用类型，默认UPC/EAN/GTIN
    const variationExtIdType = varData.variation_external_product_id_type || 'UPC/EAN/GTIN';
    const extTypeDropdown = findDropdownByLabel(['External Product ID Type', '外部产品 ID 类型', '外部商品ID']);
    if (extTypeDropdown) {
        console.log(`[变体页备用] 找到 External Product ID Type 下拉框，填写: ${variationExtIdType}`);
        await fillDropdown(extTypeDropdown, variationExtIdType);
        await sleep(500);
    } else {
        console.warn('[变体页备用] 未找到 External Product ID Type 下拉框');
    }

    // Item Condition - 使用变体专用状况，默认New
    const variationCondition = varData.variation_condition || 'New';
    const condDropdown = findDropdownByLabel(['Item Condition', 'Condition', '商品状況', 'コンディション']);
    if (condDropdown) {
        console.log(`[变体页备用] 找到 Item Condition 下拉框，填写: ${variationCondition}`);
        await fillDropdown(condDropdown, variationCondition);
        await sleep(500);
    } else {
        console.warn('[变体页备用] 未找到 Item Condition 下拉框');
    }
}

/**
 * 通过标签文本查找下拉框
 */
function findDropdownByLabel(labels) {
    // 查找所有可能的标签元素
    const allLabels = document.querySelectorAll('label, kat-label, span, div');

    for (const labelEl of allLabels) {
        const text = labelEl.textContent.trim();

        // 检查是否匹配任一标签
        const matches = labels.some(l => text.includes(l));
        if (!matches) continue;

        // 查找关联的下拉框
        // 方法1: for属性
        const forId = labelEl.getAttribute('for');
        if (forId) {
            const dropdown = document.getElementById(forId);
            if (dropdown) return dropdown;
        }

        // 方法2: 父级容器内的下拉框
        let parent = labelEl.parentElement;
        for (let i = 0; i < 5 && parent; i++) {
            const dropdown = parent.querySelector('select, kat-select, kat-dropdown, [role="listbox"], [role="combobox"]');
            if (dropdown) return dropdown;
            parent = parent.parentElement;
        }

        // 方法3: 紧邻的下一个元素
        let sibling = labelEl.nextElementSibling;
        while (sibling) {
            if (sibling.tagName === 'SELECT' ||
                sibling.tagName.includes('KAT-') ||
                sibling.getAttribute('role') === 'listbox') {
                return sibling;
            }
            sibling = sibling.nextElementSibling;
        }
    }

    return null;
}

/**
 * 填写图片页
 */
async function fillImagesPage(data) {
    console.log('[图片页] 开始上传图片');

    // 切换到"所有属性"视图
    await switchToAllAttributesView();
    await sleep(500);

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
            const success = await uploadImageFromUrl(img.path, dropZone, targetInput);
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
 * 通用字段填写函数
 */
async function fillField(element, value, options) {
    if (!element) return;

    const tagName = element.tagName.toLowerCase();
    const type = element.getAttribute('type');

    // 0. 特殊处理：如果是 select 或者是 shadow dom 中的 dropdown
    if (tagName === 'select' || tagName === 'kat-select' || tagName === 'kat-dropdown') {
        await fillDropdown(element, value);
        return;
    }

    // 1. Checkbox / Radio
    if (type === 'checkbox' || type === 'radio') {
        // 对于 checkbox，如果 value 是 true/false 或者是 'Yes'/'No'
        if (type === 'checkbox') {
            const shouldCheck = String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'yes';
            if (element.checked !== shouldCheck) {
                element.click();
                await sleep(options.delayBetweenFields || 300);
            }
        } else {
            // Radio
            await selectRadioOption(element, value);
        }
        return;
    }

    // 2. 默认 Textbox
    await fillTextbox(element, value, options && options.humanLikeTyping);
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
            await selectRadioOption(element, value);
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
        // 尝试通过name查找 (支持多名称)
        const names = config.fallback.names || (config.fallback.name ? [config.fallback.name] : []);

        for (const name of names) {
            let element = document.querySelector(`[name="${name}"]`);
            // 如果Document中没找到，尝试在Shadow DOM中查找
            if (!element) {
                element = findElementByNameInShadowDOM(name);
            }
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
                    innerSelector = 'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]):not([type="file"]), textarea, select, kat-input, kat-textarea, kat-select, kat-combobox, kat-autocomplete';
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
                        selector = 'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]):not([type="file"]), textarea, select, kat-input, kat-textarea, kat-select, kat-combobox, kat-autocomplete';
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
 * 在Shadow DOM中通过name查找元素
 */
function findElementByNameInShadowDOM(name) {
    function search(root) {
        // 先在当前层级找
        const element = root.querySelector(`[name="${name}"]`);
        if (element) return element;

        // 递归查找子Shadow DOM
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

        if (tagName === 'kat-input' || tagName === 'kat-textarea' || tagName === 'kat-date-picker') {
            isKatElement = true;
            // 尝试获取内部的 input/textarea
            if (element.shadowRoot) {
                nativeInput = element.shadowRoot.querySelector('input, textarea') || element;
            }
        }

        if (nativeInput.type === 'file') {
            console.warn(`[填写] 跳过: 目标是文件上传框，fillTextbox 不支持 (应使用 fillFile)`);
            return;
        }

        console.log(`[填写] 目标元素: ${tagName}, Type: ${nativeInput.type}, Value: ${value}`);

        // 0. 幂等性检查 (Idempotency Check)
        // 如果当前值已经等于目标值，直接跳过，防止重复填写
        if (isAlreadyFilled(nativeInput, value)) {
            console.log(`[填写] 值相同/已填写，跳过 (Target: ${value})`);
            markAsFilled(element, value); // 确保加上视觉标记
            await sleep(200);
            return;
        }

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

                // 同步更新 host 元素 (排除 kat-date-picker，因为它内部逻辑复杂，手动更新host会导致报错)
                if (isKatElement && tagName !== 'kat-date-picker') {
                    element.value = nativeInput.value;
                    element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                }
                await sleep(randomInt(30, 80));
            }
        } else {
            nativeInput.value = value;
            nativeInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            if (isKatElement && tagName !== 'kat-date-picker') {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            }
        }

        // 触发 change 和 blur
        nativeInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        nativeInput.blur();

        if (isKatElement && tagName !== 'kat-date-picker') {
            element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        }

        markAsFilled(element, value);

    } catch (e) {
        console.error('[填写] fillTextbox 发生错误:', e);
        throw e;
    }
}


/**
 * 填写下拉框
 */
async function fillDropdown(element, value) {
    // 尝试查找映射值
    const mappedValue = DROPDOWN_MAPPING[value] || value;

    // 0. 幂等性检查 (Idempotency Check)
    if (isAlreadyFilled(element, value)) {
        console.log(`[下拉] 值相同/已填写，跳过 (Target: ${value})`);
        markAsFilled(element, value);
        return;
    }

    // 检查当前选中的值是否已经包含目标关键词
    let currentValue = element.value || element.textContent || '';
    // 如果是 kat-dropdown 或其他组件，尝试从 shadow dom 或属性获取 label
    if (element.tagName.includes('KAT-')) {
        const shadow = element.shadowRoot;
        if (shadow) {
            const displaySpan = shadow.querySelector('.selection-text, .selected-option, .text-content');
            if (displaySpan) {
                currentValue = displaySpan.textContent;
            }
        }
    }

    if (currentValue && (currentValue.includes(value) || currentValue.includes(mappedValue))) {
        console.log(`[下拉框] 已选中目标值，跳过 (Current: ${currentValue}, Target: ${value})`);
        highlightElement(element);
        await sleep(500);
        return;
    }

    // 点击打开下拉框
    element.click();
    await sleep(300);
    // 如果是输入框类型的下拉（Autocomplete），模拟输入以过滤选项
    if (element.tagName === 'INPUT' || (element.tagName === 'KAT-INPUT')) {
        console.log(`[下拉框] 检测到输入框，尝试输入过滤: ${value}`);
        // 使用 fillTextbox 的逻辑来模拟输入
        await fillTextbox(element, value, true);
        await sleep(2500); // 等待选项过滤加载
    }

    // 尝试查找映射值
    // 尝试查找映射值 (已在函数开头定义)
    // const mappedValue = DROPDOWN_MAPPING[value] || value;

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
        // 如果是输入框，且没找到选项，但已经输入了值，可能也没关系（如果是允许自定义值的Combobox）
        if (element.tagName !== 'INPUT' && element.tagName !== 'KAT-INPUT') {
            showFloatingError(`未找到下拉选项: ${value}`);
        } else {
            // 尝试触发 Enter 键，确认输入
            element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
            await sleep(100);
            element.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true }));
        }
    }
    markAsFilled(element, value);
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
            // 扩展支持 kat-option 和 li (Amazon有些下拉是li结构)
            if ((el.role === 'option' || el.tagName === 'OPTION' || el.tagName === 'KAT-OPTION' || el.tagName === 'LI') &&
                el.textContent.includes(value)) {
                // 排除 hidden 的
                if (el.style.display !== 'none') {
                    options.push(el);
                }
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
 * 选择单选按钮 (支持按值/Label查找)
 */
async function selectRadioOption(element, value) {
    console.log(`[单选] 尝试选择: ${value}`, element);

    // 1. 获取所有同名 Radio Group
    const name = element.getAttribute('name');
    let group = [];

    if (name) {
        // 在 Shadow DOM 或 Document 中查找
        const root = element.getRootNode();
        if (root) {
            group = Array.from(root.querySelectorAll(`input[type="radio"][name="${name}"], kat-radio[name="${name}"]`));
        }
    }

    if (group.length === 0) {
        group = [element]; // Fallback to single element
    }

    // 2. 找到匹配的 Option
    let target = null;

    // 策略 A: 匹配 Label 文本
    for (const radio of group) {
        // 找关联 Label
        let labelText = '';
        if (radio.labels && radio.labels.length > 0) {
            labelText = radio.labels[0].textContent;
        } else {
            // 尝试在父级或兄弟节点找文本
            const parent = radio.parentElement;
            if (parent) labelText = parent.textContent;
        }

        // 清理文本
        labelText = labelText.replace(/\s+/g, ' ').trim();
        const valueClean = String(value).replace(/\s+/g, ' ').trim();

        // 模糊匹配 (Yes/No, Yes/No based patterns)
        if (labelText.includes(valueClean) || valueClean.includes(labelText)) {
            target = radio;
            console.log(`[单选] 通过 Label 匹配到:`, radio);
            break;
        }

        // 策略 B: 匹配 Value 属性
        if (radio.value === value || radio.getAttribute('value') === value) {
            target = radio;
            console.log(`[单选] 通过 Value 属性匹配到:`, radio);
            break;
        }

        // 策略 C: 针对 Yes/No 的特殊处理
        const isYes = /yes|true|hai|open|public/i.test(valueClean);
        const isNo = /no|false|iie|private/i.test(valueClean);

        if (isYes && /yes|true|hai/i.test(labelText)) { target = radio; break; }
        if (isNo && /no|false|iie/i.test(labelText)) { target = radio; break; }
    }

    if (!target) {
        // 如果找不到匹配的，但 group 里也就是 Yes/No 两个，且 value 是 Yes/No，尝试按顺序猜？
        // 不推荐，还是只点击传进来的 element 作为 fallback
        console.warn(`[单选] 未找到匹配 "${value}" 的选项，尝试点击默认找到的元素`);
        target = element;
    }

    // 3. 执行点击 (多重策略)
    // 0. 幂等性检查
    if (isAlreadyFilled(target, value)) {
        console.log(`[单选] 已选择，跳过: ${value}`);
        markAsFilled(target, value);
        return;
    }
    try {
        console.log('[单选] 执行点击:', target);
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(200);

        // 策略 1: 直接 Click
        target.click();
        // 策略 2: Force Click Parent (如果 target 是 hidden input)
        if (getComputedStyle(target).getPropertyValue('opacity') === '0' || target.style.display === 'none') {
            if (target.parentElement) target.parentElement.click();
        }

        // 策略 3: Dispatch Input/Change
        target.checked = true;
        target.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        target.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        target.dispatchEvent(new Event('click', { bubbles: true, composed: true }));

    } catch (e) {
        console.error('[单选] 点击失败:', e);
    }
    markAsFilled(target, value);
}

/**
 * 切换到"所有属性"视图
 */
async function switchToAllAttributesView() {
    console.log('[切换视图] 切换到所有属性...');

    // 1. 精确查找 (根据控制台分析结果)
    // value="ALL_ATTRIBUTES_VIEW_MODE" 或 name="attribute_filter_radio_buttons-all"
    const targetSelector = 'kat-radiobutton[value="ALL_ATTRIBUTES_VIEW_MODE"], kat-radiobutton[name="attribute_filter_radio_buttons-all"]';
    const preciseMatch = document.querySelector(targetSelector);

    if (preciseMatch) {
        console.log('[切换视图] 找到精确匹配 (Value/Name):', preciseMatch);

        // 尝试点击内部 input (slot="radio")
        const innerRadio = preciseMatch.querySelector('input[type="radio"]');
        if (innerRadio) {
            console.log('[切换视图] 点击内部 input...');
            innerRadio.click();
            innerRadio.checked = true;
            innerRadio.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        } else {
            console.log('[切换视图] 点击组件本身...');
            preciseMatch.click();
        }

        await sleep(500);
        return true;
    }

    // 2. 模糊查找 (作为后备)
    const keywords = ['所有属性', 'すべての属性', 'All attributes', 'all attributes'];

    // 查找 kat-radiobutton
    const katRadios = document.querySelectorAll('kat-radiobutton');
    for (const radioBtn of katRadios) {
        const label = (radioBtn.getAttribute('label') || '').toLowerCase();
        const text = (radioBtn.textContent || '').toLowerCase();

        const matches = keywords.some(keyword =>
            label.includes(keyword.toLowerCase()) || text.includes(keyword.toLowerCase())
        );

        if (matches) {
            console.log(`[切换视图] 找到 kat-radiobutton (Label匹配): "${radioBtn.getAttribute('label')}"`);

            const innerRadio = radioBtn.querySelector('input[type="radio"]');
            if (innerRadio) {
                innerRadio.click();
                innerRadio.checked = true;
                innerRadio.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
            } else {
                radioBtn.click();
            }
            return true;
        }
    }

    // 查找普通 input[type="radio"]
    const radioButtons = document.querySelectorAll('input[type="radio"], kat-radio');
    for (const radio of radioButtons) {
        const label = radio.nextElementSibling || radio.parentElement;
        if (label) {
            const text = label.textContent.trim();
            if (keywords.some(keyword => text.includes(keyword))) {
                radio.click();
                console.log('[切换视图] ✓ 已切换到所有属性 (Label匹配)');
                return true;
            }
        }

        const title = radio.title || radio.getAttribute('label') || '';
        if (keywords.some(keyword => title.includes(keyword))) {
            radio.click();
            console.log('[切换视图] ✓ 已切换到所有属性 (Title匹配)');
            return true;
        }
    }

    console.warn('[切换视图] 未找到所有属性按钮');
    return false;
}

// 注意: selectFulfillmentChannel 函数已在第648行定义，此处不再重复定义

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
            // highlightLocalElement(fileInput.parentElement || fileInput);
            highlightLocalElement(fileInput.parentElement || fileInput);
        }
    }, 1000);
}


/**
 * 高亮显示元素
 */
function highlightLocalElement(element) {
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
/**
 * 从URL上传图片 (模拟拖拽)
 * 支持本地服务器路径转换
 */
async function uploadImageFromUrl(pathOrUrl, dropZone, inputElement) {
    try {
        let url = pathOrUrl;
        let filename = 'image.jpg'; // default

        // 1. Base64 Data URI
        if (pathOrUrl.startsWith('data:image')) {
            url = pathOrUrl;
            const ext = pathOrUrl.substring(pathOrUrl.indexOf('/') + 1, pathOrUrl.indexOf(';'));
            filename = `upload_${Date.now()}.${ext || 'jpg'}`;
            console.log(`[图片] 检测到Base64图片, 生成文件名: ${filename}`);
        }
        // 2. HTTP/HTTPS URL
        else if (pathOrUrl.startsWith('http')) {
            url = pathOrUrl;
            // 尝试从URL中提取干净的文件名
            try {
                const urlObj = new URL(pathOrUrl);
                let namePart = urlObj.pathname.split('/').pop(); // 获取最后一部分
                // 去除可能存在的 CDN 修饰符 (如 !w300, @something 等)
                namePart = namePart.split('!')[0].split('@')[0];
                filename = decodeURIComponent(namePart);
                if (!filename) filename = 'image.jpg';
            } catch (e) {
                filename = 'image.jpg';
            }
        }
        // 3. 本地路径 -> Localhost (需要开启本地 Python Server)
        else {
            filename = pathOrUrl.split(/[/\\]/).pop();
            url = `http://localhost:8000/${filename}`;
            console.log(`[图片] 转换本地路径为URL: ${url}`);
        }

        // 使用Background Script代理请求 (避开CORS)
        console.log(`[图片] 请求后台下载: ${url}`);
        const response = await chrome.runtime.sendMessage({ action: 'fetchUrl', url: url });

        if (!response.success) throw new Error(`Fetch failed via background: ${response.error}`);

        // 检查 Content-Type
        if (!response.type || !response.type.startsWith('image/')) {
            throw new Error(`Invalid content type: ${response.type}. URL must point to an actual image file (jpg/png), not a webpage.`);
        }

        // Base64 -> Blob
        const byteCharacters = atob(response.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: response.type });
        const file = new File([blob], filename, { type: response.type });

        // 1. 赋值 files (Content Script 中赋值是有效的)
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        if (inputElement) {
            inputElement.files = dataTransfer.files;

            // 2. 使用 Script Injection 在 Main World 中触发事件
            // 使用 src 注入绕过 CSP unsafe-inline 限制
            const triggerId = 'upload_' + Date.now();
            inputElement.setAttribute('data-upload-trigger-id', triggerId);

            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('upload_helper.js');
            script.onload = function () {
                this.remove();
            };
            (document.head || document.documentElement).appendChild(script);

            console.log('[图片] 已注入 upload_helper.js，等待 main world 执行');
        }

        // 同时也尝试拖拽模拟 (作为fallback)
        if (dropZone) {
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
}
