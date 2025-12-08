/**
 * Popup.js - 主控制逻辑 v3.0.2
 * 功能：Excel读取、页面监控、自动化上传控制、日志显示
 * 更新：集成专业日志系统，增强操作追踪
 */

// ========== 初始化日志系统 ==========
const logger = new ExtensionLogger('popup');
logger.info('插件初始化 v3.0.2');

// ========== 全局状态 ==========
let state = {
    products: [],           // 商品数据
    currentIndex: 0,        // 当前商品索引
    isRunning: false,       // 是否正在运行
    isPaused: false,        // 是否暂停
    currentPage: 'unknown', // 当前页面
    expectedPage: null,     // 预期页面
    settings: {
        autoSearch: true,
        autoNavigate: true,
        autoFill: true,
        humanLike: true
    }
};

// ========== DOM元素 ==========
let elements = {};

function initializeElements() {
    elements = {
        // 页面监控
        statusDot: document.getElementById('statusDot'),
        currentPageText: document.getElementById('currentPageText'),
        expectedPageText: document.getElementById('expectedPageText'),

        // Excel上传
        excelFile: document.getElementById('excelFile'),
        fileUpload: document.getElementById('fileUpload'),
        fileName: document.getElementById('fileName'),

        // 商品导航
        productNav: document.getElementById('productNav'),
        totalProducts: document.getElementById('totalProducts'),
        currentProductTitle: document.getElementById('currentProductTitle'),
        currentProductASIN: document.getElementById('currentProductASIN'),
        currentProductPrice: document.getElementById('currentProductPrice'),
        prevProduct: document.getElementById('prevProduct'),
        nextProduct: document.getElementById('nextProduct'),

        // 自动化设置
        autoSearch: document.getElementById('autoSearch'),
        autoNavigate: document.getElementById('autoNavigate'),
        autoFill: document.getElementById('autoFill'),
        humanLike: document.getElementById('humanLike'),

        // 操作按钮
        startAutoUpload: document.getElementById('startAutoUpload'),
        fillCurrentPage: document.getElementById('fillCurrentPage'),
        controlButtons: document.getElementById('controlButtons'),
        pauseButton: document.getElementById('pauseButton'),
        stopButton: document.getElementById('stopButton'),

        // 进度和日志
        progressSection: document.getElementById('progressSection'),
        progressFill: document.getElementById('progressFill'),
        progressText: document.getElementById('progressText'),
        logs: document.getElementById('logs')
    };

    // 验证关键元素是否存在
    if (!elements.fileName) console.error('CRITICAL: fileName element not found!');
    if (!elements.fileUpload) console.error('CRITICAL: fileUpload element not found!');
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded事件触发');

    // 初始化DOM元素
    initializeElements();

    // 显示日志容器
    if (elements.logs) elements.logs.classList.add('show');

    // 初始化日志
    addLog('info', '🚀 插件已加载');

    // 检查xlsx库
    if (typeof XLSX !== 'undefined') {
        addLog('success', '✓ Excel解析库加载成功');
        console.log('XLSX库加载成功');
    } else {
        addLog('error', '✗ Excel解析库加载失败，请检查libs/xlsx.full.min.js');
        console.error('XLSX库未定义');
    }

    // 检查文件输入元素
    if (elements.excelFile) {
        console.log('文件输入元素存在:', elements.excelFile);
    } else {
        console.error('文件输入元素不存在');
    }

    loadSettings();
    setupEventListeners();
    await checkCurrentPage();
    startPageMonitoring();
    restoreState();

    addLog('info', '等待用户上传Excel文件...');
});

// ========== 设置管理 ==========
function loadSettings() {
    chrome.storage.sync.get(['settings'], (result) => {
        if (result.settings) {
            state.settings = { ...state.settings, ...result.settings };

            // 更新UI
            if (elements.autoSearch) elements.autoSearch.checked = state.settings.autoSearch;
            if (elements.autoNavigate) elements.autoNavigate.checked = state.settings.autoNavigate;
            if (elements.autoFill) elements.autoFill.checked = state.settings.autoFill;
            if (elements.humanLike) elements.humanLike.checked = state.settings.humanLike;
        }
    });
}

function saveSettings() {
    chrome.storage.sync.set({ settings: state.settings });
}

function updateSettingsFromUI() {
    if (elements.autoSearch) state.settings.autoSearch = elements.autoSearch.checked;
    if (elements.autoNavigate) state.settings.autoNavigate = elements.autoNavigate.checked;
    if (elements.autoFill) state.settings.autoFill = elements.autoFill.checked;
    if (elements.humanLike) state.settings.humanLike = elements.humanLike.checked;
    saveSettings();
}

// ========== 事件监听 ==========
function setupEventListeners() {
    console.log('setupEventListeners被调用');

    // Excel文件上传
    if (elements.excelFile) {
        elements.excelFile.addEventListener('change', handleFileSelect);
        console.log('文件change事件监听器已添加');
    } else {
        console.error('无法添加事件监听器：elements.excelFile不存在');
    }

    // 商品导航
    if (elements.prevProduct) elements.prevProduct.addEventListener('click', () => navigateProduct(-1));
    if (elements.nextProduct) elements.nextProduct.addEventListener('click', () => navigateProduct(1));

    // 设置变化
    const settingsCheckboxes = [elements.autoSearch, elements.autoNavigate, elements.autoFill, elements.humanLike];
    settingsCheckboxes.forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', updateSettingsFromUI);
        }
    });

    // 操作按钮
    if (elements.startAutoUpload) elements.startAutoUpload.addEventListener('click', startAutoUpload);
    if (elements.fillCurrentPage) elements.fillCurrentPage.addEventListener('click', fillCurrentPageOnly);
    if (elements.pauseButton) elements.pauseButton.addEventListener('click', togglePause);
    if (elements.stopButton) elements.stopButton.addEventListener('click', stopExecution);
}

// ========== 页面监控 ==========
async function checkCurrentPage() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        chrome.tabs.sendMessage(tab.id, { action: 'getPageStatus' }, (response) => {
            if (chrome.runtime.lastError) {
                updatePageStatus('unknown', null);
                return;
            }

            if (response && response.page) {
                updatePageStatus(response.page, response.expected);
            }
        });
    } catch (error) {
        console.error('检查页面失败:', error);
    }
}

function startPageMonitoring() {
    // 每2秒检查一次页面状态
    setInterval(checkCurrentPage, 2000);
}

function updatePageStatus(page, expected) {
    state.currentPage = page;
    state.expectedPage = expected;

    // 页面名称映射
    const pageNames = {
        'home': '卖家中心首页',
        'addProduct': '添加商品页',
        'productDetails': '产品详情',
        'safetyCompliance': '安全合规',
        'offer': '报价',
        'images': '图片',
        'unknown': '未知页面'
    };

    const pageName = pageNames[page] || page;
    if (elements.currentPageText) elements.currentPageText.textContent = `当前页: ${pageName}`;

    // 更新状态点颜色
    if (elements.statusDot) {
        elements.statusDot.className = 'status-dot';
        if (!expected) {
            elements.statusDot.classList.add('unknown');
            if (elements.expectedPageText) elements.expectedPageText.textContent = '';
        } else if (page === expected) {
            elements.statusDot.classList.add('matched');
            if (elements.expectedPageText) elements.expectedPageText.textContent = '✓ 页面正确';
        } else {
            elements.statusDot.classList.add('mismatched');
            if (elements.expectedPageText) elements.expectedPageText.textContent = `⚠️ 期望: ${pageNames[expected]}`;
        }
    }
}

// ========== Excel文件处理 ==========
async function handleFileSelect(event) {
    console.log('handleFileSelect被调用', event);
    const file = event.target.files[0];
    console.log('选择的文件:', file);
    if (!file) {
        addLog('warning', '未选择文件');
        console.log('没有文件被选择');
        return;
    }

    // 开始操作追踪
    logger.startOperation('excel_upload', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
    });

    addLog('info', `📁 选择文件: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    try {
        // 步骤1: 检查文件类型
        addLog('info', '⏳ 步骤1/5: 检查文件类型...');
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!validExtensions.includes(fileExtension)) {
            throw new Error(`不支持的文件类型: ${fileExtension}`);
        }
        addLog('success', `✓ 文件类型有效: ${fileExtension}`);

        // 步骤2: 读取文件
        addLog('info', '⏳ 步骤2/5: 读取文件内容...');
        let products = await readExcelFile(file);
        addLog('success', `✓ 文件读取成功，共 ${products.length} 行数据`);

        // 步骤2.5: 处理多行变种数据
        // 逻辑：如果有相同的 item_name (或 ASIN)，则视为变种行，合并到第一个父商品中
        const groupedProducts = [];
        let currentProduct = null;

        products.forEach((row, index) => {
            // 简单的归组逻辑：检查 title/asin 是否与上一个相同，或者如果是空行但有变种属性
            // 这里假设: 
            // 1. 相同 item_name / asin 的行属于同一个商品
            // 2. 如果 item_name 为空但前面有商品，可能也是变种（视具体CSV而定，这里先严格按标识符）

            const id = row.asin || row.item_name || row.external_product_id;
            if (!id) return; // 跳过无效行

            if (currentProduct &&
                ((row.asin && row.asin === currentProduct.asin) ||
                    (row.item_name && row.item_name === currentProduct.item_name))) {
                // 属于同一个商品，添加到 variations 数组
                if (!currentProduct.variations) {
                    currentProduct.variations = [currentProduct]; // 把自己作为第一个变种
                }
                currentProduct.variations.push(row);
                // 也可以考虑合并一些字段，例如图片可能是分开的？目前假设父行有完整主信息
            } else {
                // 新商品
                currentProduct = { ...row };
                // 默认初始化 variations 包含自己，方便统一处理
                // 如果只有一行，variations就是 [self]
                currentProduct.variations = [row];
                groupedProducts.push(currentProduct);
            }
        });

        const originalCount = products.length;
        products = groupedProducts; // 替换为分组后的数据
        addLog('info', `📋 检测到多行变种：从 ${originalCount} 行合并为 ${products.length} 个商品任务`);

        // 步骤3: 验证数据
        if (products.length === 0) {
            throw new Error('Excel文件为空，请检查是否有数据');
        }
        addLog('info', '⏳ 步骤3/5: 验证必填字段...');
        validateProducts(products);
        addLog('success', '✓ 数据验证通过');

        // 步骤4: 更新状态和UI
        addLog('info', '⏳ 步骤4/5: 更新界面...');
        state.products = products;
        state.currentIndex = 0;

        // Defensive check: Ensure elements are available
        if (!elements.fileName) {
            console.warn('elements.fileName is missing, attempting to re-fetch...');
            elements.fileName = document.getElementById('fileName');
        }
        if (!elements.fileUpload) {
            console.warn('elements.fileUpload is missing, attempting to re-fetch...');
            elements.fileUpload = document.getElementById('fileUpload');
        }
        if (!elements.totalProducts) {
            console.warn('elements.totalProducts is missing, attempting to re-fetch...');
            elements.totalProducts = document.getElementById('totalProducts');
        }

        if (elements.fileName) {
            elements.fileName.textContent = file.name;
        } else {
            console.error('Failed to find fileName element even after re-fetch');
        }

        if (elements.fileUpload) {
            elements.fileUpload.classList.add('has-file');
        }

        if (elements.totalProducts) {
            elements.totalProducts.textContent = products.length;
        }

        if (elements.productNav) elements.productNav.classList.add('show');
        updateProductDisplay();

        if (elements.startAutoUpload) elements.startAutoUpload.disabled = false;
        if (elements.fillCurrentPage) elements.fillCurrentPage.disabled = false;
        addLog('success', '✓ 界面更新完成');

        // 步骤5: 保存到存储
        addLog('info', '⏳ 步骤5/5: 保存数据...');
        chrome.storage.local.set({
            products: state.products,
            currentIndex: state.currentIndex
        });
        addLog('success', '✓ 数据已保存');

        addLog('success', `🎉 Excel导入成功！共 ${products.length} 个商品，当前第 ${state.currentIndex + 1} 个`);
        addLog('info', '💡 请点击"开始全自动上传"或"仅填写当前页面"按钮');

        // 结束操作追踪 - 成功
        logger.endOperation('excel_upload', true, {
            productCount: products.length,
            validProducts: products.length
        });

    } catch (error) {
        addLog('error', `❌ 读取失败: ${error.message}`);
        console.error('Excel读取详细错误:', error);

        // 结束操作追踪 - 失败
        logger.endOperation('excel_upload', false, error.message);

        // 重置UI状态 - Defensive Checks
        if (elements.fileName) elements.fileName.textContent = '';
        if (elements.fileUpload) elements.fileUpload.classList.remove('has-file');
        if (elements.productNav) elements.productNav.classList.remove('show');
        if (elements.startAutoUpload) elements.startAutoUpload.disabled = true;
        if (elements.fillCurrentPage) elements.fillCurrentPage.disabled = true;

        addLog('info', '请检查文件格式并重新选择');
    }
}

function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('文件读取超时 (10秒)'));
        }, 10000);

        // 如果是CSV文件，使用智能编码检测
        if (file.name.toLowerCase().endsWith('.csv')) {
            console.log('[CSV] 开始智能编码检测...');
            addLog('info', '🔍 检测 CSV 文件编码...');

            const reader = new FileReader();
            reader.onload = async (e) => {
                clearTimeout(timeoutId);

                const buffer = e.target.result;
                let csvText = '';
                let detectedEncoding = 'unknown';

                // 尝试多种编码（按常用程度排序）
                const encodings = ['utf-8', 'gbk', 'shift_jis', 'gb2312', 'big5'];

                for (const encoding of encodings) {
                    try {
                        console.log(`[CSV] 尝试编码: ${encoding}`);
                        const decoder = new TextDecoder(encoding, { fatal: true });
                        const text = decoder.decode(buffer);

                        // 验证解码结果：检查是否包含乱码字符
                        const hasGarbage = /[\uFFFD\u0000-\u0008\u000B-\u000C\u000E-\u001F]/.test(text);
                        if (!hasGarbage && text.length > 0) {
                            csvText = text;
                            detectedEncoding = encoding;
                            console.log(`[CSV] ✓ 编码检测成功: ${encoding}`);
                            addLog('success', `✓ 检测到编码: ${encoding.toUpperCase()}`);
                            break;
                        }
                    } catch (e) {
                        console.log(`[CSV] ${encoding} 解码失败:`, e.message);
                    }
                }

                // 如果所有严格模式都失败，使用 UTF-8 非严格模式
                if (!csvText) {
                    console.log('[CSV] 所有编码尝试失败，使用 UTF-8 fallback');
                    addLog('warning', '⚠️ 无法确定编码，使用 UTF-8 (可能有乱码)');
                    const decoder = new TextDecoder('utf-8');
                    csvText = decoder.decode(buffer);
                    detectedEncoding = 'utf-8 (fallback)';
                }

                console.log(`[CSV] 最终编码: ${detectedEncoding}`);
                console.log(`[CSV] 内容预览: ${csvText.substring(0, 100)}`);

                // 使用 XLSX 解析 CSV 文本
                try {
                    const workbook = XLSX.read(csvText, { type: 'string' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    let jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    console.log('[CSV] 解析成功，原始数据行数:', jsonData.length);

                    // 过滤掉中文注释行（第2行通常包含中文说明，如：商品名称(必填|最多200字)）
                    // 检测方法：如果某行的第一个字段值包含中文括号和"必填/选填"等关键词，则认为是注释行
                    jsonData = jsonData.filter(row => {
                        const firstValue = Object.values(row)[0] || '';
                        const isAnnotationRow =
                            (typeof firstValue === 'string') &&
                            (firstValue.includes('(') || firstValue.includes('（')) &&
                            (firstValue.includes('必填') || firstValue.includes('选填') ||
                                firstValue.includes('|') || firstValue.includes('最多'));

                        if (isAnnotationRow) {
                            console.log('[CSV] 跳过注释行:', firstValue.substring(0, 50));
                            return false; // 过滤掉
                        }
                        return true; // 保留数据行
                    });

                    console.log('[CSV] 过滤后数据行数:', jsonData.length);

                    // 显示第一行数据预览
                    if (jsonData.length > 0) {
                        console.log('[CSV] 第一行数据:', jsonData[0]);
                        const firstRowKeys = Object.keys(jsonData[0]).slice(0, 3).join(', ');
                        addLog('info', `📊 数据列: ${firstRowKeys}...`);
                    }

                    resolve(jsonData);
                } catch (error) {
                    console.error('[CSV] XLSX解析失败:', error);
                    reject(new Error('CSV解析失败: ' + error.message));
                }
            };

            reader.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error('CSV文件读取失败'));
            };

            reader.readAsArrayBuffer(file);

        } else {
            // Excel 文件使用原有逻辑
            const reader = new FileReader();
            reader.onload = (e) => {
                clearTimeout(timeoutId);
                try {
                    console.log('Binary read successful, parsing with XLSX...');
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    console.log('XLSX parse successful');
                    resolve(jsonData);
                } catch (error) {
                    console.warn('XLSX binary parse failed:', error);
                    reject(error);
                }
            };

            reader.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error('文件读取失败'));
            };

            console.log('Starting binary read...');
            reader.readAsArrayBuffer(file);
        }
    });
}

function validateProducts(products) {
    const requiredFields = ['asin', 'title', 'brand'];

    products.forEach((product, index) => {
        const missing = requiredFields.filter(field => !product[field]);

        if (missing.length > 0) {
            addLog('warning', `商品 ${index + 1} 缺少字段: ${missing.join(', ')}`);
        }
    });
}

// ========== 商品导航 ==========
function navigateProduct(direction) {
    const newIndex = state.currentIndex + direction;

    if (newIndex < 0 || newIndex >= state.products.length) {
        addLog('warning', direction > 0 ? '已经是最后一个商品' : '已经是第一个商品');
        return;
    }

    state.currentIndex = newIndex;
    updateProductDisplay();

    chrome.storage.local.set({ currentIndex: state.currentIndex });

    addLog('info', `📍 切换到商品 ${state.currentIndex + 1}/${state.products.length}: ${state.products[state.currentIndex].title || state.products[state.currentIndex].asin}`);
}

function updateProductDisplay() {
    if (state.products.length === 0) {
        return;
    }

    const product = state.products[state.currentIndex];

    if (elements.currentProductTitle) elements.currentProductTitle.textContent = product.title || '-';
    if (elements.currentProductASIN) elements.currentProductASIN.textContent = product.asin || '-';
    if (elements.currentProductPrice) elements.currentProductPrice.textContent = product.your_price ? `¥${product.your_price}` : '-';

    // 更新按钮状态
    if (elements.prevProduct) elements.prevProduct.disabled = state.currentIndex === 0;
    if (elements.nextProduct) elements.nextProduct.disabled = state.currentIndex === state.products.length - 1;
}

// ========== 自动上传流程 ==========
async function startAutoUpload() {
    if (state.products.length === 0) {
        addLog('error', '请先选择Excel文件');
        return;
    }

    // 保存数据到存储
    await chrome.storage.local.set({
        products: state.products,
        currentIndex: state.currentIndex,
        settings: state.settings,
        workflowStatus: 'running'
    });

    addLog('info', '正在启动悬浮面板...');

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            throw new Error('未找到活动标签页');
        }

        // 检查URL是否匹配Amazon
        const isAmazon = tab.url.match(/^https?:\/\/.*\.amazon\.(com|co\.jp|co\.uk|de|fr|it|es|ca)\/.*$/);
        if (!isAmazon) {
            throw new Error('请在亚马逊卖家中心页面使用此功能');
        }

        // 发送启动消息
        await sendMessageWithRetry(tab.id, { action: 'startFloatingPanel' });

        addLog('success', '悬浮面板已启动！您可以关闭此窗口了。');

        // 可选：自动关闭popup
        // window.close();

    } catch (error) {
        addLog('error', `启动失败: ${error.message}`);
        if (error.message.includes('无法连接') || error.message.includes('Could not establish connection')) {
            addLog('info', '💡 提示：请确保您在亚马逊页面上，并尝试刷新页面');
        }
    }
}

/**
 * 完整上传流程
 */
async function uploadProduct(product) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 步骤1: 自动搜索ASIN并进入表单
    if (state.settings.autoSearch) {
        addLog('info', `  [1/5] 搜索ASIN: ${product.asin}`);

        const searchResult = await sendMessageWithRetry(tab.id, {
            action: 'searchASIN',
            asin: product.asin
        }, 3);

        if (!searchResult.success) {
            throw new Error(`ASIN搜索失败: ${searchResult.error}`);
        }

        addLog('success', '  ✓ ASIN搜索完成');
        await sleep(2000);
    }

    // 步骤2-5: 填写4个页面
    const pages = ['productDetails', 'safetyCompliance', 'offer', 'images'];

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageNames = {
            'productDetails': '产品详情',
            'safetyCompliance': '安全合规',
            'offer': '报价',
            'images': '图片'
        };

        addLog('info', `  [${i + 2}/5] 填写${pageNames[page]}`);

        // 等待页面加载
        await waitForPage(tab.id, page);

        // 填写表单 - 使用重试机制
        const fillResult = await sendMessageWithRetry(tab.id, {
            action: 'fillPage',
            page: page,
            product: product,
            settings: state.settings
        }, 3);

        if (!fillResult.success) {
            throw new Error(`${pageNames[page]}填写失败: ${fillResult.error}`);
        }

        addLog('success', `  ✓ ${pageNames[page]}完成`);

        // 自动导航到下一页（除了最后一页）
        if (state.settings.autoNavigate && i < pages.length - 1) {
            await sleep(1000);
            await sendMessageWithRetry(tab.id, {
                action: 'navigateToPage',
                page: pages[i + 1]
            }, 2);
        }
    }
}

/**
 * 仅填写当前页面（不自动导航）
 */
async function fillCurrentPageOnly() {
    if (state.products.length === 0) {
        addLog('error', '❌ 请先选择Excel文件');
        return;
    }

    const product = state.products[state.currentIndex];
    addLog('info', `========== 开始填写当前页面 ==========`);
    addLog('info', `📦 商品: ${product.title || product.asin}`);

    try {
        // 步骤1: 获取当前标签页
        addLog('info', '⏳ 步骤1/4: 获取当前标签页...');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        addLog('success', `✓ 标签页ID: ${tab.id}`);

        // 步骤2: 等待页面就绪
        addLog('info', '⏳ 步骤2/4: 等待页面加载...');
        await waitForPageReady(tab.id);
        addLog('success', '✓ 页面已就绪');

        // 步骤3: 检测当前页面类型
        addLog('info', '⏳ 步骤3/4: 检测页面类型...');
        const status = await sendMessageWithRetry(tab.id, { action: 'getPageStatus' }, 2);
        const currentPage = status.page;

        const pageNames = {
            'productDetails': '产品详情',
            'safetyCompliance': '安全合规',
            'offer': '报价',
            'images': '图片',
            'unknown': '未知页面'
        };
        addLog('success', `✓ 当前页面: ${pageNames[currentPage] || currentPage}`);

        if (currentPage === 'unknown') {
            throw new Error('无法识别当前页面类型，请确保在Amazon商品编辑页面');
        }

        // 步骤4: 填写表单
        addLog('info', '⏳ 步骤4/4: 填写表单字段...');
        addLog('info', `设置: 自动填写=${state.settings.autoFill}, 真人模拟=${state.settings.humanLike}`);

        const result = await sendMessageWithRetry(tab.id, {
            action: 'fillPage',
            page: currentPage,
            product: product,
            settings: state.settings
        });

        if (result.success) {
            addLog('success', `✓ 成功填写 ${result.fieldsCount || 0} 个字段`);
            addLog('success', '🎉 当前页面填写完成！');
            addLog('info', '💡 请手动检查并切换到下一个标签页，或点击"下一个"按钮');
        } else {
            addLog('error', `❌ 填写失败: ${result.error || '未知错误'}`);
        }

    } catch (error) {
        addLog('error', `❌ 操作失败: ${error.message}`);
        console.error('fillCurrentPageOnly详细错误:', error);
    }
}

// ========== 控制功能 ==========
function togglePause() {
    state.isPaused = !state.isPaused;

    if (state.isPaused) {
        if (elements.pauseButton) elements.pauseButton.innerHTML = '<span>▶️</span><span>继续</span>';
        addLog('warning', '⏸️ 已暂停');
    } else {
        if (elements.pauseButton) elements.pauseButton.innerHTML = '<span>⏸️</span><span>暂停</span>';
        addLog('info', '▶️ 继续执行');
    }
}

function stopExecution() {
    state.isRunning = false;
    state.isPaused = false;

    if (elements.controlButtons) elements.controlButtons.style.display = 'none';
    if (elements.startAutoUpload) elements.startAutoUpload.disabled = false;
    if (elements.fillCurrentPage) elements.fillCurrentPage.disabled = false;

    addLog('warning', '⏹️ 已停止');
}

// ========== 进度更新 ==========
function updateProgress(percent) {
    const rounded = Math.round(percent);
    if (elements.progressFill) elements.progressFill.style.width = rounded + '%';
    if (elements.progressText) elements.progressText.textContent = `${rounded}% (${state.currentIndex + 1}/${state.products.length})`;
}

// ========== 日志管理 ==========
function addLog(type, message) {
    // 记录到新的日志系统 v3.0.2
    if (typeof logger !== 'undefined') {
        switch (type) {
            case 'error':
                logger.error(message);
                break;
            case 'warn':
            case 'warning':
                logger.warn(message);
                break;
            case 'success':
            case 'info':
                logger.info(message);
                break;
            default:
                logger.debug(message);
        }
    }

    // 保持原有的UI显示
    if (!elements.logs) return;

    const time = new Date().toLocaleTimeString('zh-CN');

    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;

    const logTime = document.createElement('span');
    logTime.className = 'log-time';
    logTime.textContent = time;

    const logMessage = document.createElement('span');
    logMessage.className = 'log-message';
    logMessage.textContent = message;

    logEntry.appendChild(logTime);
    logEntry.appendChild(logMessage);

    elements.logs.appendChild(logEntry);

    // 自动滚动到底部
    elements.logs.scrollTop = elements.logs.scrollHeight;

    // 限制日志数量
    while (elements.logs.children.length > 100) {
        elements.logs.removeChild(elements.logs.firstChild);
    }

    console.log(`[${type.toUpperCase()}] ${message}`);
}

// ========== 工具函数 ==========
function sendMessage(tabId, message) {
    return new Promise((resolve, reject) => {
        // 添加超时机制
        let timeoutId = setTimeout(() => {
            console.error('消息发送超时:', message.action);
            reject(new Error(`消息超时: ${message.action}`));
        }, 30000); // 30秒超时

        try {
            chrome.tabs.sendMessage(tabId, message, (response) => {
                clearTimeout(timeoutId);

                if (chrome.runtime.lastError) {
                    console.error('Chrome运行时错误:', chrome.runtime.lastError);
                    // 更友好的错误消息
                    if (chrome.runtime.lastError.message.includes('message channel closed')) {
                        reject(new Error('页面响应超时，请刷新页面后重试'));
                    } else if (chrome.runtime.lastError.message.includes('Could not establish connection')) {
                        reject(new Error('无法连接到页面，请刷新页面后重试'));
                    } else {
                        reject(new Error(chrome.runtime.lastError.message));
                    }
                } else if (!response) {
                    console.warn('收到空响应:', message.action);
                    resolve({ success: false, error: '页面无响应' });
                } else {
                    resolve(response);
                }
            });
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('发送消息异常:', error);
            reject(error);
        }
    });
}

async function waitForPage(tabId, expectedPage, timeout = 10000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const status = await sendMessage(tabId, { action: 'getPageStatus' });

        if (status.page === expectedPage) {
            return true;
        }

        await sleep(500);
    }

    throw new Error(`等待页面超时: ${expectedPage}`);
}

// 等待页面完全加载并准备就绪
async function waitForPageReady(tabId, maxRetries = 3) {
    for (let retry = 0; retry < maxRetries; retry++) {
        try {
            // 先等待一下让页面稳定
            await sleep(2000);

            // 尝试发送测试消息
            const response = await sendMessageWithRetry(tabId, {
                action: 'getPageStatus'
            }, retry === 0 ? 1 : 3); // 第一次尝试1次，后续尝试3次

            if (response && (response.page || response.page === 'unknown')) {
                return true;
            }
        } catch (error) {
            console.log(`页面检测尝试 ${retry + 1}/${maxRetries} 失败:`, error.message);

            if (retry < maxRetries - 1) {
                addLog('warning', `⏳ 页面未就绪，等待3秒后重试...`);
                await sleep(3000);
            }
        }
    }

    throw new Error('页面未能在预期时间内就绪');
}

// 带重试的消息发送
async function sendMessageWithRetry(tabId, message, maxRetries = 3) {
    let lastError = null;

    for (let retry = 0; retry < maxRetries; retry++) {
        try {
            const response = await sendMessage(tabId, message);

            if (response && !response.error) {
                return response;
            }

            // 如果有错误但不是致命错误，记录并重试
            if (response && response.error && response.error.includes('未加载')) {
                lastError = response.error;
                if (retry < maxRetries - 1) {
                    await sleep(2000);
                    continue;
                }
            }

            return response;
        } catch (error) {
            lastError = error;
            console.log(`消息发送尝试 ${retry + 1}/${maxRetries} 失败:`, error.message);

            if (retry < maxRetries - 1) {
                // 根据错误类型决定等待时间
                if (error.message.includes('无法连接') || error.message.includes('响应超时')) {
                    await sleep(3000); // 连接问题等待更久
                } else {
                    await sleep(1500);
                }
            }
        }
    }

    throw lastError || new Error('消息发送失败');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ========== 状态恢复 ==========
function restoreState() {
    chrome.storage.local.get(['products', 'currentIndex'], (result) => {
        if (result.products && result.products.length > 0) {
            state.products = result.products;
            state.currentIndex = result.currentIndex || 0;

            // 恢复UI
            if (elements.fileName) elements.fileName.textContent = '(已恢复上次数据)';
            if (elements.fileUpload) elements.fileUpload.classList.add('has-file');
            if (elements.totalProducts) elements.totalProducts.textContent = state.products.length;
            if (elements.productNav) elements.productNav.classList.add('show');

            updateProductDisplay();

            if (elements.startAutoUpload) elements.startAutoUpload.disabled = false;
            if (elements.fillCurrentPage) elements.fillCurrentPage.disabled = false;

            addLog('info', `已恢复 ${state.products.length} 个商品，当前第 ${state.currentIndex + 1} 个`);
        }
    });
}
