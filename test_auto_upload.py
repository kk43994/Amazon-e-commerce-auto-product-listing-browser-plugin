"""
测试自动化上传流程
从Excel读取商品数据,自动打开店铺浏览器,测试上传流程
"""
import sys
import os
import time

# 添加src目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager
from ziniao_rpa.modules.excel_reader import ExcelReader

# 配置
ZINIAO_CLIENT_PATH = r"D:\ziniao\ziniao.exe"
ZINIAO_PORT = 8848
ZINIAO_COMPANY = "banbantt"
ZINIAO_USERNAME = "Abanbantt"
ZINIAO_PASSWORD = "~Abanbantt"
TEST_EXCEL = "data/input/test_products.xlsx"

def main():
    print("\n" + "="*70)
    print(" 紫鸟RPA - 自动化上传测试")
    print("="*70 + "\n")

    # === 步骤1: 读取Excel数据 ===
    print("[步骤 1/7] 读取商品数据...")
    print("-" * 70)

    reader = ExcelReader(TEST_EXCEL)
    if not reader.load():
        print("[ERROR] Excel数据加载失败")
        return

    products = reader.get_products()
    print(f"[OK] 成功读取 {len(products)} 个商品")

    # 显示商品信息
    for i, product in enumerate(products, 1):
        title = product.get('title', '')[:50]
        print(f"  {i}. {title}...")
        print(f"     品牌: {product.get('brand', 'N/A')}")
        print(f"     价格: {product.get('price', 'N/A')}")
        print(f"     SKU: {product.get('sku', 'N/A')}")

    # === 步骤2: 启动紫鸟浏览器 ===
    print("\n[步骤 2/7] 启动紫鸟浏览器...")
    print("-" * 70)

    manager = ZiniaoManager(ZINIAO_CLIENT_PATH, ZINIAO_PORT)
    if not manager.start_client():
        print("[ERROR] 紫鸟浏览器启动失败")
        return

    print("[OK] 紫鸟浏览器启动成功")

    try:
        # === 步骤3: 登录账号 ===
        print("\n[步骤 3/7] 登录紫鸟账号...")
        print("-" * 70)

        if not manager.login(ZINIAO_COMPANY, ZINIAO_USERNAME, ZINIAO_PASSWORD):
            print("[ERROR] 登录失败")
            return

        print("[OK] 登录成功")

        # === 步骤4: 获取店铺列表 ===
        print("\n[步骤 4/7] 获取店铺列表...")
        print("-" * 70)

        browsers = manager.get_browser_list()
        if not browsers:
            print("[ERROR] 没有可用的店铺")
            return

        print(f"[OK] 找到 {len(browsers)} 个店铺")
        for idx, browser in enumerate(browsers, 1):
            browser_name = browser.get('browserName') or browser.get('name') or '未命名'
            print(f"  {idx}. {browser_name}")

        # === 步骤5: 启动店铺浏览器 ===
        print("\n[步骤 5/7] 启动店铺浏览器...")
        print("-" * 70)

        browser_oauth = browsers[0].get('browserOauth')
        browser_info = manager.start_browser(browser_oauth)

        if not browser_info:
            print("[ERROR] 启动店铺浏览器失败")
            return

        browser_name = browser_info.get('browserName', '未知店铺')
        debug_port = browser_info.get('debuggingPort')

        print(f"[OK] 店铺浏览器启动成功")
        print(f"     店铺名称: {browser_name}")
        print(f"     调试端口: {debug_port}")

        # === 步骤6: 创建WebDriver并打开店铺页面 ===
        print("\n[步骤 6/7] 创建Selenium WebDriver...")
        print("-" * 70)

        # 指定ChromeDriver路径(使用绝对路径)
        import os
        chromedriver_path = os.path.abspath("drivers/chromedriver137.exe")
        print(f"[INFO] ChromeDriver路径: {chromedriver_path}")
        driver = manager.create_webdriver(browser_info, chromedriver_path)
        if not driver:
            print("[ERROR] 创建WebDriver失败")
            return

        print("[OK] WebDriver创建成功")
        print(f"     当前URL: {driver.current_url}")

        # 导航到店铺页面
        launcher_page = browser_info.get('launcherPage')
        if launcher_page:
            print(f"\n[INFO] 导航到店铺主页...")
            driver.get(launcher_page)
            time.sleep(3)
            print(f"[OK] 已打开店铺页面")
            print(f"     当前URL: {driver.current_url}")
            print(f"     页面标题: {driver.title}")
        else:
            print("[WARN] 未找到店铺主页URL,保持在 about:blank")

        # === 步骤7: 测试自动化流程 ===
        print("\n[步骤 7/7] 测试自动化操作...")
        print("-" * 70)

        print("\n📋 准备上传的商品:")
        print("-" * 70)
        for i, product in enumerate(products, 1):
            print(f"\n商品 {i}:")
            print(f"  标题: {product.get('title', 'N/A')[:60]}...")
            print(f"  品牌: {product.get('brand', 'N/A')}")
            print(f"  制造商: {product.get('manufacturer', 'N/A')}")
            print(f"  分类: {product.get('category', 'N/A')[:40]}...")
            print(f"  价格: ¥{product.get('price', 'N/A')}")
            print(f"  库存: {product.get('quantity', 'N/A')}")
            print(f"  SKU: {product.get('sku', 'N/A')}")

        print("\n" + "="*70)
        print("⚠️  重要提示:")
        print("="*70)
        print("1. 浏览器窗口已打开,你可以看到店铺环境")
        print("2. Excel数据已成功读取")
        print("3. 接下来需要:")
        print("   - 在实际的亚马逊页面上测试元素定位")
        print("   - 调整 amazon_uploader.py 中的选择器")
        print("   - 手动测试填写一个商品")
        print("4. 当前这是一个框架测试,确认所有组件都正常工作")

        print("\n💡 下一步行动:")
        print("-" * 70)
        print("1. 在浏览器中手动导航到'添加新商品'页面")
        print("2. 打开F12开发者工具")
        print("3. 找到各个输入框的正确选择器")
        print("4. 更新 amazon_uploader.py 中的定位器")
        print("5. 重新运行完整的自动化上传")

        # 保持浏览器打开
        print("\n" + "="*70)
        print("🔄 浏览器将保持打开状态,供你手动测试...")
        print("   按 Ctrl+C 退出程序")
        print("="*70 + "\n")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n[INFO] 用户中断,正在关闭...")

        # 清理
        print("\n[INFO] 关闭浏览器...")
        driver.quit()

        print("[INFO] 停止店铺浏览器...")
        manager.stop_browser(browser_oauth)

    finally:
        print("[INFO] 关闭紫鸟客户端...")
        manager.shutdown()

    print("\n" + "="*70)
    print("✅ 测试完成!")
    print("="*70)
    print("\n测试结果总结:")
    print("  ✅ Excel数据读取 - 成功")
    print("  ✅ 紫鸟浏览器启动 - 成功")
    print("  ✅ 账号登录 - 成功")
    print("  ✅ 获取店铺列表 - 成功")
    print("  ✅ 启动店铺浏览器 - 成功")
    print("  ✅ 创建WebDriver - 成功")
    print("  ✅ 打开店铺页面 - 成功")
    print("\n下一步: 调整亚马逊页面元素定位器,实现真正的自动上传")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
