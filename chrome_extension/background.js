// Background Service Worker
console.log('[亚马逊上传助手] Background service worker loaded');

// 监听扩展安装
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('[首次安装] 感谢使用亚马逊商品上传助手！');

        // 打开欢迎页面（可选）
        // chrome.tabs.create({ url: 'welcome.html' });
    } else if (details.reason === 'update') {
        console.log('[更新完成] 版本:', chrome.runtime.getManifest().version);
    }
});

// 监听来自content script或popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[收到消息]', request);

    if (request.action === 'getSettings') {
        chrome.storage.sync.get(['settings'], (result) => {
            sendResponse(result.settings || {});
        });
        return true;
    }

    if (request.action === 'saveSettings') {
        chrome.storage.sync.set({ settings: request.settings }, () => {
            sendResponse({ success: true });
        });
        return true;
    }

    // 代理请求 (解决Mixed Content问题)
    if (request.action === 'fetchUrl') {
        fetch(request.url)
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.arrayBuffer();
            })
            .then(buffer => {
                // 转Base64返回
                let binary = '';
                const bytes = new Uint8Array(buffer);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64 = btoa(binary);
                sendResponse({ success: true, data: base64 });
            })
            .catch(error => {
                console.error('[Background] Fetch failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // 保持通道开启
    }
});
