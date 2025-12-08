"""
直接访问空白表单URL并分析元素
"""
import sys
import os
import time
import json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager

BLANK_FORM_URL = "https://sellercentral-japan.amazon.com/abis/listing/create/product_identity#product_identity"

def analyze_elements(driver):
    """分析所有表单元素"""
    script = """
    const elements = [];

    document.querySelectorAll('input, textarea, select, button').forEach(el => {
        if (el.offsetParent !== null || el.type === 'hidden') {
            const findLabel = (element) => {
                if (element.id) {
                    const label = document.querySelector(`label[for="${element.id}"]`);
                    if (label) return label.textContent.trim();
                }
                const parent = element.closest('label');
                if (parent) {
                    const clone = parent.cloneNode(true);
                    clone.querySelectorAll('input, textarea, select').forEach(inp => inp.remove());
                    return clone.textContent.trim();
                }
                return '';
            };

            const item = {
                type: el.tagName.toLowerCase(),
                id: el.id || '',
                name: el.name || '',
                className: el.className || '',
                label: findLabel(el),
                ariaLabel: el.getAttribute('aria-label') || ''
            };

            if (el.tagName === 'INPUT') {
                item.inputType = el.type;
                item.placeholder = el.placeholder || '';
                item.required = el.required;
            } else if (el.tagName === 'TEXTAREA') {
                item.placeholder = el.placeholder || '';
            } else if (el.tagName === 'SELECT') {
                item.options = Array.from(el.options).slice(0, 5).map(opt => opt.text);
            } else if (el.tagName === 'BUTTON') {
                item.text = el.textContent.trim().substring(0, 50);
            }

            elements.push(item);
        }
    });

    return elements;
    """

    elements = driver.execute_script(script)

    with open("form_elements.json", 'w', encoding='utf-8') as f:
        json.dump(elements, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] 找到 {len(elements)} 个元素")
    print("[OK] 已保存到: form_elements.json")

    # 统计
    by_type = {}
    for el in elements:
        t = el['type']
        by_type[t] = by_type.get(t, 0) + 1

    print("\n元素统计:")
    for t, count in by_type.items():
        print(f"  {t}: {count}")

    # 显示表单字段
    form_fields = [el for el in elements if el['type'] in ['input', 'textarea', 'select']]
    print(f"\n前20个表单字段:")
    print("="*70)
    for i, el in enumerate(form_fields[:20], 1):
        label = el.get('label') or el.get('ariaLabel') or el.get('placeholder') or 'N/A'
        print(f"\n{i}. {el['type'].upper()}")
        print(f"   标签: {label[:50]}")
        if el.get('id'):
            print(f"   ID: {el['id']}")
        if el.get('name'):
            print(f"   Name: {el['name']}")

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
time.sleep(3)

driver = manager.create_webdriver(browser_info, os.path.abspath("drivers/chromedriver137.exe"))

print(f"\n导航到空白表单: {BLANK_FORM_URL}")
driver.get(BLANK_FORM_URL)
time.sleep(5)

print(f"\n当前URL: {driver.current_url}")
print("分析页面元素...")

analyze_elements(driver)

print("\n浏览器保持打开30秒...")
time.sleep(30)

driver.quit()
manager.stop_browser(browser_oauth)
manager.shutdown()
