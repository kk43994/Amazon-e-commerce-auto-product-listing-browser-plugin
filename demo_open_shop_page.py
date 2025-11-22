"""
演示: 正确打开店铺页面
展示如何从 about:blank 导航到实际的店铺环境
"""
import sys
import os
import time

# 添加src目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager

# 配置
ZINIAO_CLIENT_PATH = r"D:\ziniao\ziniao.exe"
ZINIAO_PORT = 8848
ZINIAO_COMPANY = "banbantt"
ZINIAO_USERNAME = "Abanbantt"
ZINIAO_PASSWORD = "~Abanbantt"

def main():
    print("\n" + "="*60)
    print("演示: 正确打开紫鸟店铺页面")
    print("="*60 + "\n")

    # 1. 创建管理器
    manager = ZiniaoManager(ZINIAO_CLIENT_PATH, ZINIAO_PORT)

    # 2. 启动客户端 (会自动关闭现有进程)
    print("[步骤 1/6] 启动紫鸟浏览器...")
    if not manager.start_client():
        print("[ERROR] 启动失败")
        return

    try:
        # 3. 登录
        print("[步骤 2/6] 登录账号...")
        if not manager.login(ZINIAO_COMPANY, ZINIAO_USERNAME, ZINIAO_PASSWORD):
            print("[ERROR] 登录失败")
            return

        # 4. 获取店铺列表
        print("[步骤 3/6] 获取店铺列表...")
        browsers = manager.get_browser_list()
        if not browsers:
            print("[ERROR] 没有可用的店铺")
            return

        print(f"\n找到 {len(browsers)} 个店铺:")
        for idx, browser in enumerate(browsers, 1):
            print(f"  {idx}. {browser.get('browserName', '未命名')} "
                  f"(ID: {browser.get('browserOauth', 'N/A')})")

        # 5. 启动第一个店铺
        print(f"\n[步骤 4/6] 启动店铺浏览器...")
        browser_oauth = browsers[0].get('browserOauth')
        browser_info = manager.start_browser(browser_oauth)

        if not browser_info:
            print("[ERROR] 启动失败")
            return

        print(f"[OK] 店铺浏览器已启动")

        # 打印返回的所有信息
        print("\n" + "="*60)
        print("店铺浏览器返回信息:")
        print("="*60)
        for key, value in browser_info.items():
            if key not in ['requestId', 'machine_common_string', 'new_maching_string']:
                print(f"  {key}: {value}")
        print("="*60 + "\n")

        # 6. 创建WebDriver
        print("[步骤 5/6] 创建Selenium WebDriver...")
        driver = manager.create_webdriver(browser_info)

        if not driver:
            print("[ERROR] 创建WebDriver失败")
            return

        print(f"[OK] WebDriver已创建")
        print(f"     当前页面: {driver.current_url}")  # 这里应该是 about:blank

        # 7. 导航到实际页面
        print("\n[步骤 6/6] 导航到店铺页面...\n")

        # 7.1 先检查IP (如果有IP检测页)
        ip_check_url = browser_info.get('ipDetectionPage')
        if ip_check_url:
            print(f"[INFO] 打开IP检测页...")
            print(f"       URL: {ip_check_url}")
            driver.get(ip_check_url)
            time.sleep(3)
            print(f"[OK] 当前页面: {driver.current_url}")
        else:
            print("[WARN] 未找到IP检测页URL")

        # 7.2 打开店铺主页
        launcher_page = browser_info.get('launcherPage')
        if launcher_page:
            print(f"\n[INFO] 打开店铺主页...")
            print(f"       URL: {launcher_page}")
            driver.get(launcher_page)
            time.sleep(3)
            print(f"[OK] 当前页面: {driver.current_url}")
            print(f"[OK] 页面标题: {driver.title}")
        else:
            print("[WARN] 未找到店铺主页URL")

        # 打印店铺名称
        browser_name = browser_info.get('browserName')
        if browser_name:
            print(f"\n" + "="*60)
            print(f"✅ 成功打开店铺: {browser_name}")
            print("="*60)
        else:
            print(f"\n" + "="*60)
            print(f"✅ 店铺浏览器已打开")
            print(f"   (店铺名称未在返回数据中,可能需要在页面上查看)")
            print("="*60)

        # 说明
        print(f"\n📌 说明:")
        print(f"   - 浏览器窗口现在应该显示店铺环境页面")
        print(f"   - 不再是 about:blank 空白页")
        print(f"   - 你可以在这个环境中进行自动化操作")
        print(f"   - 例如访问亚马逊卖家中心: driver.get('https://...')")

        # 保持运行,让用户查看浏览器
        print(f"\n" + "="*60)
        print("💡 浏览器将保持打开状态")
        print("   请查看浏览器窗口,确认是否显示了正确的店铺环境")
        print("   按 Ctrl+C 退出程序")
        print("="*60 + "\n")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n[INFO] 用户中断,正在关闭...")

        # 清理
        print("[INFO] 关闭浏览器...")
        driver.quit()

    finally:
        print("[INFO] 关闭紫鸟客户端...")
        manager.shutdown()

    print("\n[OK] 演示完成!\n")

if __name__ == "__main__":
    main()
