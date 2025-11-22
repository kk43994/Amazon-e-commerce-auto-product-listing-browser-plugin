"""
测试自动化上传流程 V2
不手动导航,让紫鸟自己打开默认页面
"""
import sys
import os
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager
from ziniao_rpa.modules.excel_reader import ExcelReader

ZINIAO_CLIENT_PATH = r"D:\ziniao\ziniao.exe"
ZINIAO_PORT = 8848
ZINIAO_COMPANY = "banbantt"
ZINIAO_USERNAME = "Abanbantt"
ZINIAO_PASSWORD = "~Abanbantt"
TEST_EXCEL = "data/input/test_products.xlsx"

def main():
    print("\n" + "="*70)
    print(" 紫鸟RPA - 自动化上传测试 V2")
    print(" (不手动导航,观察紫鸟默认行为)")
    print("="*70 + "\n")

    # 步骤1: 读取Excel
    print("[步骤 1/6] 读取商品数据...")
    reader = ExcelReader(TEST_EXCEL)
    if not reader.load():
        return
    products = reader.get_products()
    print(f"[OK] 成功读取 {len(products)} 个商品")

    # 步骤2: 启动紫鸟
    print("\n[步骤 2/6] 启动紫鸟浏览器...")
    manager = ZiniaoManager(ZINIAO_CLIENT_PATH, ZINIAO_PORT)
    if not manager.start_client():
        return

    try:
        # 步骤3: 登录
        print("\n[步骤 3/6] 登录账号...")
        if not manager.login(ZINIAO_COMPANY, ZINIAO_USERNAME, ZINIAO_PASSWORD):
            return

        # 步骤4: 获取店铺
        print("\n[步骤 4/6] 获取店铺列表...")
        browsers = manager.get_browser_list()
        if not browsers:
            return

        for idx, b in enumerate(browsers, 1):
            name = b.get('browserName') or b.get('name') or '未命名'
            print(f"  {idx}. {name}")

        # 步骤5: 启动店铺浏览器
        print("\n[步骤 5/6] 启动店铺浏览器...")
        browser_oauth = browsers[0].get('browserOauth')
        browser_info = manager.start_browser(browser_oauth)

        if not browser_info:
            return

        print(f"[OK] 店铺浏览器已启动")
        print(f"     调试端口: {browser_info.get('debuggingPort')}")

        # 打印所有返回字段
        print("\n" + "-"*70)
        print("startBrowser 返回的所有字段:")
        print("-"*70)
        for key, value in browser_info.items():
            if key not in ['requestId', 'machine_common_string', 'new_maching_string']:
                # 截断长URL
                if isinstance(value, str) and len(str(value)) > 80:
                    print(f"  {key}: {str(value)[:77]}...")
                else:
                    print(f"  {key}: {value}")
        print("-"*70)

        # 步骤6: 创建WebDriver
        print("\n[步骤 6/6] 创建Selenium WebDriver...")
        chromedriver_path = os.path.abspath("drivers/chromedriver137.exe")
        driver = manager.create_webdriver(browser_info, chromedriver_path)

        if not driver:
            return

        print(f"[OK] WebDriver创建成功")

        # 关键: 不导航,只等待
        print("\n" + "="*70)
        print("重要: 不调用 driver.get(),观察紫鸟默认打开的页面")
        print("="*70)

        print(f"\n当前URL: {driver.current_url}")
        print(f"页面标题: {driver.title}")

        # 等待10秒,看紫鸟是否会自动导航
        print("\n等待10秒,观察紫鸟是否自动导航到店铺页面...")
        for i in range(10):
            time.sleep(1)
            current_url = driver.current_url
            if current_url != "data:," and current_url != "about:blank":
                print(f"\n检测到页面变化!")
                print(f"  新URL: {current_url}")
                print(f"  新标题: {driver.title}")
                break
            print(f"  等待中... {i+1}/10 (当前: {current_url})")

        # 最终状态
        print("\n" + "="*70)
        print("最终页面状态:")
        print("="*70)
        print(f"URL: {driver.current_url}")
        print(f"标题: {driver.title}")

        # 显示商品信息
        print("\n" + "="*70)
        print("准备上传的商品:")
        print("="*70)
        for i, p in enumerate(products, 1):
            print(f"\n{i}. {p.get('title', 'N/A')[:50]}...")
            print(f"   品牌: {p.get('brand', 'N/A')}")
            print(f"   价格: {p.get('price', 'N/A')}")

        # 保持打开
        print("\n" + "="*70)
        print("浏览器保持打开,请手动查看...")
        print("按 Ctrl+C 退出")
        print("="*70 + "\n")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n用户中断...")

        driver.quit()
        manager.stop_browser(browser_oauth)

    finally:
        manager.shutdown()

if __name__ == "__main__":
    main()
