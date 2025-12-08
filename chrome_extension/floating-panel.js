/**
 * 悬浮面板控制器
 * 功能：在页面上显示持久化悬浮窗，管理跨页面自动化流程
 */

class FloatingPanel {
    constructor() {
        this.panel = null;
        this.state = {
            isRunning: false,
            isPaused: false,
            isMinimized: false,
            currentProduct: null,
            currentIndex: 0,
            totalProducts: 0,
            statusText: '准备就绪',
            filledPages: new Set(), // 记录已填写的页面
            availablePages: []      // 当前商品可用的页面列表
        };

        // 绑定方法上下文
        this.toggleMinimize = this.toggleMinimize.bind(this);
        this.togglePause = this.togglePause.bind(this);
        this.stopExecution = this.stopExecution.bind(this);
        this.skipProduct = this.skipProduct.bind(this);
        this.toggleSettings = this.toggleSettings.bind(this);

        // 初始化
        this.init();
    }

    async init() {
        // 检查是否需要显示面板
        const storage = await chrome.storage.local.get(['workflowStatus', 'products', 'currentIndex']);

        if (storage.workflowStatus === 'running' || storage.workflowStatus === 'paused') {
            this.state.isRunning = true;
            this.state.isPaused = storage.workflowStatus === 'paused';
            this.state.products = storage.products || [];
            this.state.currentIndex = storage.currentIndex || 0;
            this.state.totalProducts = this.state.products.length;

            if (this.state.products.length > 0) {
                this.state.currentProduct = this.state.products[this.state.currentIndex];
            }

            this.render();

            // 如果是运行状态，继续执行流程
            if (this.state.isRunning && !this.state.isPaused) {
                this.resumeWorkflow();
            }
        }

        // 监听来自Popup的消息
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'startFloatingPanel') {
                this.startNewWorkflow();
                sendResponse({ success: true });
            }
        });

        // 监听页面变化 (实现自动填写)
        this.setupPageListener();

        // 尝试自动加载CSV (One-Click Automation)
        this.autoLoadCsv();
    }

    /**
     * 自动从本地服务器加载CSV
     */
    async autoLoadCsv() {
        const csvUrl = 'http://localhost:8000/amazon_full_test_data.csv';
        try {
            console.log(`[自动加载] 尝试从 ${csvUrl} 加载数据...`);

            // 使用 background script 代理请求，绕过 Mixed Content 限制
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ action: 'fetchUrl', url: csvUrl }, (res) => {
                    resolve(res);
                });
            });

            if (!response || !response.success) {
                console.warn('[自动加载] 请求失败:', response ? response.error : '未知错误');
                this.showFloatingError('⚠️ 未检测到本地数据服务，请运行 start_server.bat');
                return;
            }

            // Base64 解码回 ArrayBuffer
            const binaryString = atob(response.data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const buffer = bytes.buffer;
            let csvText = '';
            let encoding = 'unknown';

            // 优先尝试 UTF-8 (标准)，然后 Shift_JIS (日本)，最后 GBK (中国)
            const encodingsToTry = ['utf-8', 'shift_jis', 'gbk'];

            for (const enc of encodingsToTry) {
                try {
                    console.log(`[自动加载] 尝试解码: ${enc}`);
                    const decoder = new TextDecoder(enc, { fatal: true });
                    const text = decoder.decode(buffer);
                    csvText = text;
                    encoding = enc;
                    console.log(`[自动加载] 解码成功 (${enc})`);
                    break;
                } catch (e) {
                    console.log(`[自动加载] ${enc} 解码失败:`, e.message);
                }
            }

            // Fallback
            if (!csvText) {
                console.warn('[自动加载] 所有严格模式解码均失败，尝试默认 UTF-8 (非严格)');
                const decoder = new TextDecoder('utf-8');
                csvText = decoder.decode(buffer);
                encoding = 'utf-8 (fallback)';
            }

            console.log(`[自动加载] 最终采用编码: ${encoding}`);
            console.log(`[自动加载] 内容预览 (前100字符): \n${csvText.substring(0, 100)}`);

            const products = this.parseCsv(csvText);

            if (products && products.length > 0) {
                console.log(`[自动加载] 成功加载 ${products.length} 条数据`);

                try {
                    // 保存到存储
                    await chrome.storage.local.set({ products: products });
                    console.log('[自动加载] 数据已保存到 storage');
                } catch (storageError) {
                    console.error('[自动加载] Storage保存失败:', storageError);
                }

                // 更新状态
                this.state.products = products;
                this.state.totalProducts = products.length;
                this.state.currentProduct = products[0];

                // 更新UI
                this.updateStatus('已自动加载数据，准备就绪');
                try {
                    this.render();
                } catch (renderError) {
                    console.error('[自动加载] Render失败:', renderError);
                }

                this.showFloatingError(`已加载本地数据 (${products.length}条) ✅`);
            } else {
                console.warn('[自动加载] CSV解析结果为空');
                this.showFloatingError('⚠️ CSV文件为空或格式错误');
            }
        } catch (e) {
            console.error('[自动加载] 致命错误:', e);
            const errorMsg = e.message || (typeof e === 'object' ? JSON.stringify(e) : String(e));
            this.showFloatingError('❌ 数据加载失败: ' + errorMsg);
        }
    }

    /**
     * 简易CSV解析器
     */
    parseCsv(text) {
        console.log('[CSV解析] 开始解析, 文本长度:', text.length);
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        console.log('[CSV解析] 行数:', lines.length);

        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        console.log(`[CSV解析] 表头 (${headers.length}列):`, headers);

        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const values = [];
            let currentVal = '';
            let inQuotes = false;

            for (let char of lines[i]) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(currentVal.trim());
                    currentVal = '';
                } else {
                    currentVal += char;
                }
            }
            values.push(currentVal.trim()); // 最后一个值

            // 宽松处理：如果列数不匹配，尝试修复
            if (values.length !== headers.length) {
                console.warn(`[CSV解析] 第${i + 1}行列数不匹配: 预期${headers.length}, 实际${values.length}`);
                // 如果多了，截断
                if (values.length > headers.length) {
                    values.splice(headers.length);
                }
                // 如果少了，补空
                while (values.length < headers.length) {
                    values.push('');
                }
            }

            const obj = {};
            headers.forEach((h, index) => {
                // 去除引号
                let val = values[index];
                if (val && val.startsWith('"') && val.endsWith('"')) {
                    val = val.slice(1, -1);
                }
                // 处理双引号转义 ("" -> ")
                if (val) val = val.replace(/""/g, '"');

                obj[h] = val;
            });
            result.push(obj);
        }

        console.log(`[CSV解析] 解析完成，有效数据: ${result.length}条`);
        if (result.length > 0) {
            console.log('[CSV解析] 第一条数据预览:', result[0]);
        }
        return result;
    }

    async startNewWorkflow() {
        const storage = await chrome.storage.local.get(['products', 'settings']);
        this.state.products = storage.products || [];
        this.state.currentIndex = 0;
        this.state.totalProducts = this.state.products.length;
        this.state.isRunning = true;
        this.state.isPaused = false;
        this.state.isNavigating = false; // Note: Initialize navigation lock

        if (this.state.products.length > 0) {
            this.state.currentProduct = this.state.products[0];
        }

        this.state.filledPages.clear();
        this.state.availablePages = [];

        // 更新存储状态
        await chrome.storage.local.set({
            workflowStatus: 'running',
            currentIndex: 0
        });

        this.render();
        this.resumeWorkflow();
    }

    render() {
        // 如果已存在，先移除
        if (document.getElementById('ziniao-floating-panel')) {
            return;
        }

        const html = `
            <div id="ziniao-floating-panel" class="ziniao-floating-panel">
                <div class="ziniao-minimized-icon">🚀</div>
                <div class="ziniao-panel-header">
                    <div class="ziniao-panel-title">
                        <span>🚀</span>
                        <span>亚马逊助手</span>
                    </div>
                    <div class="ziniao-panel-controls">
                        <button class="ziniao-control-btn" id="ziniao-min-btn">_</button>
                    </div>
                </div>
                <div class="ziniao-panel-content">
                    <div class="ziniao-status-row">
                        <div class="ziniao-label">当前任务</div>
                        <div class="ziniao-value" id="ziniao-task-name">
                            ${this.state.currentProduct ? (this.state.currentProduct.title || this.state.currentProduct.asin) : '无任务'}
                        </div>
                    </div>
                    <div class="ziniao-status-row">
                        <div class="ziniao-label">状态</div>
                        <div class="ziniao-value" id="ziniao-status-text">${this.state.statusText}</div>
                    </div>
                    <div class="ziniao-status-row" style="margin-top: 5px; font-size: 11px; opacity: 0.8;">
                        <div class="ziniao-label">当前页面</div>
                        <div class="ziniao-value" id="ziniao-page-type">检测中...</div>
                    </div>
                    <div class="ziniao-progress-bar">
                        <div class="ziniao-progress-fill" id="ziniao-progress" style="width: ${this.calculateProgress()}%"></div>
                    </div>
                    <div class="ziniao-label" style="text-align: right">
                        <span id="ziniao-counter">${this.state.currentIndex + 1}</span> / ${this.state.totalProducts}
                    </div>
                    <div class="ziniao-action-buttons">
                        <button class="ziniao-btn ziniao-btn-pause" id="ziniao-pause-btn">
                            ${this.state.isPaused ? '继续' : '暂停'}
                        </button>
                        <button class="ziniao-btn" id="ziniao-skip-btn" style="background: rgba(255, 255, 255, 0.1); color: #fff;">跳过</button>
                        <button class="ziniao-btn ziniao-btn-stop" id="ziniao-stop-btn">停止</button>
                    </div>
                    
                    <!-- 简易设置开关 -->
                    <div class="ziniao-settings-toggle" id="ziniao-settings-toggle" style="margin-top: 10px; text-align: center; font-size: 12px; color: #94a3b8; cursor: pointer;">
                        ⚙️ 调整设置
                    </div>

                    
                    <!-- 开发者控制台 -->
                    <div class="ziniao-dev-console" id="ziniao-dev-console">
                        <div class="ziniao-console-header">
                            <span>运行日志</span>
                            <div style="display: flex; gap: 8px;">
                                <span style="cursor: pointer; font-size: 10px;" id="ziniao-dump-structure">分析页面</span>
                                <span style="cursor: pointer; font-size: 10px;" id="ziniao-clear-logs">清除</span>
                            </div>
                        </div>
                        <div class="ziniao-console-body" id="ziniao-console-body">
                            <!-- 日志内容 -->
                        </div>
                    </div>

                    <div class="ziniao-settings-panel" id="ziniao-settings-panel" style="display: none; margin-top: 10px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>自动翻页</span>
                            <input type="checkbox" id="fp-autoNavigate" checked>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>拟人延迟</span>
                            <input type="checkbox" id="fp-humanLike" checked>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>开发者模式</span>
                            <input type="checkbox" id="fp-devMode">
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        this.panel = document.getElementById('ziniao-floating-panel');

        // 绑定事件
        document.getElementById('ziniao-min-btn').addEventListener('click', this.toggleMinimize);
        document.getElementById('ziniao-pause-btn').addEventListener('click', this.togglePause);
        document.getElementById('ziniao-stop-btn').addEventListener('click', this.stopExecution);
        document.getElementById('ziniao-skip-btn').addEventListener('click', this.skipProduct);
        document.getElementById('ziniao-settings-toggle').addEventListener('click', this.toggleSettings);

        // 绑定设置变更
        document.getElementById('fp-autoNavigate').addEventListener('change', (e) => this.updateSetting('autoNavigate', e.target.checked));
        document.getElementById('fp-autoNavigate').addEventListener('change', (e) => this.updateSetting('autoNavigate', e.target.checked));
        document.getElementById('fp-humanLike').addEventListener('change', (e) => this.updateSetting('humanLike', e.target.checked));
        document.getElementById('fp-devMode').addEventListener('change', (e) => this.toggleDevMode(e.target.checked));
        document.getElementById('ziniao-clear-logs').addEventListener('click', () => this.clearLogs());
        document.getElementById('ziniao-dump-structure').addEventListener('click', () => {
            if (window.dumpFormStructure) {
                console.log('正在分析页面结构...');
                window.dumpFormStructure();
            } else {
                console.error('未找到分析工具，请确保AmazonFormFiller已加载');
            }
        });

        // 劫持控制台日志
        this.hijackConsole();

        this.panel.addEventListener('click', (e) => {
            if (this.state.isMinimized) this.toggleMinimize();
        });

        // 简单的拖拽功能
        this.initDrag();
    }

    updateUI() {
        if (!this.panel) return;

        document.getElementById('ziniao-task-name').textContent =
            this.state.currentProduct ? (this.state.currentProduct.item_name || this.state.currentProduct.title || this.state.currentProduct.asin) : '无任务';
        document.getElementById('ziniao-status-text').textContent = this.state.statusText;
        document.getElementById('ziniao-progress').style.width = `${this.calculateProgress()}%`;
        document.getElementById('ziniao-counter').textContent = this.state.currentIndex + 1;
        document.getElementById('ziniao-counter').textContent = this.state.currentIndex + 1;
        document.getElementById('ziniao-pause-btn').textContent = this.state.isPaused ? '继续' : '暂停';

        // 更新页面类型显示
        if (window.pageDetector) {
            const pageType = window.pageDetector.detectCurrentPage();
            const pageName = window.pageDetector.getPageDisplayName(pageType);
            const el = document.getElementById('ziniao-page-type');
            if (el) el.textContent = pageName;
        }
    }

    calculateProgress() {
        if (this.state.totalProducts === 0) return 0;
        return ((this.state.currentIndex) / this.state.totalProducts) * 100;
    }

    toggleMinimize(e) {
        if (e) e.stopPropagation();
        this.state.isMinimized = !this.state.isMinimized;
        this.panel.classList.toggle('minimized', this.state.isMinimized);
    }

    async togglePause(e) {
        if (e) e.stopPropagation();
        this.state.isPaused = !this.state.isPaused;

        // 添加明显的日志
        if (this.state.isPaused) {
            console.log('🔴 [暂停功能] 用户点击暂停按钮');
            console.log('🔴 [暂停功能] isPaused 状态:', this.state.isPaused);
            console.log('🔴 [暂停功能] 工作流将在当前操作完成后停止');
        } else {
            console.log('🟢 [继续功能] 用户点击继续按钮');
            console.log('🟢 [继续功能] isPaused 状态:', this.state.isPaused);
            console.log('🟢 [继续功能] 工作流将继续执行');
        }

        this.updateUI();

        await chrome.storage.local.set({
            workflowStatus: this.state.isPaused ? 'paused' : 'running'
        });

        console.log('💾 [存储] workflowStatus 已更新为:', this.state.isPaused ? 'paused' : 'running');

        if (!this.state.isPaused) {
            this.resumeWorkflow();
        }
    }

    async stopExecution(e) {
        if (e) e.stopPropagation();

        console.log('⏹️ [停止功能] 用户点击停止按钮');
        console.log('⏹️ [停止功能] 正在停止工作流...');

        this.state.isRunning = false;

        await chrome.storage.local.set({ workflowStatus: 'stopped' });
        console.log('💾 [存储] workflowStatus 已更新为: stopped');

        this.panel.remove();
        this.panel = null;

        console.log('✅ [停止功能] 悬浮面板已关闭');
    }

    async skipProduct(e) {
        if (e) e.stopPropagation();
        this.updateStatus('正在跳过当前商品...');

        // 增加索引
        this.state.currentIndex++;

        if (this.state.currentIndex >= this.state.totalProducts) {
            this.updateStatus('所有商品已处理完毕');
            this.state.isRunning = false;
            await chrome.storage.local.set({ workflowStatus: 'idle' });
            return;
        }

        this.state.currentProduct = this.state.products[this.state.currentIndex];

        // 更新存储
        await chrome.storage.local.set({ currentIndex: this.state.currentIndex });

        this.updateUI();
        this.resumeWorkflow();
    }

    toggleSettings(e) {
        if (e) e.stopPropagation();
        const panel = document.getElementById('ziniao-settings-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    async updateSetting(key, value) {
        const storage = await chrome.storage.local.get(['settings']);
        const settings = storage.settings || {};
        settings[key] = value;
        await chrome.storage.local.set({ settings });
    }

    setupPageListener() {
        // 轮询检查 PageDetector 是否就绪
        const checkDetector = setInterval(() => {
            if (window.pageDetector) {
                clearInterval(checkDetector);
                console.log('[悬浮面板] PageDetector已就绪，注册监听器');

                window.pageDetector.on('pageChanged', (newPage, oldPage) => {
                    console.log(`[悬浮面板] 页面变化检测: ${oldPage} -> ${newPage}`);
                    this.updateUI();

                    // 如果正在运行且未暂停，且进入了表单页，尝试自动填写
                    if (this.state.isRunning && !this.state.isPaused) {
                        // 延迟一点点确保DOM稳定
                        setTimeout(() => this.resumeWorkflow(), 500);
                    }
                });
            }
        }, 500);
    }

    // ========== 核心工作流逻辑 ==========

    async resumeWorkflow() {
        if (!this.state.isRunning || this.state.isPaused) return;

        try {
            // 1. 检查当前页面 (带重试机制)
            let pageStatus = await this.checkPageStatus();
            this.updateUI();

            // 如果检测结果是 unknown，等待一下再检测一次 (防止页面刚加载DOM未就绪)
            if (!pageStatus.alreadyOnForm && pageStatus.pageType === 'unknown') {
                console.log('页面状态未知，等待2秒重试...');
                this.updateStatus('正在分析页面...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                pageStatus = await this.checkPageStatus();
                this.updateUI();
            }

            // 2. 根据页面状态决定下一步
            if (pageStatus.alreadyOnForm) {
                // 已经在表单页，直接开始填写
                this.updateStatus('正在填写表单...');
                await this.fillCurrentPage();
            } else {
                // 不在表单页，执行搜索导航
                if (!this.state.isNavigating) {
                    this.updateStatus('正在搜索商品...');
                    await this.executeNavigation();
                    // 导航成功后，重置已填写页面记录
                    this.state.filledPages.clear();
                } else {
                    console.log('[工作流] 正在导航中，跳过重复触发');
                }
            }

        } catch (error) {
            console.error('Workflow error:', error);
            this.updateStatus(`错误: ${error.message}`);
            // 暂停等待用户处理
            this.state.isPaused = true;
            this.updateUI();
        }
    }

    async checkPageStatus() {
        // 使用现有的 PageDetector (假设已加载)
        if (window.pageDetector) {
            const status = window.pageDetector.detectCurrentPage();
            const isFormPage = ['productDetails', 'safetyCompliance', 'offer', 'images'].includes(status);
            return { alreadyOnForm: isFormPage, pageType: status };
        }
        return { alreadyOnForm: false, pageType: 'unknown' };
    }

    async executeNavigation() {
        // 检查暂停状态
        if (this.state.isPaused) {
            console.log('[工作流] 已暂停，停止导航');
            return;
        }

        if (this.state.isNavigating) {
            console.log('[工作流] 导航锁已激活，阻止重复进入');
            return;
        }

        if (!this.state.currentProduct) return;

        // 调用 AmazonNavigator
        if (window.amazonNavigator) {
            this.state.isNavigating = true; // 上锁

            try {
                // 优先使用 asin，其次 external_product_id，最后 sku
                const searchTerm = this.state.currentProduct.asin ||
                    this.state.currentProduct.external_product_id ||
                    this.state.currentProduct.sku;

                if (!searchTerm) {
                    this.showFloatingError('❌ 缺少ASIN或产品ID，无法搜索');
                    throw new Error('未找到有效的产品ID (ASIN/External ID/SKU)');
                }

                const result = await window.amazonNavigator.searchASINAndEnterForm(searchTerm);
                if (result.success) {
                    // 导航成功，页面可能会跳转，脚本会重新加载并继续
                    this.updateStatus('导航成功，等待页面加载...');
                } else {
                    throw new Error(result.error || '导航失败');
                }
            } finally {
                // 3秒后释放锁，防止页面跳转期间再次触发，或者在发生错误时释放
                setTimeout(() => {
                    this.state.isNavigating = false;
                    console.log('[工作流] 导航锁已释放');
                }, 3000);
            }
        }
    }

    async fillCurrentPage() {
        // 检查暂停状态
        if (this.state.isPaused) {
            console.log('[工作流] 已暂停，停止填写');
            return;
        }

        if (!this.state.currentProduct) return;

        // 1. 检测当前页面类型
        const currentPage = window.pageDetector ? window.pageDetector.detectCurrentPage() : 'unknown';

        // 2. 如果还没检测过可用Tab，检测一次
        if (this.state.availablePages.length === 0) {
            this.detectAvailableTabs();
        }

        // 调用 AmazonFormFiller
        if (window.AmazonFormFiller) {
            const result = await window.AmazonFormFiller.fillAmazonForm(this.state.currentProduct);

            // 填写完成后，再次尝试检测可用Tab (因为此时页面肯定加载完了)
            if (this.state.availablePages.length === 0) {
                this.detectAvailableTabs();
                console.log('[自动导航] 重新检测可用页面:', this.state.availablePages);
            }

            if (result.success) {
                this.updateStatus(`${currentPage} 填写完成`);

                // 标记当前页面为已填写
                this.state.filledPages.add(currentPage);

                // 再次检查暂停状态（填写过程中可能被暂停）
                if (this.state.isPaused) {
                    console.log('[工作流] 填写完成后检测到暂停，停止自动翻页');
                    return;
                }

                // 检查是否开启自动翻页
                const storage = await chrome.storage.local.get(['settings']);
                const autoNavigate = storage.settings?.autoNavigate !== false; // 默认开启

                if (autoNavigate) {
                    await this.switchToNextPage();
                } else {
                    this.updateStatus('等待手动切换页面...');
                }
            } else {
                throw new Error(result.error || '填写失败');
            }
        } else {
            console.error('AmazonFormFiller not found on window object');
            this.showFloatingError('❌ 核心模块未加载: AmazonFormFiller');
            throw new Error('AmazonFormFiller未加载');
        }
    }


    detectAvailableTabs() {
        // 定义页面顺序
        const PAGE_ORDER = ['productDetails', 'variations', 'offer', 'safetyCompliance', 'images'];
        const foundPages = [];

        // 扫描页面上的Tab
        // 策略: 查找包含特定文本的 kat-tab 或 链接
        const tabTexts = {
            'productDetails': ['产品详情', 'Product Details', '商品詳細'],
            'variations': ['变体', 'Variations', 'バリエーション'],
            'offer': ['报价', 'Offer', '出品情報'],
            'safetyCompliance': ['安全与合规', 'Safety & Compliance', '安全とコンプライアンス'],
            'images': ['图片', 'Images', '画像']
        };

        // 遍历所有可能的页面类型
        for (const pageType of PAGE_ORDER) {
            const texts = tabTexts[pageType];
            // 检查是否存在对应的Tab元素
            const hasTab = texts.some(text => {
                // 检查 kat-tab
                const katTabs = Array.from(document.querySelectorAll('kat-tab'));
                if (katTabs.some(t => t.textContent.includes(text) || t.getAttribute('label')?.includes(text))) return true;

                // 检查普通链接/按钮
                const links = Array.from(document.querySelectorAll('a, button, li[role="tab"]'));
                if (links.some(l => l.textContent.includes(text))) return true;

                return false;
            });

            if (hasTab) {
                foundPages.push(pageType);
            }
        }

        this.state.availablePages = foundPages;
        console.log('[自动导航] 检测到可用页面:', foundPages);
    }

    async switchToNextPage() {
        // 检查暂停状态
        if (this.state.isPaused) {
            console.log('[工作流] 已暂停，停止切换页面');
            return;
        }

        // 找到下一个未填写的页面
        const nextPage = this.state.availablePages.find(page => !this.state.filledPages.has(page));

        if (nextPage) {
            this.updateStatus(`正在切换到 ${nextPage}...`);

            // 查找并点击Tab
            const success = await this.clickTabForPage(nextPage);
            if (success) {
                this.updateStatus(`已切换到 ${nextPage}，等待加载...`);
                // 页面切换后，PageDetector 会触发 pageChanged 事件，从而再次调用 resumeWorkflow
            } else {
                this.updateStatus(`无法切换到 ${nextPage}，尝试下一个...`);
                this.state.filledPages.add(nextPage); // 标记为已处理（跳过）
                await this.switchToNextPage(); // 递归尝试下一个
            }
        } else {
            // 所有页面都填完了
            this.updateStatus('当前商品所有页面已完成！');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 再次检查暂停状态
            if (this.state.isPaused) {
                console.log('[工作流] 已暂停，不切换商品');
                return;
            }

            // 切换到下一个商品
            this.skipProduct();
        }
    }

    async clickTabForPage(pageType) {
        const tabTexts = {
            'productDetails': ['产品详情', 'Product Details', '商品詳細'],
            'variations': ['变体', 'Variations', 'バリエーション'],
            'offer': ['报价', 'Offer', '出品情報'],
            'safetyCompliance': ['安全与合规', 'Safety & Compliance', '安全とコンプライアンス'],
            'images': ['图片', 'Images', '画像']
        };

        const texts = tabTexts[pageType];
        if (!texts) return false;

        // 查找元素
        const allElements = document.querySelectorAll('kat-tab, a, button, li[role="tab"]');
        for (const el of allElements) {
            const text = el.textContent || el.getAttribute('label') || '';
            if (texts.some(t => text.includes(t))) {
                console.log(`[自动导航] 点击Tab: ${text}`);
                el.click();
                return true;
            }
        }
        return false;
    }

    updateStatus(text) {
        this.state.statusText = text;
        this.updateUI();
    }

    initDrag() {
        // 简单的拖拽实现
        const header = this.panel.querySelector('.ziniao-panel-header');
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            isDragging = false;
        });
    }
    toggleDevMode(enabled) {
        const consoleEl = document.getElementById('ziniao-dev-console');
        if (consoleEl) {
            consoleEl.style.display = enabled ? 'block' : 'none';
        }
    }

    clearLogs() {
        const body = document.getElementById('ziniao-console-body');
        if (body) body.innerHTML = '';
    }

    hijackConsole() {
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        console.log = (...args) => {
            originalLog.apply(console, args);
            this.appendLog('info', args);
        };

        console.error = (...args) => {
            originalError.apply(console, args);
            this.appendLog('error', args);
        };
    }

    appendLog(type, args) {
        const body = document.getElementById('ziniao-console-body');
        if (!body) return;

        const msg = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');

        const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        const entry = document.createElement('div');
        entry.className = 'ziniao-log-entry';
        entry.innerHTML = `
            <span class="ziniao-log-time">[${time}]</span>
            <span class="ziniao-log-${type}">${msg}</span>
        `;

        body.appendChild(entry);
        body.scrollTop = body.scrollHeight;
    }

    showFloatingError(message) {
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
}

// 启动
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new FloatingPanel());
} else {
    new FloatingPanel();
}
