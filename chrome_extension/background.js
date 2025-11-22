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
});
