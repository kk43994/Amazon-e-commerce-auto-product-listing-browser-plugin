"""
分析亚马逊添加商品表单页面
获取所有输入字段的定位信息
"""

import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

sys.path.insert(0, 'src')

from ziniao_rpa.core.ziniao_manager import ZiniaoManager


def analyze_form():
    """分析添加商品表单"""

    # 配置
    ZINIAO_PATH = r"D:\ziniao\ziniao.exe"
    USERNAME = "banbantt"
    PASSWORD = "Zjk15161671594"
    SECURITY_PASSWORD = "Zjk15161671594"
    PORT = 8848

    print("="*70)
    print("亚马逊添加商品表单分析工具")
    print("="*70)

    # 初始化紫鸟
    print("\n[1/5] 启动紫鸟...")
    manager = ZiniaoManager(ZINIAO_PATH, PORT)
    if not manager.start_client():
        print("❌ 紫鸟启动失败")
        return
    print("✅ 紫鸟启动成功")

    # 登录
    print("\n[2/5] 登录账号...")
    if not manager.login(USERNAME, PASSWORD, SECURITY_PASSWORD):
        print("❌ 登录失败")
        return
    print("✅ 登录成功")

    # 启动浏览器
    print("\n[3/5] 启动浏览器...")
    browsers = manager.get_browser_list()
    if not browsers:
        print("❌ 获取店铺失败")
        return

    browser_oauth = browsers[0].get('browserOauth')
    browser_info = manager.start_browser(browser_oauth, load_cookie=True)
    if not browser_info:
        print("❌ 浏览器启动失败")
        return
    print("✅ 浏览器启动成功")

    time.sleep(3)

    # 创建WebDriver
    driver = manager.create_webdriver(browser_info, "chromedriver.exe")
    if not driver:
        print("❌ WebDriver创建失败")
        return

    try:
        # 导航到添加商品页面
        print("\n[4/5] 导航到添加商品页面...")

        # 先访问卖家中心
        driver.get("https://sellercentral-japan.amazon.com")
        time.sleep(5)
        print(f"当前页面: {driver.title}")

        # 尝试直接访问添加商品页面
        add_product_url = "https://sellercentral-japan.amazon.com/product-search/search"
        print(f"\n访问: {add_product_url}")
        driver.get(add_product_url)
        time.sleep(5)

        print(f"当前URL: {driver.current_url}")
        print(f"当前标题: {driver.title}")

        # 分析页面
        print("\n[5/5] 分析页面结构...")
        print("="*70)

        # 查找所有输入框
        print("\n📝 所有输入框:")
        inputs = driver.find_elements(By.TAG_NAME, "input")
        for i, inp in enumerate(inputs[:20], 1):  # 只显示前20个
            inp_id = inp.get_attribute("id")
            inp_name = inp.get_attribute("name")
            inp_type = inp.get_attribute("type")
            inp_placeholder = inp.get_attribute("placeholder")

            if inp_id or inp_name:
                print(f"\n[{i}] Input:")
                if inp_id:
                    print(f"    ID: {inp_id}")
                if inp_name:
                    print(f"    Name: {inp_name}")
                if inp_type:
                    print(f"    Type: {inp_type}")
                if inp_placeholder:
                    print(f"    Placeholder: {inp_placeholder}")

        # 查找所有文本域
        print("\n\n📝 所有文本域:")
        textareas = driver.find_elements(By.TAG_NAME, "textarea")
        for i, ta in enumerate(textareas, 1):
            ta_id = ta.get_attribute("id")
            ta_name = ta.get_attribute("name")
            ta_placeholder = ta.get_attribute("placeholder")

            if ta_id or ta_name:
                print(f"\n[{i}] Textarea:")
                if ta_id:
                    print(f"    ID: {ta_id}")
                if ta_name:
                    print(f"    Name: {ta_name}")
                if ta_placeholder:
                    print(f"    Placeholder: {ta_placeholder}")

        # 查找所有按钮
        print("\n\n🔘 所有按钮:")
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for i, btn in enumerate(buttons[:10], 1):  # 只显示前10个
            btn_id = btn.get_attribute("id")
            btn_text = btn.text.strip()
            btn_class = btn.get_attribute("class")

            if btn_text or btn_id:
                print(f"\n[{i}] Button:")
                if btn_id:
                    print(f"    ID: {btn_id}")
                if btn_text:
                    print(f"    Text: {btn_text}")

        # 保存页面源码
        print("\n\n💾 保存页面源码...")
        with open("logs/add_product_page.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("✅ 已保存到: logs/add_product_page.html")

        # 截图
        print("\n📸 截图...")
        driver.save_screenshot("logs/add_product_page.png")
        print("✅ 已保存到: logs/add_product_page.png")

        print("\n" + "="*70)
        print("✅ 分析完成!")
        print("="*70)

        print("\n⏸️  浏览器将保持打开,你可以手动查看页面")
        print("按 Enter 键关闭...")
        input()

    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        print(traceback.format_exc())

    finally:
        print("\n正在关闭...")


if __name__ == "__main__":
    analyze_form()
