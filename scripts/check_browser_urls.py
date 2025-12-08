"""
检查 startBrowser 返回的所有URL字段
"""
import sys
import os
import time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager

ZINIAO_CLIENT_PATH = r"D:\ziniao\ziniao.exe"
ZINIAO_PORT = 8848
ZINIAO_COMPANY = "banbantt"
ZINIAO_USERNAME = "Abanbantt"
ZINIAO_PASSWORD = "~Abanbantt"

manager = ZiniaoManager(ZINIAO_CLIENT_PATH, ZINIAO_PORT)
manager.start_client()
manager.login(ZINIAO_COMPANY, ZINIAO_USERNAME, ZINIAO_PASSWORD)

browsers = manager.get_browser_list()
browser_oauth = browsers[0].get('browserOauth')

print("\n" + "="*70)
print("启动店铺浏览器并查看所有返回字段")
print("="*70 + "\n")

browser_info = manager.start_browser(browser_oauth)

print("返回的所有字段:")
print("-"*70)
for key, value in browser_info.items():
    if key not in ['requestId']:
        print(f"{key}: {value}")

print("\n" + "="*70)
print("关键URL字段分析:")
print("="*70)

# 检查所有可能包含URL的字段
url_fields = {}
for key, value in browser_info.items():
    if isinstance(value, str) and ('http' in value.lower() or 'www' in value.lower()):
        url_fields[key] = value

print("\n包含URL的字段:")
for key, url in url_fields.items():
    print(f"\n{key}:")
    print(f"  {url}")

print("\n" + "="*70)
print("建议:")
print("="*70)
print("1. 如果 launcherPage 是登录页,可能需要先在紫鸟环境中手动登录一次")
print("2. 或者应该等待店铺环境自动登录完成")
print("3. 或者应该不导航到任何页面,让紫鸟自己打开默认页面")
print("="*70)

# 不要quit,保持浏览器打开
print("\n浏览器保持打开,请查看窗口...")
print("按 Ctrl+C 退出")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n退出...")
    manager.shutdown()
