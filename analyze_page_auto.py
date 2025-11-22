"""
自动分析当前页面元素(不需要手动输入)
"""
import sys
import os
import time
import json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager

def analyze_page_elements(driver):
    """分析页面元素"""
    script = """
    const elements = [];

    // 扫描所有input
    document.querySelectorAll('input').forEach((el, idx) => {
        if (el.offsetParent !== null || el.type === 'hidden') {
            const rect = el.getBoundingClientRect();
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
                label: findLabelText(el),
                ariaLabel: el.getAttribute('aria-label') || ''
            });
        }
    });

    // 扫描所有textarea
    document.querySelectorAll('textarea').forEach((el, idx) => {
        if (el.offsetParent !== null) {
            elements.push({
                type: 'textarea',
                id: el.id || '',
                name: el.name || '',
                placeholder: el.placeholder || '',
                className: el.className || '',
                label: findLabelText(el),
                ariaLabel: el.getAttribute('aria-label') || ''
            });
        }
    });

    // 扫描所有select
    document.querySelectorAll('select').forEach((el, idx) => {
        if (el.offsetParent !== null) {
            const options = Array.from(el.options).map(opt => opt.text);
            elements.push({
                type: 'select',
                id: el.id || '',
                name: el.name || '',
                className: el.className || '',
                label: findLabelText(el),
                ariaLabel: el.getAttribute('aria-label') || '',
                options: options.slice(0, 5)
            });
        }
    });

    function findLabelText(element) {
        if (element.id) {
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label) return label.textContent.trim();
        }
        const parentLabel = element.closest('label');
        if (parentLabel) {
            const clone = parentLabel.cloneNode(true);
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
        output_file = "amazon_page_elements.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(elements, f, ensure_ascii=False, indent=2)

        print(f"\n[OK] 找到 {len(elements)} 个元素")
        print(f"[OK] 已保存到: {output_file}")

        # 显示前15个重要元素
        important = [el for el in elements if el['type'] in ['input', 'textarea', 'select'] and el.get('visible', True)]

        print("\n前15个重要元素:")
        print("="*70)
        for i, el in enumerate(important[:15], 1):
            label = el.get('label', '') or el.get('ariaLabel', '') or el.get('placeholder', '')
            print(f"\n{i}. {el['type'].upper()}")
            if label:
                print(f"   标签: {label[:60]}")
            if el.get('id'):
                print(f"   ID: {el['id']}")
            if el.get('name'):
                print(f"   Name: {el['name']}")

        return elements
    except Exception as e:
        print(f"[ERROR] 分析失败: {e}")
        return None

manager = ZiniaoManager(r"D:\ziniao\ziniao.exe", 8848)
print("启动紫鸟...")
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

# 导航
if driver.current_url in ["about:blank", "data:,"]:
    driver.get(browser_info.get('launcherPage'))
    time.sleep(5)

print(f"\n当前URL: {driver.current_url}")
print(f"页面标题: {driver.title}")

# 等待60秒让你手动导航到添加商品页面
print("\n等待60秒,请在浏览器中导航到添加商品页面...")
for i in range(60):
    time.sleep(1)
    print(f"  {i+1}/60", end='\r')

print("\n\n开始分析页面...")
analyze_page_elements(driver)

print("\n浏览器将保持打开30秒...")
time.sleep(30)

driver.quit()
manager.stop_browser(browser_oauth)
manager.shutdown()
