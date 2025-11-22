"""
测试: 启动后手动导航到launcherPage
"""
import sys
import os
import time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager

manager = ZiniaoManager(r"D:\ziniao\ziniao.exe", 8848)

print("启动紫鸟...")
manager.start_client()

print("登录...")
manager.login("banbantt", "Abanbantt", "~Abanbantt")

print("获取店铺...")
browsers = manager.get_browser_list()
browser_oauth = browsers[0].get('browserOauth')

print(f"\n启动店铺浏览器...")
browser_info = manager.start_browser(browser_oauth, load_cookie=True)

launcher_page = browser_info.get('launcherPage')
debug_port = browser_info.get('debuggingPort')

print(f"调试端口: {debug_port}")
print(f"launcherPage: {launcher_page}")

# 等待5秒让浏览器完全启动
print("\n等待浏览器启动...")
time.sleep(5)

print("\n创建WebDriver连接...")
driver = manager.create_webdriver(browser_info, os.path.abspath("drivers/chromedriver137.exe"))

print(f"\n连接后当前URL: {driver.current_url}")

# 如果是空白页,导航到launcherPage
if driver.current_url in ["about:blank", "data:,"]:
    print(f"\n检测到空白页,导航到 launcherPage...")
    driver.get(launcher_page)

    # 等待页面加载
    print("等待页面加载...")
    time.sleep(5)

    print(f"\n导航后URL: {driver.current_url}")
    print(f"页面标题: {driver.title}")

# 保持打开
print("\n浏览器保持打开,按Ctrl+C退出...")
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n退出...")
    driver.quit()
    manager.stop_browser(browser_oauth)

manager.shutdown()
