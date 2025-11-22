"""
完整流程测试:
1. 启动紫鸟并登录亚马逊
2. 导航到添加商品页面
3. 分析页面元素
4. 读取Excel数据
5. 自动填写第一个商品
"""
import sys
import os
import time
import json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager
from ziniao_rpa.modules.excel_reader import ExcelReader
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def save_page_elements(driver, filename="page_elements.json"):
    """保存页面所有元素信息"""
    script = """
    const elements = [];

    // 所有input
    document.querySelectorAll('input').forEach(el => {
        if (el.offsetParent !== null) {  // 只要可见的
            elements.push({
                type: 'input',
                inputType: el.type,
                id: el.id || '',
                name: el.name || '',
                placeholder: el.placeholder || '',
                label: findLabel(el),
                required: el.required
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
                label: findLabel(el)
            });
        }
    });

    // 所有select
    document.querySelectorAll('select').forEach(el => {
        if (el.offsetParent !== null) {
            elements.push({
                type: 'select',
                id: el.id || '',
                name: el.name || '',
                label: findLabel(el)
            });
        }
    });

    function findLabel(el) {
        // 查找关联的label
        if (el.id) {
            const label = document.querySelector(`label[for="${el.id}"]`);
            if (label) return label.textContent.trim();
        }
        // 查找父级label
        const parentLabel = el.closest('label');
        if (parentLabel) return parentLabel.textContent.trim();
        return '';
    }

    return elements;
    """

    try:
        elements = driver.execute_script(script)
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(elements, f, ensure_ascii=False, indent=2)
        print(f"[OK] 页面元素已保存到: {filename}")
        return elements
    except Exception as e:
        print(f"[ERROR] 保存页面元素失败: {e}")
        return None

def main():
    print("\n" + "="*70)
    print(" 紫鸟RPA - 完整流程测试")
    print("="*70 + "\n")

    # 读取测试数据
    print("[步骤 1/7] 读取商品数据...")
    reader = ExcelReader("data/input/test_products.xlsx")
    if not reader.load():
        return
    products = reader.get_products()
    print(f"[OK] 成功读取 {len(products)} 个商品")

    # 启动紫鸟
    print("\n[步骤 2/7] 启动紫鸟浏览器...")
    manager = ZiniaoManager(r"D:\ziniao\ziniao.exe", 8848)
    if not manager.start_client():
        return

    try:
        # 登录
        print("\n[步骤 3/7] 登录账号...")
        if not manager.login("banbantt", "Abanbantt", "~Abanbantt"):
            return

        # 获取店铺
        print("\n[步骤 4/7] 获取店铺列表...")
        browsers = manager.get_browser_list()
        if not browsers:
            return

        browser_oauth = browsers[0].get('browserOauth')
        print(f"[OK] 使用店铺: {browsers[0].get('browserName')}")

        # 启动浏览器
        print("\n[步骤 5/7] 启动店铺浏览器...")
        browser_info = manager.start_browser(browser_oauth, load_cookie=True)
        if not browser_info:
            return

        launcher_page = browser_info.get('launcherPage')
        print(f"[OK] 浏览器已启动")

        # 等待启动
        time.sleep(5)

        # 创建WebDriver
        print("\n[步骤 6/7] 创建WebDriver连接...")
        driver = manager.create_webdriver(
            browser_info,
            os.path.abspath("drivers/chromedriver137.exe")
        )

        if not driver:
            return

        # 导航到店铺页面
        if driver.current_url in ["about:blank", "data:,"]:
            print(f"[INFO] 导航到: {launcher_page}")
            driver.get(launcher_page)
            time.sleep(5)

        print(f"[OK] 当前页面: {driver.title}")

        # 导航到添加商品页面
        print("\n[步骤 7/7] 导航到添加商品页面...")
        print("[INFO] 请手动提供添加商品页面的URL,或者让我尝试查找...")

        # 亚马逊日本添加商品页面的可能URL
        add_product_urls = [
            "https://sellercentral-japan.amazon.com/product-search/search",
            "https://sellercentral-japan.amazon.com/hz/inventory/addproduct",
            "https://sellercentral-japan.amazon.com/abis/listing/create"
        ]

        print("\n尝试的URL:")
        for url in add_product_urls:
            print(f"  - {url}")

        print("\n当前在首页,可以:")
        print("  1. 手动在浏览器中导航到'添加商品'页面")
        print("  2. 然后按Enter继续分析页面元素")

        input("\n按Enter继续...")

        # 分析当前页面
        print("\n分析当前页面元素...")
        current_url = driver.current_url
        print(f"当前URL: {current_url}")

        elements = save_page_elements(driver, "amazon_add_product_elements.json")

        if elements:
            print(f"\n找到 {len(elements)} 个表单元素")
            print("\n前10个元素:")
            for i, el in enumerate(elements[:10], 1):
                label = el.get('label', '')
                el_id = el.get('id', '')
                el_name = el.get('name', '')
                print(f"{i}. {el['type']}: {label or el_id or el_name or '(无标识)'}")

        # 显示第一个商品信息
        print("\n" + "="*70)
        print("准备填写的第一个商品:")
        print("="*70)
        product = products[0]
        for key, value in product.items():
            if value and key not in ['image_1', 'image_2']:
                print(f"  {key}: {str(value)[:50]}")

        print("\n\n浏览器保持打开...")
        print("现在可以:")
        print("  1. 查看 amazon_add_product_elements.json 了解页面结构")
        print("  2. 编写自动填写脚本")
        print("  3. 按Ctrl+C退出")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n退出...")
            driver.quit()
            manager.stop_browser(browser_oauth)

    finally:
        manager.shutdown()

if __name__ == "__main__":
    main()
