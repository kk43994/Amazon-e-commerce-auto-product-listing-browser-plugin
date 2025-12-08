// Content Script - 负责将分析工具注入到页面
(function () {
    // 创建 script 标签，加载外部文件
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('page-analyzer-injected.js');
    script.onload = function () {
        this.remove();
        console.log('[页面分析工具] 注入脚本已加载');
    };

    // 注入到页面
    (document.head || document.documentElement).appendChild(script);
})();
