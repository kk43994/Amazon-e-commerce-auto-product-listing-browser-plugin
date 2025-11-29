/**
 * 调试工具：帮助找到正确的输入框
 * 使用方法：
 * 1. 在亚马逊页面打开控制台（F12）
 * 2. 点击搜索标签，等待弹出框出现
 * 3. 复制粘贴这段代码到控制台运行
 * 4. 点击正确的输入框
 * 5. 将输出的信息发送给开发者
 */

console.log('=== 输入框查找调试工具启动 ===');
console.log('请点击正确的ASIN搜索输入框...');

// 方法1：监听点击事件，获取被点击的输入框信息
document.addEventListener('click', function debugClickHandler(e) {
    const target = e.target;

    // 只处理input元素
    if (target.tagName !== 'INPUT') {
        console.log('点击的不是输入框，请点击输入框');
        return;
    }

    // 阻止默认行为
    e.preventDefault();
    e.stopPropagation();

    console.log('\n========== 找到输入框！==========');
    console.log('请将以下信息复制给开发者：\n');

    // 收集输入框信息
    const info = {
        // 基本属性
        tagName: target.tagName,
        type: target.type,
        id: target.id || '(无ID)',
        className: target.className || '(无class)',
        name: target.name || '(无name)',
        placeholder: target.placeholder || '(无placeholder)',

        // 位置信息
        position: {
            top: target.getBoundingClientRect().top,
            left: target.getBoundingClientRect().left,
            width: target.getBoundingClientRect().width,
            height: target.getBoundingClientRect().height
        },

        // 父元素信息
        parent: {
            tagName: target.parentElement?.tagName,
            id: target.parentElement?.id || '(无ID)',
            className: target.parentElement?.className || '(无class)'
        },

        // 祖父元素信息（可能是弹出框容器）
        grandParent: {
            tagName: target.parentElement?.parentElement?.tagName,
            id: target.parentElement?.parentElement?.id || '(无ID)',
            className: target.parentElement?.parentElement?.className || '(无class)'
        },

        // 查找最近的弹出框容器
        nearestModal: null,

        // 生成唯一选择器
        selector: null
    };

    // 查找最近的弹出框容器
    let modalParent = target.closest('[role="dialog"], [class*="modal"], [class*="popup"], [class*="overlay"], kat-modal, [class*="kat"]');
    if (modalParent) {
        info.nearestModal = {
            tagName: modalParent.tagName,
            id: modalParent.id || '(无ID)',
            className: modalParent.className || '(无class)',
            role: modalParent.getAttribute('role') || '(无role)'
        };
    }

    // 生成选择器建议
    const selectors = [];

    // ID选择器
    if (target.id) {
        selectors.push(`#${target.id}`);
    }

    // Class选择器
    if (target.className) {
        const classes = target.className.split(' ').filter(c => c.trim());
        if (classes.length > 0) {
            selectors.push(`.${classes.join('.')}`);
        }
    }

    // Placeholder选择器
    if (target.placeholder) {
        selectors.push(`input[placeholder="${target.placeholder}"]`);
    }

    // Name选择器
    if (target.name) {
        selectors.push(`input[name="${target.name}"]`);
    }

    info.selector = selectors;

    // 输出信息
    console.log('=== 输入框详细信息 ===');
    console.log(JSON.stringify(info, null, 2));

    // 高亮显示该输入框
    target.style.border = '3px solid red';
    target.style.backgroundColor = '#ffeeee';

    console.log('\n=== 可用的CSS选择器 ===');
    selectors.forEach(sel => {
        console.log(sel);
    });

    // 如果在弹出框中
    if (info.nearestModal) {
        console.log('\n=== 在弹出框中的选择器 ===');
        const modalSelector = info.nearestModal.id ? `#${info.nearestModal.id}` :
                             info.nearestModal.className ? `.${info.nearestModal.className.split(' ')[0]}` :
                             info.nearestModal.tagName.toLowerCase();

        selectors.forEach(sel => {
            console.log(`${modalSelector} ${sel}`);
        });
    }

    // 生成代码片段
    console.log('\n=== 建议的查找代码 ===');
    if (info.nearestModal) {
        console.log(`// 方法1：在弹出框中查找`);
        console.log(`const modal = document.querySelector('${modalSelector}');`);
        console.log(`const input = modal ? modal.querySelector('${selectors[0] || 'input'}') : null;`);
    } else {
        console.log(`// 方法1：直接查找`);
        console.log(`const input = document.querySelector('${selectors[0] || 'input'}');`);
    }

    console.log('\n请将以上所有信息复制给开发者！');
    console.log('================================\n');

    // 移除监听器
    document.removeEventListener('click', debugClickHandler);
    console.log('调试工具已停止，刷新页面可重新使用');

}, true); // 使用捕获阶段

// 方法2：列出所有可见的输入框
console.log('\n=== 当前页面所有可见输入框 ===');
const allInputs = document.querySelectorAll('input[type="text"], input[type="search"], input:not([type])');
const visibleInputs = [];

allInputs.forEach((input, index) => {
    const rect = input.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 &&
                     rect.top >= 0 && rect.top < window.innerHeight;

    if (isVisible) {
        visibleInputs.push({
            index: index,
            id: input.id || '(无)',
            className: input.className || '(无)',
            placeholder: input.placeholder || '(无)',
            position: `top: ${Math.round(rect.top)}, left: ${Math.round(rect.left)}`,
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            value: input.value || '(空)'
        });

        // 添加临时标记
        input.setAttribute('data-debug-index', index);
        input.style.outline = '2px dashed blue';
    }
});

console.table(visibleInputs);
console.log(`共找到 ${visibleInputs.length} 个可见输入框`);
console.log('蓝色虚线框标记的是所有可见输入框');
console.log('点击正确的输入框，红色实线框会标记你的选择');