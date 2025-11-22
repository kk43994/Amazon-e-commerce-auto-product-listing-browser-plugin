// 学习模式 - 让用户手动指定页面元素，插件记住它们
console.log('[学习模式] 已加载');

class LearningMode {
    constructor() {
        this.learningData = {};
        this.currentField = null;
        this.isActive = false;
        this.overlay = null;
        this.guide = null;
    }

    // 启动学习模式
    async start() {
        console.log('[学习模式] 开始学习');
        this.isActive = true;

        // 需要学习的字段
        const fieldsToLearn = [
            { key: 'title', label: '商品标题' },
            { key: 'brand', label: '品牌' },
            { key: 'price', label: '价格' },
            { key: 'description', label: '商品描述' },
            { key: 'quantity', label: '库存数量' },
            { key: 'sku', label: 'SKU编号' }
        ];

        // 创建遮罩层
        this.createOverlay();

        // 逐个学习字段
        for (const field of fieldsToLearn) {
            const element = await this.learnField(field);
            if (element) {
                this.learningData[field.key] = this.getElementSelector(element);
                console.log(`[学习] ${field.label}:`, this.learningData[field.key]);
            }
        }

        // 保存学习结果
        await this.saveToStorage();

        // 完成提示
        this.showCompletionMessage();
        this.removeOverlay();
        this.isActive = false;
    }

    // 学习单个字段
    learnField(field) {
        return new Promise((resolve) => {
            this.currentField = field;

            // 显示引导
            this.showGuide(`请点击 "${field.label}" 输入框`);

            // 高亮所有可能的输入框
            this.highlightAllInputs();

            // 监听点击
            const clickHandler = (e) => {
                const target = e.target;

                // 只接受input/textarea/select
                if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                // 移除高亮
                this.removeAllHighlights();

                // 确认选择
                this.showConfirmation(target, (confirmed) => {
                    document.removeEventListener('click', clickHandler, true);

                    if (confirmed) {
                        resolve(target);
                    } else {
                        // 重新选择
                        this.learnField(field).then(resolve);
                    }
                });
            };

            document.addEventListener('click', clickHandler, true);
        });
    }

    // 获取元素的最佳选择器
    getElementSelector(element) {
        const selectors = {};

        // ID
        if (element.id) {
            selectors.id = element.id;
        }

        // Name
        if (element.name) {
            selectors.name = element.name;
        }

        // Class
        if (element.className && typeof element.className === 'string') {
            selectors.class = element.className.trim().split(/\s+/);
        }

        // XPath
        selectors.xpath = this.getXPath(element);

        // CSS Selector
        selectors.css = this.generateCSSSelector(element);

        // 元素类型
        selectors.tagName = element.tagName.toLowerCase();
        selectors.type = element.type;

        return selectors;
    }

    // 生成XPath
    getXPath(element) {
        if (element.id) {
            return `//*[@id="${element.id}"]`;
        }

        const paths = [];
        let current = element;

        while (current && current.nodeType === Node.ELEMENT_NODE) {
            let index = 0;
            let sibling = current.previousSibling;

            while (sibling) {
                if (sibling.nodeType === Node.ELEMENT_NODE &&
                    sibling.nodeName === current.nodeName) {
                    index++;
                }
                sibling = sibling.previousSibling;
            }

            const tagName = current.nodeName.toLowerCase();
            const pathIndex = index ? `[${index + 1}]` : '';
            paths.unshift(`${tagName}${pathIndex}`);

            current = current.parentNode;
        }

        return '/' + paths.join('/');
    }

    // 生成CSS选择器
    generateCSSSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }

        if (element.name) {
            return `${element.tagName.toLowerCase()}[name="${element.name}"]`;
        }

        if (element.className && typeof element.className === 'string') {
            const classes = element.className.trim().split(/\s+/).join('.');
            return `${element.tagName.toLowerCase()}.${classes}`;
        }

        return element.tagName.toLowerCase();
    }

    // 创建遮罩层
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999998;
            backdrop-filter: blur(2px);
        `;
        document.body.appendChild(this.overlay);
    }

    // 移除遮罩层
    removeOverlay() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.guide) {
            this.guide.remove();
            this.guide = null;
        }
    }

    // 显示引导提示
    showGuide(message) {
        if (this.guide) {
            this.guide.remove();
        }

        this.guide = document.createElement('div');
        this.guide.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            text-align: center;
            min-width: 400px;
        `;

        this.guide.innerHTML = `
            <div style="font-size: 20px; font-weight: 600; color: #667eea; margin-bottom: 15px;">
                📍 学习模式
            </div>
            <div style="font-size: 16px; color: #333; margin-bottom: 10px;">
                ${message}
            </div>
            <div style="font-size: 14px; color: #666;">
                点击页面上对应的输入框
            </div>
        `;

        document.body.appendChild(this.guide);
    }

    // 高亮所有输入框
    highlightAllInputs() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type !== 'hidden') {
                input.style.outline = '2px dashed #667eea';
                input.style.outlineOffset = '2px';
            }
        });
    }

    // 移除所有高亮
    removeAllHighlights() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.style.outline = '';
            input.style.outlineOffset = '';
        });
    }

    // 显示确认对话框
    showConfirmation(element, callback) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 9999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            min-width: 350px;
        `;

        // 高亮选中的元素
        element.style.outline = '3px solid #4caf50';
        element.style.outlineOffset = '3px';

        dialog.innerHTML = `
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 15px; color: #333;">
                确认这是 "${this.currentField.label}" 吗？
            </div>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 12px; word-break: break-all;">
                <div><strong>ID:</strong> ${element.id || '无'}</div>
                <div><strong>Name:</strong> ${element.name || '无'}</div>
                <div><strong>Placeholder:</strong> ${element.placeholder || '无'}</div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="confirmYes" style="flex: 1; padding: 10px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    ✓ 确认
                </button>
                <button id="confirmNo" style="flex: 1; padding: 10px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    ✗ 重选
                </button>
            </div>
        `;

        document.body.appendChild(dialog);

        document.getElementById('confirmYes').onclick = () => {
            element.style.outline = '';
            element.style.outlineOffset = '';
            dialog.remove();
            callback(true);
        };

        document.getElementById('confirmNo').onclick = () => {
            element.style.outline = '';
            element.style.outlineOffset = '';
            dialog.remove();
            callback(false);
        };
    }

    // 显示完成消息
    showCompletionMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 50px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 9999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            text-align: center;
        `;

        message.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
            <div style="font-size: 20px; font-weight: 600; margin-bottom: 10px;">
                学习完成！
            </div>
            <div style="font-size: 14px;">
                插件已记住这些字段的位置<br>
                下次可以自动填写了
            </div>
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // 保存到存储
    async saveToStorage() {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;

        const data = {
            hostname,
            pathname,
            selectors: this.learningData,
            learnedAt: new Date().toISOString()
        };

        return new Promise((resolve) => {
            chrome.storage.local.set({
                [`learned_${hostname}`]: data
            }, () => {
                console.log('[学习模式] 已保存', data);
                resolve();
            });
        });
    }

    // 加载已学习的数据
    static async loadLearned() {
        const hostname = window.location.hostname;

        return new Promise((resolve) => {
            chrome.storage.local.get([`learned_${hostname}`], (result) => {
                const data = result[`learned_${hostname}`];
                if (data) {
                    console.log('[学习模式] 加载已学习的数据', data);
                    resolve(data.selectors);
                } else {
                    resolve(null);
                }
            });
        });
    }
}

// 导出到window
window.learningMode = new LearningMode();

// 监听学习请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startLearning') {
        window.learningMode.start().then(() => {
            sendResponse({ success: true });
        });
        return true;
    }

    if (request.action === 'getLearned') {
        LearningMode.loadLearned().then((data) => {
            sendResponse({ success: true, data });
        });
        return true;
    }
});

console.log('[学习模式] 使用方法: window.learningMode.start()');
