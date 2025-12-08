"""
直接导航到空白表单URL并分析元素
"""
import sys
import os
import time
import json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager

def analyze_form_elements(driver):
    """分析表单元素"""
    script = """
    const elements = [];

    // 所有input
    document.querySelectorAll('input').forEach(el => {
        if (el.offsetParent !== null || el.type === 'hidden') {
            elements.push({
                type: 'input',
                inputType: el.type,
                id: el.id || '',
                name: el.name || '',
                placeholder: el.placeholder || '',
                value: el.value || '',
                className: el.className || '',
                required: el.required,
                visible: el.offsetParent !== null,
                label: findLabel(el),
                ariaLabel: el.getAttribute('aria-label') || ''
            });
        }
    });

    // 所有textarea
    document.querySelectorAll('textarea').forEach(el => {
        if (el.offsetParent !== null) {
            elements.push({
                type: 'textarea',
                id: el.id || '',
                name: el.name || '',
                placeholder: el.placeholder || '',
                className: el.className || '',
                label: findLabel(el),
                ariaLabel: el.getAttribute('aria-label') || ''
            });
        }
    });

    // 所有select
    document.querySelectorAll('select').forEach(el => {
        if (el.offsetParent !== null) {
            const options = Array.from(el.options).map(opt => opt.text);
            elements.push({
                type: 'select',
                id: el.id || '',
                name: el.name || '',
                className: el.className || '',
                label: findLabel(el),
                ariaLabel: el.getAttribute('aria-label') || '',
                options: options.slice(0, 10)
            });
        }
    });

    // 所有button
    document.querySelectorAll('button').forEach(el => {
        if (el.offsetParent !== null) {
            elements.push({
                type: 'button',
                id: el.id || '',
                text: el.textContent.trim().substring(0, 50),
                className: el.className || '',
                buttonType: el.type || 'button'
            });
        }
    });

    function findLabel(el) {
        if (el.id) {
            const label = document.querySelector(`label[for="${el.id}"]`);
            if (label) return label.textContent.trim();
        }
        const parent = el.closest('label');
        if (parent) {
            const clone = parent.cloneNode(true);
            const inputs = clone.querySelectorAll('input, textarea, select');
            inputs.forEach(inp => inp.remove());
            return clone.textContent.trim();
        }
        return '';
    }

    return elements;
    """

    try:
        elements = driver.execute_script(script)

        # 保存到文件
        with open("blank_form_elements.json", 'w', encoding='utf-8') as f:
            json.dump(elements, f, ensure_ascii=False, indent=2)

        print(f"\n[OK] 找到 {len(elements)} 个元素")
        print(f"[OK] 已保存到: blank_form_elements.json")

        # 统计
        by_type = {}
        for el in elements:
            t = el['type']
            by_type[t] = by_type.get(t, 0) + 1

        print("\n元素统计:")
        for t, count in by_type.items():
            print(f"  {t}: {count} 个")

        # 显示前30个表单元素(不包括按钮)
        form_elements = [el for el in elements if el['type'] in ['input', 'textarea', 'select'] and el.get('visible', True)]

        print("\n" + "="*70)
        print("前30个表单元素:")
        print("="*70)
        for i, el in enumerate(form_elements[:30], 1):
            label = el.get('label', '') or el.get('ariaLabel', '') or el.get('placeholder', '')
            print(f"\n{i}. {el['type'].upper()}")
            if label:
                print(f"   标签: {label[:60]}")
            if el.get('id'):
                print(f"   ID: {el['id']}")
            if el.get('name'):
                print(f"   Name: {el['name']}")
            if el.get('inputType'):
                print(f"   类型: {el['inputType']}")
            if el.get('required'):
                print(f"   必填: 是")

        return elements
    except Exception as e:
        print(f"[ERROR] 分析失败: {e}")
        import traceback
        traceback.print_exc()
        return None

print("启动紫鸟...")
manager = ZiniaoManager(r"D:\ziniao\ziniao.exe", 8848)
manager.start_client()

print("登录...")
manager.login("banbantt", "Abanbantt", "~Abanbantt")

print("获取店铺...")
browsers = manager.get_browser_list()
browser_oauth = browsers[0].get('browserOauth')

print("启动浏览器...")
browser_info = manager.start_browser(browser_oauth, load_cookie=True)
time.sleep(5)

driver = manager.create_webdriver(browser_info, os.path.abspath("drivers/chromedriver137.exe"))

# 导航到首页
if driver.current_url in ["about:blank", "data:,"]:
    driver.get(browser_info.get('launcherPage'))
    time.sleep(5)

print(f"\n当前URL: {driver.current_url}")

# 让用户手动导航到空白表单
print("\n请在浏览器中:")
print("  1. 导航到'库存' -> '添加商品'")
print("  2. 点击'空白表单'")
print("  3. 等待表单页面完全加载")
print("\n等待30秒...")

for i in range(30):
    time.sleep(1)
    print(f"  {i+1}/30", end='\r')

print("\n\n开始分析页面...")
print(f"当前URL: {driver.current_url}")
print(f"页面标题: {driver.title}")

elements = analyze_form_elements(driver)

if elements:
    print("\n" + "="*70)
    print("分析完成!")
    print("="*70)
    print("\n请查看 blank_form_elements.json 了解完整信息")

print("\n浏览器保持打开,按Ctrl+C退出...")
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n退出...")
    driver.quit()
    manager.stop_browser(browser_oauth)
    manager.shutdown()
