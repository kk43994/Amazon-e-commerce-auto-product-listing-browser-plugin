"""
测试实际商品上传功能
从当前页面开始,找到添加商品入口并尝试上传
"""

import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

sys.path.insert(0, 'src')

from ziniao_rpa.core.ziniao_manager import ZiniaoManager
from ziniao_rpa.core.safety_manager import SafetyManager
from ziniao_rpa.modules.excel_reader import ExcelReader


def test_upload():
    """测试上传功能"""

    # 配置
    ZINIAO_PATH = r"D:\ziniao\ziniao.exe"
    USERNAME = "banbantt"
    PASSWORD = "Zjk15161671594"
    SECURITY_PASSWORD = "Zjk15161671594"
    PORT = 8848
    EXCEL_PATH = "data/input/test_products.xlsx"

    print("="*70)
    print("测试实际商品上传")
    print("="*70)

    # 读取商品数据
    print("\n[1/6] 读取商品数据...")
    reader = ExcelReader(EXCEL_PATH)
    if not reader.load():
        print(" 数据读取失败")
        return
    print(f"[OK] 成功读取 {len(reader.data)} 条数据")

    # 获取商品列表
    products = reader.get_products()

    # 只取第一个独立商品测试
    test_product = None
    for product in products:
        if not product.get('parent_sku'):  # 独立商品
            test_product = product
            break

    if not test_product:
        print(" 没有找到独立商品")
        return

    print(f"\n测试商品:")
    print(f"  SKU: {test_product['sku']}")
    print(f"  标题: {test_product['title'][:30]}...")
    print(f"  价格: {test_product['price']}")

    # 初始化紫鸟
    print("\n[2/6] 启动紫鸟...")
    manager = ZiniaoManager(ZINIAO_PATH, PORT)
    if not manager.start_client():
        print(" 紫鸟启动失败")
        return
    print(" 紫鸟启动成功")

    # 登录
    print("\n[3/6] 登录账号...")
    if not manager.login(USERNAME, PASSWORD, SECURITY_PASSWORD):
        print(" 登录失败")
        return
    print(" 登录成功")

    # 启动浏览器
    print("\n[4/6] 启动浏览器...")
    browsers = manager.get_browser_list()
    if not browsers:
        print(" 获取店铺失败")
        return

    browser_oauth = browsers[0].get('browserOauth')
    browser_info = manager.start_browser(browser_oauth, load_cookie=True)
    if not browser_info:
        print(" 浏览器启动失败")
        return
    print(" 浏览器启动成功")

    time.sleep(3)

    # 创建WebDriver
    driver = manager.create_webdriver(browser_info, "chromedriver.exe")
    if not driver:
        print(" WebDriver创建失败")
        return

    try:
        # 导航到首页
        print("\n[5/6] 导航到卖家中心...")
        driver.get("https://sellercentral-japan.amazon.com/home")
        time.sleep(5)
        print(f" 当前页面: {driver.title}")

        # 安全检查
        print("\n[6/6] 执行安全检查...")
        safety = SafetyManager(driver)

        if not safety.check_ip_safety():
            print(" IP检查失败")
            return
        print(" IP检查通过")

        if not safety.check_account_health():
            print(" 账号健康检查失败")
            return
        print(" 账号健康检查通过")

        print("\n" + "="*70)
        print("准备开始上传商品")
        print("="*70)

        # 查找添加商品入口
        print("\n 查找添加商品入口...")

        # 方法1: 通过菜单导航
        print("\n尝试方法1: 查找菜单项...")
        try:
            # 查找包含 "カタログ" 或 "Catalog" 的链接
            links = driver.find_elements(By.TAG_NAME, "a")
            for link in links:
                text = link.text.strip()
                if "カタログ" in text or "Catalog" in text or "商品登録" in text:
                    print(f"  找到链接: {text}")
                    print(f"  URL: {link.get_attribute('href')}")
        except Exception as e:
            print(f"  方法1失败: {e}")

        # 方法2: 直接访问添加商品URL
        print("\n尝试方法2: 直接访问添加商品页面...")
        possible_urls = [
            "https://sellercentral-japan.amazon.com/product-search/search",
            "https://sellercentral-japan.amazon.com/abis/Display/ItemSearch",
            "https://sellercentral-japan.amazon.com/productsearch/search",
            "https://sellercentral-japan.amazon.com/hz/inventory/add-product",
        ]

        for url in possible_urls:
            try:
                print(f"\n  尝试访问: {url}")
                driver.get(url)
                time.sleep(3)

                current_url = driver.current_url
                print(f"  跳转到: {current_url}")
                print(f"  页面标题: {driver.title}")

                # 检查是否成功
                if "search" in current_url.lower() or "add" in current_url.lower():
                    print(f"   成功进入页面!")
                    break
            except Exception as e:
                print(f"   访问失败: {e}")

        # 分析当前页面
        print("\n\n 分析当前页面...")
        print(f"URL: {driver.current_url}")
        print(f"标题: {driver.title}")

        # 查找搜索框
        print("\n 查找搜索框...")
        search_found = False

        try:
            # 查找可能的搜索框
            inputs = driver.find_elements(By.TAG_NAME, "input")
            for inp in inputs:
                inp_type = inp.get_attribute("type")
                inp_placeholder = inp.get_attribute("placeholder")
                inp_id = inp.get_attribute("id")

                if inp_type in ["text", "search"]:
                    print(f"\n  找到输入框:")
                    print(f"    ID: {inp_id}")
                    print(f"    Placeholder: {inp_placeholder}")

                    if not search_found:
                        search_found = True
                        print(f"\n   使用这个搜索框")

                        # 尝试输入关键词搜索
                        print(f"\n  尝试搜索产品类别...")
                        inp.clear()
                        inp.send_keys("electronics")
                        time.sleep(2)
                        inp.send_keys(Keys.RETURN)
                        time.sleep(5)

                        print(f"  搜索后URL: {driver.current_url}")
                        print(f"  搜索后标题: {driver.title}")
                        break

        except Exception as e:
            print(f"  查找搜索框失败: {e}")

        # 截图保存当前状态
        print("\n\n 保存当前页面截图...")
        driver.save_screenshot("logs/current_page.png")
        print(" 已保存到: logs/current_page.png")

        # 保存页面源码
        print("\n 保存页面源码...")
        with open("logs/current_page.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print(" 已保存到: logs/current_page.html")

        print("\n" + "="*70)
        print("  浏览器保持打开,请手动查看页面")
        print("你可以:")
        print("1. 查看 logs/current_page.png 截图")
        print("2. 查看 logs/current_page.html 源码")
        print("3. 在浏览器中手动导航到添加商品页面")
        print("\n按 Enter 键继续...")
        print("="*70)
        input()

        # 让用户告诉我们正确的URL
        print("\n请告诉我:")
        print("1. 添加商品的正确URL是什么?")
        print("2. 页面上有哪些关键元素(按钮/输入框)?")

    except Exception as e:
        print(f"\n 错误: {e}")
        import traceback
        print(traceback.format_exc())

    finally:
        print("\n等待用户反馈...")
        input("按 Enter 键关闭...")


if __name__ == "__main__":
    test_upload()
