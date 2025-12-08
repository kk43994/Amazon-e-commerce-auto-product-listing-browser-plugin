"""
最简单的测试 - 只看startBrowser返回了什么
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

print("获取店铺...")
browsers = manager.get_browser_list()
browser_oauth = browsers[0].get('browserOauth')

print(f"\n启动店铺浏览器: {browser_oauth}")
browser_info = manager.start_browser(browser_oauth, load_cookie=True)

print("\n=== startBrowser 返回的数据 ===")
print(json.dumps(browser_info, ensure_ascii=False, indent=2))

print(f"\n\n调试端口: {browser_info.get('debuggingPort')}")
print(f"launcherPage: {browser_info.get('launcherPage', 'N/A')[:100]}")

manager.shutdown()
