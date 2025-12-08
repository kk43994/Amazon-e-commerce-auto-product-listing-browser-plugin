/**
 * Upload Helper Script (Injected into Main World)
 * 
 * 用于在页面主环境中执行React Hacker逻辑，绕过Content Script的上下文隔离和CSP限制。
 * 
 * 使用方法:
 * 1. Content Script 找到目标 input
 * 2. 给 input 设置 unique ID (data-upload-trigger-id)
 * 3. 注入此脚本
 * 4. 此脚本自动查找 ID，执行 hack，然后自我清理
 */

(function () {
    // 查找最近一个被标记的 input (通常是刚被 content script 标记的那个)
    // 我们约定标记属性为 'data-upload-trigger-id'，且值为 'upload_<timestamp>'
    // 为了稳健，我们可以查找所有带有此属性的 input，并尝试触发

    // 获取当前时间戳，只处理最近 2秒内标记的，防止处理陈旧标记 (虽然正常流程会清除)
    const now = Date.now();
    const candidates = document.querySelectorAll('[data-upload-trigger-id]');

    if (candidates.length === 0) {
        // 可能 Content Script 还没来得及标记，或者已经清理了
        // console.log('[UploadHelper] No triggered input found.');
        return;
    }

    console.log(`[UploadHelper] Found ${candidates.length} candidates.`);

    candidates.forEach(input => {
        try {
            const id = input.getAttribute('data-upload-trigger-id');
            // 简单的防重入或过期检查 (可选)

            console.log(`[UploadHelper] Processing input ${id}`);

            // 1. 触发基础事件序列
            input.dispatchEvent(new Event('click', { bubbles: true }));
            input.dispatchEvent(new Event('focus', { bubbles: true }));
            input.dispatchEvent(new Event('input', { bubbles: true }));

            // 2. React Value Tracker Hack (核心)
            // 访问 Main World 中的 React 属性
            let tracker = input._valueTracker;
            if (tracker) {
                tracker.setValue(null);
                console.log('[UploadHelper] React ValueTracker reset success');
            } else {
                console.log('[UploadHelper] No _valueTracker found on input');
            }

            // 3. 触发关键的 Change 事件
            input.dispatchEvent(new Event('change', { bubbles: true }));

            // 4. 收尾
            input.dispatchEvent(new Event('blur', { bubbles: true }));

            // 5. 清理标记 (通知 Content Script 完成，或者自己清理)
            // 最好由 Content Script 清理，但为了保证只触发一次，我们这里移除属性
            input.removeAttribute('data-upload-trigger-id');

            console.log('[UploadHelper] Done.');
        } catch (e) {
            console.error('[UploadHelper] Error:', e);
        }
    });

    // 移除自身 (这个 script 标签)
    const currentScript = document.currentScript;
    if (currentScript && currentScript.parentElement) {
        currentScript.parentElement.removeChild(currentScript);
    }
})();
