/**
 * 批量上传管理器
 * 处理多个产品的连续上传，支持断点续传、错误恢复
 */

console.log('[批量上传管理器] 模块加载');

class BatchUploadManager {
    constructor() {
        this.queue = [];           // 待上传产品队列
        this.currentIndex = 0;     // 当前处理索引
        this.results = [];         // 上传结果
        this.isRunning = false;    // 是否正在运行
        this.isPaused = false;     // 是否暂停
        this.settings = {};        // 全局设置
        this.startTime = null;     // 开始时间
        this.errorRetryMap = new Map(); // 错误重试记录
    }

    /**
     * 初始化批量上传
     */
    async initialize(products, settings = {}) {
        this.queue = products;
        this.currentIndex = 0;
        this.results = [];
        this.settings = {
            delayBetweenProducts: 5000,     // 产品间延迟(毫秒)
            maxRetries: 3,                  // 最大重试次数
            saveProgress: true,             // 是否保存进度
            autoRecover: true,              // 自动恢复
            humanBehavior: true,            // 模拟人类行为
            workingHours: {                 // 工作时段
                enabled: false,
                start: 9,                   // 9:00
                end: 18                     // 18:00
            },
            ...settings
        };

        console.log(`[批量上传] 初始化完成，共 ${products.length} 个产品`);

        // 尝试恢复之前的进度
        if (this.settings.autoRecover) {
            await this.recoverProgress();
        }

        return true;
    }

    /**
     * 开始批量上传
     */
    async start() {
        if (this.isRunning) {
            console.warn('[批量上传] 已在运行中');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.startTime = Date.now();

        console.log(`[批量上传] 开始处理，从索引 ${this.currentIndex} 开始`);

        // 发送开始通知
        this.notifyStatus('started', {
            total: this.queue.length,
            current: this.currentIndex
        });

        // 开始处理队列
        await this.processQueue();
    }

    /**
     * 处理队列
     */
    async processQueue() {
        while (this.currentIndex < this.queue.length && this.isRunning && !this.isPaused) {
            // 检查工作时段
            if (!this.isInWorkingHours()) {
                console.log('[批量上传] 不在工作时段，暂停');
                await this.pause();
                return;
            }

            const product = this.queue[this.currentIndex];
            const productIndex = this.currentIndex;

            console.log(`\n========== 产品 ${productIndex + 1}/${this.queue.length} ==========`);
            console.log(`ASIN: ${product.asin || product.product_id || 'N/A'}`);

            try {
                // 处理单个产品
                const result = await this.processSingleProduct(product, productIndex);

                this.results.push(result);

                // 保存进度
                if (this.settings.saveProgress) {
                    await this.saveProgress();
                }

                // 发送进度通知
                this.notifyStatus('progress', {
                    total: this.queue.length,
                    current: this.currentIndex + 1,
                    completed: this.results.filter(r => r.success).length,
                    failed: this.results.filter(r => !r.success).length
                });

            } catch (error) {
                console.error(`[批量上传] 产品处理失败:`, error);

                this.results.push({
                    index: productIndex,
                    asin: product.asin,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }

            this.currentIndex++;

            // 智能延迟
            if (this.currentIndex < this.queue.length) {
                await this.smartDelay();
            }
        }

        // 完成处理
        if (this.currentIndex >= this.queue.length) {
            await this.complete();
        }
    }

    /**
     * 处理单个产品
     */
    async processSingleProduct(product, index) {
        const startTime = Date.now();

        try {
            // Step 1: 搜索ASIN并进入表单
            console.log(`[Step 1/5] 搜索ASIN: ${product.asin}`);
            await this.searchASIN(product.asin);
            await this.waitForPageLoad();

            // Step 2: 填写产品详情页
            console.log(`[Step 2/5] 填写产品详情`);
            await this.fillProductDetails(product);
            await this.saveCurrentPage();

            // Step 3: 填写图片页
            console.log(`[Step 3/5] 处理图片`);
            await this.navigateToPage('images');
            await this.handleImages(product);
            await this.saveCurrentPage();

            // Step 4: 填写报价页
            console.log(`[Step 4/5] 填写报价信息`);
            await this.navigateToPage('offer');
            await this.fillOffer(product);
            await this.saveCurrentPage();

            // Step 5: 填写安全与合规页
            console.log(`[Step 5/5] 填写安全与合规`);
            await this.navigateToPage('safetyCompliance');
            await this.fillSafetyCompliance(product);
            await this.saveCurrentPage();

            // 最终保存为草稿
            await this.saveAsDraft();

            const duration = Date.now() - startTime;

            return {
                index,
                asin: product.asin,
                title: product.title,
                success: true,
                duration: duration,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            // 错误处理和重试逻辑
            const retryCount = this.errorRetryMap.get(index) || 0;

            if (retryCount < this.settings.maxRetries) {
                console.log(`[重试] 产品 ${index + 1} 第 ${retryCount + 1} 次重试`);
                this.errorRetryMap.set(index, retryCount + 1);

                // 等待后重试
                await this.sleep(5000 * (retryCount + 1));
                return await this.processSingleProduct(product, index);

            } else {
                throw error;
            }
        }
    }

    /**
     * 搜索ASIN
     */
    async searchASIN(asin) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'searchASIN',
                asin: asin
            }, response => {
                if (response && response.success) {
                    resolve();
                } else {
                    reject(new Error(response ? response.error : '搜索失败'));
                }
            });
        });
    }

    /**
     * 填写产品详情
     */
    async fillProductDetails(product) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'fillPage',
                page: 'productDetails',
                product: product,
                settings: this.settings
            }, response => {
                if (response && response.success) {
                    resolve();
                } else {
                    reject(new Error(response ? response.error : '填写失败'));
                }
            });
        });
    }

    /**
     * 处理图片
     */
    async handleImages(product) {
        // Chrome扩展不能直接上传本地文件
        // 这里只能提示用户手动操作
        console.log('[图片] 请手动上传图片');

        if (product.images && product.images.length > 0) {
            this.showImageGuide(product.images);
        }

        // 等待用户操作
        await this.sleep(3000);
    }

    /**
     * 填写报价信息
     */
    async fillOffer(product) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'fillPage',
                page: 'offer',
                product: product,
                settings: this.settings
            }, response => {
                if (response && response.success) {
                    resolve();
                } else {
                    reject(new Error(response ? response.error : '填写失败'));
                }
            });
        });
    }

    /**
     * 填写安全与合规
     */
    async fillSafetyCompliance(product) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'fillPage',
                page: 'safetyCompliance',
                product: product,
                settings: this.settings
            }, response => {
                if (response && response.success) {
                    resolve();
                } else {
                    reject(new Error(response ? response.error : '填写失败'));
                }
            });
        });
    }

    /**
     * 导航到指定页面
     */
    async navigateToPage(page) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'navigateToPage',
                page: page
            }, response => {
                if (response && response.success) {
                    resolve();
                } else {
                    reject(new Error(response ? response.error : '导航失败'));
                }
            });
        });
    }

    /**
     * 保存当前页面
     */
    async saveCurrentPage() {
        // 查找保存按钮 - 使用正确的选择器语法
        let saveButton = null;

        // 方法1: 通过文本内容查找button
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
            if (button.textContent.includes('保存为草稿') || button.textContent.includes('Save as Draft')) {
                saveButton = button;
                break;
            }
        }

        // 方法2: 通过aria-label查找
        if (!saveButton) {
            saveButton = document.querySelector('[aria-label*="保存"]');
        }
        if (saveButton) {
            saveButton.click();
            await this.sleep(2000);
        }
    }

    /**
     * 最终保存为草稿
     */
    async saveAsDraft() {
        console.log('[保存] 保存为草稿');

        // 查找保存按钮 - 使用正确的选择器语法
        let saveButton = null;
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
            if (button.textContent.includes('保存为草稿') || button.textContent.includes('Save as Draft') || button.textContent.includes('下書き保存')) {
                saveButton = button;
                break;
            }
        }
        if (saveButton) {
            saveButton.click();
            await this.sleep(3000);

            // 等待保存完成
            await this.waitForElement('.success-message, [class*="success"]', 5000);
        }
    }

    /**
     * 智能延迟
     */
    async smartDelay() {
        let delay = this.settings.delayBetweenProducts;

        if (this.settings.humanBehavior) {
            // 添加随机性
            const variation = delay * 0.3;
            delay = delay + (Math.random() - 0.5) * 2 * variation;

            // 每处理5个产品，增加休息时间
            if (this.currentIndex % 5 === 0) {
                delay += 10000; // 额外10秒休息
                console.log('[休息] 处理了5个产品，额外休息10秒');
            }

            // 每处理20个产品，大休息
            if (this.currentIndex % 20 === 0) {
                delay += 60000; // 额外1分钟休息
                console.log('[休息] 处理了20个产品，休息1分钟');
            }
        }

        console.log(`[延迟] 等待 ${Math.round(delay / 1000)} 秒后继续`);
        await this.sleep(delay);
    }

    /**
     * 暂停
     */
    async pause() {
        this.isPaused = true;
        console.log('[批量上传] 已暂停');

        await this.saveProgress();

        this.notifyStatus('paused', {
            current: this.currentIndex,
            total: this.queue.length
        });
    }

    /**
     * 恢复
     */
    async resume() {
        if (!this.isPaused) {
            console.log('[批量上传] 未在暂停状态');
            return;
        }

        this.isPaused = false;
        console.log('[批量上传] 恢复处理');

        this.notifyStatus('resumed', {
            current: this.currentIndex,
            total: this.queue.length
        });

        await this.processQueue();
    }

    /**
     * 停止
     */
    async stop() {
        this.isRunning = false;
        console.log('[批量上传] 停止处理');

        await this.saveProgress();

        this.notifyStatus('stopped', {
            current: this.currentIndex,
            total: this.queue.length,
            results: this.results
        });
    }

    /**
     * 完成
     */
    async complete() {
        this.isRunning = false;
        const duration = Date.now() - this.startTime;

        const summary = {
            total: this.queue.length,
            success: this.results.filter(r => r.success).length,
            failed: this.results.filter(r => !r.success).length,
            duration: duration,
            averageTime: duration / this.queue.length
        };

        console.log('\n========== 批量上传完成 ==========');
        console.log(`总数: ${summary.total}`);
        console.log(`成功: ${summary.success}`);
        console.log(`失败: ${summary.failed}`);
        console.log(`总耗时: ${Math.round(duration / 1000)} 秒`);
        console.log(`平均每个: ${Math.round(summary.averageTime / 1000)} 秒`);

        // 导出结果
        await this.exportResults();

        // 清理进度
        if (this.settings.saveProgress) {
            await chrome.storage.local.remove('batchUploadProgress');
        }

        this.notifyStatus('completed', summary);
    }

    /**
     * 保存进度
     */
    async saveProgress() {
        const progress = {
            timestamp: Date.now(),
            currentIndex: this.currentIndex,
            queue: this.queue,
            results: this.results,
            settings: this.settings
        };

        await chrome.storage.local.set({
            'batchUploadProgress': progress
        });

        console.log(`[进度] 已保存，当前: ${this.currentIndex}/${this.queue.length}`);
    }

    /**
     * 恢复进度
     */
    async recoverProgress() {
        const stored = await chrome.storage.local.get('batchUploadProgress');

        if (stored && stored.batchUploadProgress) {
            const progress = stored.batchUploadProgress;

            // 检查是否是同一批次
            if (this.isSameBatch(progress.queue, this.queue)) {
                this.currentIndex = progress.currentIndex;
                this.results = progress.results || [];

                console.log(`[恢复] 从索引 ${this.currentIndex} 恢复`);
                return true;
            }
        }

        return false;
    }

    /**
     * 检查是否同一批次
     */
    isSameBatch(queue1, queue2) {
        if (!queue1 || !queue2) return false;
        if (queue1.length !== queue2.length) return false;

        // 比较前几个产品的ASIN
        const compareCount = Math.min(3, queue1.length);
        for (let i = 0; i < compareCount; i++) {
            if (queue1[i].asin !== queue2[i].asin) {
                return false;
            }
        }

        return true;
    }

    /**
     * 导出结果
     */
    async exportResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `batch_upload_results_${timestamp}.json`;

        const data = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.queue.length,
                success: this.results.filter(r => r.success).length,
                failed: this.results.filter(r => !r.success).length
            },
            results: this.results,
            failedProducts: this.results
                .filter(r => !r.success)
                .map(r => ({
                    index: r.index,
                    asin: r.asin,
                    error: r.error
                }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);

        console.log(`[导出] 结果已导出: ${filename}`);
    }

    /**
     * 检查工作时段
     */
    isInWorkingHours() {
        if (!this.settings.workingHours.enabled) {
            return true;
        }

        const now = new Date();
        const hour = now.getHours();

        return hour >= this.settings.workingHours.start &&
               hour < this.settings.workingHours.end;
    }

    /**
     * 发送状态通知
     */
    notifyStatus(status, data) {
        // 发送到popup或background
        chrome.runtime.sendMessage({
            action: 'batchUploadStatus',
            status: status,
            data: data
        });

        // 在页面显示通知
        this.showNotification(status, data);
    }

    /**
     * 显示页面通知
     */
    showNotification(status, data) {
        // 创建或更新通知元素
        let notification = document.getElementById('batch-upload-notification');

        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'batch-upload-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 10000;
                min-width: 300px;
            `;
            document.body.appendChild(notification);
        }

        const statusText = {
            'started': '开始批量上传',
            'progress': '上传进度',
            'paused': '已暂停',
            'resumed': '已恢复',
            'stopped': '已停止',
            'completed': '上传完成'
        }[status] || status;

        let content = `<h4 style="margin: 0 0 10px 0;">${statusText}</h4>`;

        if (data) {
            if (data.current !== undefined && data.total !== undefined) {
                const percent = Math.round((data.current / data.total) * 100);
                content += `
                    <div style="margin: 10px 0;">
                        <div style="background: #f0f0f0; border-radius: 4px; height: 20px;">
                            <div style="background: #4CAF50; height: 100%; border-radius: 4px; width: ${percent}%;"></div>
                        </div>
                        <p style="margin: 5px 0; font-size: 14px;">
                            ${data.current} / ${data.total} (${percent}%)
                        </p>
                    </div>
                `;
            }

            if (data.completed !== undefined) {
                content += `<p style="margin: 5px 0; color: green;">✓ 成功: ${data.completed}</p>`;
            }

            if (data.failed !== undefined && data.failed > 0) {
                content += `<p style="margin: 5px 0; color: red;">✗ 失败: ${data.failed}</p>`;
            }
        }

        notification.innerHTML = content;

        // 自动隐藏（完成或停止状态除外）
        if (!['completed', 'stopped', 'paused'].includes(status)) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.opacity = '0.7';
                }
            }, 3000);
        }
    }

    /**
     * 显示图片上传指南
     */
    showImageGuide(images) {
        const guide = document.createElement('div');
        guide.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #FF9800;
            border-radius: 8px;
            padding: 20px;
            z-index: 10001;
            max-width: 500px;
        `;

        guide.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #FF9800;">📷 请上传以下图片</h3>
            <ol style="margin: 10px 0;">
                ${images.map((img, idx) => `
                    <li style="margin: 5px 0;">
                        ${idx === 0 ? '主图片' : `附加图片${idx}`}: ${img}
                    </li>
                `).join('')}
            </ol>
            <button onclick="this.parentElement.remove()" style="
                background: #FF9800;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            ">我已了解</button>
        `;

        document.body.appendChild(guide);

        setTimeout(() => {
            if (guide.parentNode) {
                guide.remove();
            }
        }, 10000);
    }

    /**
     * 工具方法
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async waitForElement(selector, timeout = 3000) {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) return element;
            await this.sleep(100);
        }

        return null;
    }

    async waitForPageLoad() {
        await this.sleep(2000);

        // 等待特定元素加载
        await this.waitForElement('[class*="loaded"], [data-loaded="true"]', 5000);
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.batchUploadManager = new BatchUploadManager();
    console.log('[批量上传管理器] 全局实例已创建: window.batchUploadManager');
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BatchUploadManager;
}