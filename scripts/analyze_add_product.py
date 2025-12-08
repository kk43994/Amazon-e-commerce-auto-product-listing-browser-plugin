"""
分析亚马逊添加商品页面元素
等待3分钟让用户导航到页面
"""
import sys
import os
import time
import json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager

def analyze_page(driver):
    """分析页面元素"""
    script = """
    const elements = [];

    // 扫描所有input
    document.querySelectorAll('input').forEach((el, idx) => {
        if (el.offsetParent !== null || el.type === 'hidden') {
            elements.push({
                type: 'input',
                inputType: el.type,
                id: el.id || '',
                name: el.name || '',
                placeholder: el.placeholder || '',
                className: el.className || '',
                label: findLabel(el),
                ariaLabel: el.getAttribute('aria-label') || ''
            });
        }
    });

    // 扫描所有button
    document.querySelectorAll('button').forEach((el, idx) => {
        if (el.offsetParent !== null) {
            elements.push({
                type: 'button',
                id: el.id || '',
                text: el.textContent.trim().substring(0, 50),
                className: el.className || ''
            });
        }
    });

    // 扫描所有a标签
    document.querySelectorAll('a').forEach((el, idx) => {
        if (el.offsetParent !== null) {
            const text = el.textContent.trim();
            if (text && text.length < 100) {
                elements.push({
                    type: 'link',
                    id: el.id || '',
                    text: text,
                    href: el.href || '',
                    className: el.className || ''
                });
            }
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

    elements = driver.execute_script(script)

    # 保存到文件
    with open("add_product_page.json", 'w', encoding='utf-8') as f:
        json.dump(elements, f, ensure_ascii=False, indent=2)

    print(f"\n找到 {len(elements)} 个元素")
    print(f"已保存到: add_product_page.json")

    # 按类型分组
    by_type = {}
    for el in elements:
        t = el['type']
        by_type[t] = by_type.get(t, 0) + 1

    print("\n元素统计:")
    for t, count in by_type.items():
        print(f"  {t}: {count}")

    # 显示所有按钮和链接
    buttons = [el for el in elements if el['type'] == 'button']
    links = [el for el in elements if el['type'] == 'link']
    inputs = [el for el in elements if el['type'] == 'input']

    print("\n所有按钮:")
    print("="*70)
    for i, btn in enumerate(buttons[:20], 1):
        print(f"{i}. {btn['text']}")
        if btn['id']:
            print(f"   ID: {btn['id']}")

    print("\n重要链接:")
    print("="*70)
    for i, link in enumerate(links[:20], 1):
        if '空白表单' in link['text'] or '搜索' in link['text'] or '电子表格' in link['text']:
            print(f"{i}. {link['text']}")
            if link['id']:
                print(f"   ID: {link['id']}")
            print(f"   href: {link['href'][:80]}")

    print("\n输入框:")
    print("="*70)
    for i, inp in enumerate(inputs[:10], 1):
        print(f"{i}. {inp['inputType']}")
        if inp['placeholder']:
            print(f"   提示: {inp['placeholder']}")
        if inp['id']:
            print(f"   ID: {inp['id']}")

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

print("\n等待30秒,请导航到'发布商品'页面...")
print("提示: 在亚马逊卖家中心,点击 库存 -> 添加商品")
for i in range(30):
    time.sleep(1)
    print(f"  {i+1}/30", end='\r')

print("\n\n开始分析页面...")
print(f"当前URL: {driver.current_url}")

analyze_page(driver)

print("\n浏览器保持打开60秒...")
for i in range(60):
    time.sleep(1)
    if i % 10 == 0:
        print(f"  {i}/60")

driver.quit()
manager.stop_browser(browser_oauth)
manager.shutdown()
