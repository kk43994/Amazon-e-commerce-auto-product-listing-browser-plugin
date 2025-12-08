"""
快速测试 - 检查startBrowser的实际响应
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager
import json

manager = ZiniaoManager(r"D:\ziniao\ziniao.exe", 8848)

print("启动紫鸟...")
manager.start_client()

print("登录...")
manager.login("banbantt", "Abanbantt", "~Abanbantt")

print("获取店铺列表...")
browsers = manager.get_browser_list()
browser_oauth = browsers[0].get('browserOauth')
print(f"店铺ID: {browser_oauth}")

print("\n启动店铺浏览器(带Cookie)...")
browser_info = manager.start_browser(browser_oauth, load_cookie=True)

print("\n" + "="*70)
print("startBrowser 返回的完整数据:")
print("="*70)
print(json.dumps(browser_info, ensure_ascii=False, indent=2))
print("="*70)

# 检查关键字段
print("\n关键字段:")
print(f"  debuggingPort: {browser_info.get('debuggingPort')}")
print(f"  launcherPage: {browser_info.get('launcherPage')}")
print(f"  ipDetectionPage: {browser_info.get('ipDetectionPage')}")
print(f"  browserName: {browser_info.get('browserName')}")

# 等待30秒让浏览器完全加载
print("\n等待30秒,让浏览器加载环境...")
import time
for i in range(30):
    time.sleep(1)
    print(f"  {i+1}/30", end='\r')

print("\n\n创建WebDriver连接...")
driver = manager.create_webdriver(browser_info, os.path.abspath("drivers/chromedriver137.exe"))

if driver:
    print(f"[OK] 已连接!")
    print(f"当前URL: {driver.current_url}")
    print(f"页面标题: {driver.title}")

    # 检查页面内容
    if driver.current_url in ["about:blank", "data:,"]:
        print("\n[WARN] 仍然是空白页!")
        print("尝试等待页面变化...")
        for i in range(20):
            time.sleep(1)
            if driver.current_url not in ["about:blank", "data:,"]:
                print(f"\n[OK] 页面已变化!")
                print(f"新URL: {driver.current_url}")
                break
            print(f"  {i+1}/20", end='\r')

    print("\n保持打开,按Ctrl+C退出...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        driver.quit()

manager.shutdown()
