/**
 * 测试搜索流程 - 简化版
 * 在亚马逊页面控制台运行，逐步测试每个环节
 */

console.log('=== 搜索流程测试脚本 ===');

// 步骤1：点击搜索标签
async function step1_clickSearchTab() {
    console.log('\n步骤1: 点击搜索标签');

    // 查找"搜索"标签
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
        const text = el.textContent.trim();
        if (text === '搜索' && el.childNodes.length <= 1) {
            console.log('找到搜索标签:', el);
            el.click();
            console.log('✓ 已点击搜索标签');
            return true;
        }
    }

    console.log('❌ 未找到搜索标签');
    return false;
}

// 步骤2：查找输入框
async function step2_findInput() {
    console.log('\n步骤2: 查找输入框');

    // 等待输入框出现
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 直接查找普通输入框
    const input = document.querySelector('input[placeholder="输入商品名称、商品描述或关键词"]');

    if (input) {
        const rect = input.getBoundingClientRect();
        console.log('找到输入框:', {
            placeholder: input.placeholder,
            visible: rect.width > 0 && rect.height > 0,
            position: { x: rect.left, y: rect.top }
        });

        // 高亮显示
        input.style.border = '3px solid green';

        return input;
    }

    // 备选方案：查找任何可见的文本输入框
    const allInputs = document.querySelectorAll('input[type="text"], input:not([type])');
    for (const inp of allInputs) {
        const rect = inp.getBoundingClientRect();
        if (rect.width > 200 && rect.height > 20 && rect.top > 100) {
            console.log('找到备选输入框:', inp);
            inp.style.border = '3px solid yellow';
            return inp;
        }
    }

    console.log('❌ 未找到输入框');
    return null;
}

// 步骤3：输入ASIN
async function step3_inputASIN(input, asin = 'B08KXKQJP4') {
    console.log('\n步骤3: 输入ASIN');

    if (!input) {
        console.log('❌ 没有输入框');
        return false;
    }

    // 清空并输入
    input.focus();
    input.value = '';

    // 模拟逐字输入
    for (const char of asin) {
        input.value += char;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    input.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`✓ 已输入ASIN: ${asin}`);

    return true;
}

// 步骤4：查找搜索按钮
async function step4_findSearchButton() {
    console.log('\n步骤4: 查找搜索按钮');

    // 等待按钮启用
    await new Promise(resolve => setTimeout(resolve, 500));

    // 查找启用的搜索按钮
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
        const text = btn.textContent.trim();
        if ((text === '搜索' || text === 'Search' || text.includes('検索')) && !btn.disabled) {
            console.log('找到搜索按钮:', {
                text: text,
                enabled: !btn.disabled,
                visible: btn.offsetWidth > 0
            });

            // 高亮显示
            btn.style.border = '3px solid red';

            return btn;
        }
    }

    console.log('❌ 未找到搜索按钮');
    return null;
}

// 步骤5：点击搜索按钮
async function step5_clickSearch(button) {
    console.log('\n步骤5: 点击搜索按钮');

    if (!button) {
        console.log('❌ 没有搜索按钮');
        return false;
    }

    button.click();
    console.log('✓ 已点击搜索按钮');

    return true;
}

// 步骤6：等待并检查搜索结果
async function step6_waitForResults(timeout = 10000) {
    console.log('\n步骤6: 等待搜索结果');

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        // 检查URL变化
        if (window.location.href.includes('search')) {
            console.log('✓ URL已变化，进入搜索结果页');
        }

        // 查找搜索结果
        const productElements = document.querySelectorAll('*');
        for (const el of productElements) {
            const text = el.textContent || '';

            // 检查是否包含产品特征
            if (text.includes('アイリスオーヤマ') ||
                text.includes('IRIS OHYAMA') ||
                (text.includes('EAN') && text.includes('4967576510523'))) {

                console.log('✓ 找到搜索结果！');

                // 高亮显示
                if (el.tagName !== 'HTML' && el.tagName !== 'BODY') {
                    el.style.backgroundColor = 'yellow';
                }

                return el;
            }
        }

        // 等待500ms后重试
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('❌ 搜索结果加载超时');
    return null;
}

// 完整测试流程
async function runFullTest() {
    console.log('========== 开始完整测试流程 ==========\n');

    // 步骤1
    const tabClicked = await step1_clickSearchTab();
    if (!tabClicked) {
        console.log('⚠️ 搜索标签点击失败，请手动点击后继续');
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    // 步骤2
    const input = await step2_findInput();
    if (!input) {
        console.log('❌ 测试终止：未找到输入框');
        return;
    }

    // 步骤3
    await step3_inputASIN(input);

    // 步骤4
    const button = await step4_findSearchButton();

    // 步骤5
    if (button) {
        await step5_clickSearch(button);
    } else {
        console.log('尝试按回车键作为备选方案...');
        input.focus();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, bubbles: true }));
    }

    // 步骤6
    await step6_waitForResults();

    console.log('\n========== 测试完成 ==========');
    console.log('如果搜索结果已加载，说明流程正常');
    console.log('如果失败，请查看具体是哪一步出问题');
}

// 单步测试函数
window.testSearch = {
    step1_clickSearchTab,
    step2_findInput,
    step3_inputASIN,
    step4_findSearchButton,
    step5_clickSearch,
    step6_waitForResults,
    runFullTest
};

console.log('\n使用方法:');
console.log('1. 完整测试: testSearch.runFullTest()');
console.log('2. 单步测试:');
console.log('   - testSearch.step1_clickSearchTab()');
console.log('   - testSearch.step2_findInput()');
console.log('   - testSearch.step3_inputASIN(input)');
console.log('   - testSearch.step4_findSearchButton()');
console.log('   - testSearch.step5_clickSearch(button)');
console.log('   - testSearch.step6_waitForResults()');
console.log('\n💡 建议先运行完整测试，看哪一步失败');