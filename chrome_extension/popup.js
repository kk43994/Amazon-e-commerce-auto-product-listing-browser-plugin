/**
 * Popup.js - 主控制逻辑
 * 功能：Excel读取、页面监控、自动化上传控制、日志显示
 */

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
const elements = {
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

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', async () => {
    // 显示日志容器
    elements.logs.classList.add('show');

    // 初始化日志
    addLog('info', '🚀 插件已加载');

    // 检查xlsx库
    if (typeof XLSX !== 'undefined') {
        addLog('success', '✓ Excel解析库加载成功');
    } else {
        addLog('error', '✗ Excel解析库加载失败，请检查libs/xlsx.full.min.js');
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
            elements.autoSearch.checked = state.settings.autoSearch;
            elements.autoNavigate.checked = state.settings.autoNavigate;
            elements.autoFill.checked = state.settings.autoFill;
            elements.humanLike.checked = state.settings.humanLike;
        }
    });
}

function saveSettings() {
    chrome.storage.sync.set({ settings: state.settings });
}

function updateSettingsFromUI() {
    state.settings.autoSearch = elements.autoSearch.checked;
    state.settings.autoNavigate = elements.autoNavigate.checked;
    state.settings.autoFill = elements.autoFill.checked;
    state.settings.humanLike = elements.humanLike.checked;
    saveSettings();
}

// ========== 事件监听 ==========
function setupEventListeners() {
    // Excel文件上传
    elements.excelFile.addEventListener('change', handleFileSelect);

    // 商品导航
    elements.prevProduct.addEventListener('click', () => navigateProduct(-1));
    elements.nextProduct.addEventListener('click', () => navigateProduct(1));

    // 设置变化
    [elements.autoSearch, elements.autoNavigate, elements.autoFill, elements.humanLike]
        .forEach(checkbox => {
            checkbox.addEventListener('change', updateSettingsFromUI);
        });

    // 操作按钮
    elements.startAutoUpload.addEventListener('click', startAutoUpload);
    elements.fillCurrentPage.addEventListener('click', fillCurrentPageOnly);
    elements.pauseButton.addEventListener('click', togglePause);
    elements.stopButton.addEventListener('click', stopExecution);
}

// ========== 页面监控 ==========
async function checkCurrentPage() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

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
    elements.currentPageText.textContent = `当前页: ${pageName}`;

    // 更新状态点颜色
    elements.statusDot.className = 'status-dot';

    if (!expected) {
        elements.statusDot.classList.add('unknown');
        elements.expectedPageText.textContent = '';
    } else if (page === expected) {
        elements.statusDot.classList.add('matched');
        elements.expectedPageText.textContent = '✓ 页面正确';
    } else {
        elements.statusDot.classList.add('mismatched');
        elements.expectedPageText.textContent = `⚠️ 期望: ${pageNames[expected]}`;
    }
}

// ========== Excel文件处理 ==========
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        addLog('warning', '未选择文件');
        return;
    }

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
        const products = await readExcelFile(file);
        addLog('success', `✓ 文件读取成功，共 ${products.length} 行数据`);

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

        elements.fileName.textContent = file.name;
        elements.fileUpload.classList.add('has-file');
        elements.totalProducts.textContent = products.length;

        elements.productNav.classList.add('show');
        updateProductDisplay();

        elements.startAutoUpload.disabled = false;
        elements.fillCurrentPage.disabled = false;
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

    } catch (error) {
        addLog('error', `❌ 读取失败: ${error.message}`);
        console.error('Excel读取详细错误:', error);

        // 重置UI状态
        elements.fileName.textContent = '';
        elements.fileUpload.classList.remove('has-file');
        elements.productNav.classList.remove('show');
        elements.startAutoUpload.disabled = true;
        elements.fillCurrentPage.disabled = true;

        addLog('info', '请检查文件格式并重新选择');
    }
}

function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsArrayBuffer(file);
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

    elements.currentProductTitle.textContent = product.title || '-';
    elements.currentProductASIN.textContent = product.asin || '-';
    elements.currentProductPrice.textContent = product.your_price ? `¥${product.your_price}` : '-';

    // 更新按钮状态
    elements.prevProduct.disabled = state.currentIndex === 0;
    elements.nextProduct.disabled = state.currentIndex === state.products.length - 1;
}

// ========== 自动上传流程 ==========
async function startAutoUpload() {
    if (state.products.length === 0) {
        addLog('error', '请先选择Excel文件');
        return;
    }

    if (state.isRunning) {
        addLog('warning', '已有任务在运行中');
        return;
    }

    state.isRunning = true;
    state.isPaused = false;

    // 更新UI
    elements.startAutoUpload.disabled = true;
    elements.fillCurrentPage.disabled = true;
    elements.controlButtons.style.display = 'flex';
    elements.progressSection.classList.add('show');
    elements.logs.classList.add('show');

    addLog('info', `========== 开始自动上传 ==========`);
    addLog('info', `总共 ${state.products.length} 个商品`);

    // 从当前索引开始上传
    for (let i = state.currentIndex; i < state.products.length; i++) {
        // 检查是否暂停或停止
        if (!state.isRunning) {
            addLog('info', '已停止');
            break;
        }

        while (state.isPaused) {
            await sleep(500);
        }

        state.currentIndex = i;
        updateProductDisplay();

        const product = state.products[i];
        addLog('info', `\n[${i + 1}/${state.products.length}] ${product.title || product.asin}`);

        try {
            // 执行完整上传流程
            await uploadProduct(product);

            addLog('success', `✅ 商品 ${i + 1} 上传完成`);

            // 更新进度
            updateProgress((i + 1) / state.products.length * 100);

            // 随机延迟（模拟真人）
            if (state.settings.humanLike && i < state.products.length - 1) {
                const delay = randomInt(3000, 6000);
                addLog('info', `等待 ${(delay / 1000).toFixed(1)}s...`);
                await sleep(delay);
            }

        } catch (error) {
            addLog('error', `❌ 商品 ${i + 1} 失败: ${error.message}`);

            // 询问是否继续
            const shouldContinue = confirm(`商品 ${i + 1} 上传失败:\n${error.message}\n\n是否继续下一个?`);
            if (!shouldContinue) {
                break;
            }
        }
    }

    // 完成
    state.isRunning = false;
    addLog('success', `========== 全部完成 ==========`);

    // 重置UI
    elements.controlButtons.style.display = 'none';
    elements.startAutoUpload.disabled = false;
    elements.fillCurrentPage.disabled = false;
}

/**
 * 完整上传流程
 */
async function uploadProduct(product) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 步骤1: 自动搜索ASIN并进入表单
    if (state.settings.autoSearch) {
        addLog('info', `  [1/5] 搜索ASIN: ${product.asin}`);

        const searchResult = await sendMessage(tab.id, {
            action: 'searchASIN',
            asin: product.asin
        });

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

        // 填写表单
        const fillResult = await sendMessage(tab.id, {
            action: 'fillPage',
            page: page,
            product: product,
            settings: state.settings
        });

        if (!fillResult.success) {
            throw new Error(`${pageNames[page]}填写失败: ${fillResult.error}`);
        }

        addLog('success', `  ✓ ${pageNames[page]}完成`);

        // 自动导航到下一页（除了最后一页）
        if (state.settings.autoNavigate && i < pages.length - 1) {
            await sleep(1000);
            await sendMessage(tab.id, {
                action: 'navigateToPage',
                page: pages[i + 1]
            });
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
        addLog('info', '⏳ 步骤1/3: 获取当前标签页...');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        addLog('success', `✓ 标签页ID: ${tab.id}`);

        // 步骤2: 检测当前页面类型
        addLog('info', '⏳ 步骤2/3: 检测页面类型...');
        const status = await sendMessage(tab.id, { action: 'getPageStatus' });
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

        // 步骤3: 填写表单
        addLog('info', '⏳ 步骤3/3: 填写表单字段...');
        addLog('info', `设置: 自动填写=${state.settings.autoFill}, 真人模拟=${state.settings.humanLike}`);

        const result = await sendMessage(tab.id, {
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
        elements.pauseButton.innerHTML = '<span>▶️</span><span>继续</span>';
        addLog('warning', '⏸️ 已暂停');
    } else {
        elements.pauseButton.innerHTML = '<span>⏸️</span><span>暂停</span>';
        addLog('info', '▶️ 继续执行');
    }
}

function stopExecution() {
    state.isRunning = false;
    state.isPaused = false;

    elements.controlButtons.style.display = 'none';
    elements.startAutoUpload.disabled = false;
    elements.fillCurrentPage.disabled = false;

    addLog('warning', '⏹️ 已停止');
}

// ========== 进度更新 ==========
function updateProgress(percent) {
    const rounded = Math.round(percent);
    elements.progressFill.style.width = rounded + '%';
    elements.progressText.textContent = `${rounded}% (${state.currentIndex + 1}/${state.products.length})`;
}

// ========== 日志管理 ==========
function addLog(type, message) {
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
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(response || {});
            }
        });
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
            elements.fileName.textContent = '(已恢复上次数据)';
            elements.fileUpload.classList.add('has-file');
            elements.totalProducts.textContent = state.products.length;
            elements.productNav.classList.add('show');

            updateProductDisplay();

            elements.startAutoUpload.disabled = false;
            elements.fillCurrentPage.disabled = false;

            addLog('info', `已恢复 ${state.products.length} 个商品，当前第 ${state.currentIndex + 1} 个`);
        }
    });
}
