/**
 * 调试回车键触发问题
 * 在亚马逊页面输入ASIN后运行此脚本测试不同的回车触发方式
 */

console.log('=== 回车键触发调试工具 ===');

// 测试方法1：最简单的回车键触发
function simpleEnter() {
    console.log('\n方法1：简单回车键触发');

    // 找到输入框
    const katInput = document.querySelector('kat-predictive-input[data-testid="keywords-input"]');
    if (katInput && katInput.shadowRoot) {
        const input = katInput.shadowRoot.querySelector('input');
        if (input) {
            console.log('找到Shadow DOM中的输入框');

            // 确保有焦点
            input.focus();

            // 触发回车
            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                keyCode: 13,
                bubbles: true
            });
            input.dispatchEvent(event);

            console.log('✓ 已触发简单回车');
            return true;
        }
    }

    console.log('❌ 未找到输入框');
    return false;
}

// 测试方法2：完整的键盘事件序列
function completeEnter() {
    console.log('\n方法2：完整键盘事件序列');

    const katInput = document.querySelector('kat-predictive-input[data-testid="keywords-input"]');
    if (katInput && katInput.shadowRoot) {
        const input = katInput.shadowRoot.querySelector('input');
        if (input) {
            input.focus();

            // keydown
            input.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true,
                composed: true
            }));

            // keypress（某些浏览器需要）
            input.dispatchEvent(new KeyboardEvent('keypress', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true,
                composed: true
            }));

            // keyup
            input.dispatchEvent(new KeyboardEvent('keyup', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true,
                composed: true
            }));

            console.log('✓ 已触发完整键盘事件序列');
            return true;
        }
    }

    console.log('❌ 未找到输入框');
    return false;
}

// 测试方法3：在宿主元素上触发
function hostElementEnter() {
    console.log('\n方法3：在宿主元素上触发');

    const katInput = document.querySelector('kat-predictive-input[data-testid="keywords-input"]');
    if (katInput) {
        // 先让内部input获得焦点
        if (katInput.shadowRoot) {
            const input = katInput.shadowRoot.querySelector('input');
            if (input) input.focus();
        }

        // 在宿主元素上触发
        katInput.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter',
            keyCode: 13,
            bubbles: true,
            composed: true  // 允许穿透Shadow DOM
        }));

        katInput.dispatchEvent(new KeyboardEvent('keyup', {
            key: 'Enter',
            keyCode: 13,
            bubbles: true,
            composed: true
        }));

        console.log('✓ 已在宿主元素上触发');
        return true;
    }

    console.log('❌ 未找到kat-predictive-input元素');
    return false;
}

// 测试方法4：使用Event构造函数
function eventConstructor() {
    console.log('\n方法4：使用Event构造函数');

    const katInput = document.querySelector('kat-predictive-input[data-testid="keywords-input"]');
    if (katInput && katInput.shadowRoot) {
        const input = katInput.shadowRoot.querySelector('input');
        if (input) {
            input.focus();

            // 创建并初始化事件
            const event = document.createEvent('KeyboardEvent');
            event.initKeyboardEvent('keydown', true, true, window, 'Enter', 0, '', false, '');

            // 设置keyCode（某些浏览器需要）
            Object.defineProperty(event, 'keyCode', { value: 13 });
            Object.defineProperty(event, 'which', { value: 13 });

            input.dispatchEvent(event);

            console.log('✓ 已使用Event构造函数触发');
            return true;
        }
    }

    console.log('❌ 未找到输入框');
    return false;
}

// 测试方法5：使用合成事件
function syntheticEnter() {
    console.log('\n方法5：合成事件（React风格）');

    const katInput = document.querySelector('kat-predictive-input[data-testid="keywords-input"]');
    if (katInput && katInput.shadowRoot) {
        const input = katInput.shadowRoot.querySelector('input');
        if (input) {
            input.focus();

            // 触发React合成事件（如果是React应用）
            const nativeEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                keyCode: 13,
                bubbles: true
            });

            // 触发原生事件
            input.dispatchEvent(nativeEvent);

            // 触发input事件（某些框架监听这个）
            input.dispatchEvent(new Event('input', { bubbles: true }));

            // 触发change事件
            input.dispatchEvent(new Event('change', { bubbles: true }));

            console.log('✓ 已触发合成事件');
            return true;
        }
    }

    console.log('❌ 未找到输入框');
    return false;
}

// 运行所有测试
async function runAllTests() {
    console.log('========== 开始测试所有方法 ==========\n');

    // 确保输入框有值
    const katInput = document.querySelector('kat-predictive-input[data-testid="keywords-input"]');
    if (katInput && katInput.shadowRoot) {
        const input = katInput.shadowRoot.querySelector('input');
        if (input && !input.value) {
            input.value = 'B08KXKQJP4';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('已设置测试ASIN: B08KXKQJP4');
        }
    }

    const methods = [
        { name: '简单回车', fn: simpleEnter },
        { name: '完整序列', fn: completeEnter },
        { name: '宿主元素', fn: hostElementEnter },
        { name: 'Event构造', fn: eventConstructor },
        { name: '合成事件', fn: syntheticEnter }
    ];

    for (const method of methods) {
        console.log(`\n测试 ${method.name}...`);
        method.fn();

        // 等待看是否有反应
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 检查是否触发了搜索
        if (window.location.href.includes('search') || window.location.href.includes('keywords')) {
            console.log(`✅ ${method.name} 方法成功触发了搜索！`);
            return method.name;
        }
    }

    console.log('\n❌ 所有方法都未能触发搜索');
    console.log('可能需要手动分析页面的具体实现');
    return null;
}

// 提供给用户的接口
window.debugEnter = {
    simpleEnter,
    completeEnter,
    hostElementEnter,
    eventConstructor,
    syntheticEnter,
    runAllTests
};

console.log('\n使用方法：');
console.log('1. 测试所有方法: debugEnter.runAllTests()');
console.log('2. 单独测试某个方法:');
console.log('   - debugEnter.simpleEnter()');
console.log('   - debugEnter.completeEnter()');
console.log('   - debugEnter.hostElementEnter()');
console.log('   - debugEnter.eventConstructor()');
console.log('   - debugEnter.syntheticEnter()');
console.log('\n💡 建议先运行 runAllTests() 找到有效的方法');