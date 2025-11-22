"""
从商品搜索页导航到空白表单页面
然后分析空白表单的所有输入字段
"""
import sys
import os
import time
import json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def find_and_click_blank_form(driver):
    """查找并点击'空白表单'链接"""
    print("\n查找'空白表单'链接...")

    # 可能的定位方式
    selectors = [
        "//a[contains(text(), '空白表单')]",
        "//a[contains(@href, 'blank')]",
        "//button[contains(text(), '空白表单')]",
        "//div[contains(text(), '空白表单')]//ancestor::a",
        "//span[contains(text(), '空白表单')]//ancestor::a"
    ]

    for selector in selectors:
        try:
            element = driver.find_element(By.XPATH, selector)
            if element:
                print(f"[OK] 找到元素: {selector}")
                element.click()
                print("[OK] 已点击'空白表单'")
                time.sleep(3)
                return True
        except Exception as e:
            continue

    print("[WARN] 未找到'空白表单'链接")
    return False

def analyze_form_page(driver):
    """分析表单页面的所有元素"""
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
                label: findLabel(el),
                options: options.slice(0, 10)
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
        with open("blank_form_elements.json", 'w', encoding='utf-8') as f:
            json.dump(elements, f, ensure_ascii=False, indent=2)

        print(f"\n[OK] 找到 {len(elements)} 个表单元素")
        print(f"[OK] 已保存到: blank_form_elements.json")

        # 显示前20个元素
        print("\n前20个表单元素:")
        print("="*70)
        for i, el in enumerate(elements[:20], 1):
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

# 导航
if driver.current_url in ["about:blank", "data:,"]:
    driver.get(browser_info.get('launcherPage'))
    time.sleep(5)

print(f"\n当前URL: {driver.current_url}")
print(f"页面标题: {driver.title}")

# 如果不在搜索页面,先导航过去
if "product-search" not in driver.current_url:
    search_url = "https://sellercentral-japan.amazon.com/product-search?ref=xx_catadd_favb_xx"
    print(f"\n导航到搜索页面: {search_url}")
    driver.get(search_url)
    time.sleep(3)

print("\n等待30秒,请在页面上找到并点击'空白表单'按钮...")
print("(如果需要更多时间,我会等待)")
for i in range(30):
    time.sleep(1)
    print(f"  {i+1}/30", end='\r')

print("\n\n开始分析当前页面...")
print(f"当前URL: {driver.current_url}")
print(f"页面标题: {driver.title}")

elements = analyze_form_page(driver)

print("\n浏览器保持打开60秒...")
time.sleep(60)

driver.quit()
manager.stop_browser(browser_oauth)
manager.shutdown()
