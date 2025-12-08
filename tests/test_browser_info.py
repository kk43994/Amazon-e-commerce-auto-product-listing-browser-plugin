"""
测试查看 startBrowser 返回的完整信息
"""
import requests
import json
import uuid
import time
import subprocess

# 配置
ZINIAO_CLIENT_PATH = r"D:\ziniao\ziniao.exe"
ZINIAO_PORT = 8848
ZINIAO_COMPANY = "banbantt"
ZINIAO_USERNAME = "Abanbantt"
ZINIAO_PASSWORD = "~Abanbantt"

def send_http(data):
    try:
        url = f'http://127.0.0.1:{ZINIAO_PORT}'
        response = requests.post(url, json=data, timeout=120)
        return response.json()
    except Exception as e:
        print(f"[ERROR] {e}")
        return None

# 1. 关闭现有进程
print("[INFO] 关闭现有进程...")
import os
os.system('taskkill /f /t /im ziniao.exe 2>nul')
time.sleep(2)

# 2. 启动浏览器
print("[INFO] 启动紫鸟浏览器...")
cmd = [ZINIAO_CLIENT_PATH, '--run_type=web_driver', '--ipc_type=http', '--port=' + str(ZINIAO_PORT)]
subprocess.Popen(cmd)
time.sleep(5)

# 3. 登录
print("[INFO] 登录...")
data = {
    "action": "applyAuth",
    "requestId": str(uuid.uuid4()),
    "company": ZINIAO_COMPANY,
    "username": ZINIAO_USERNAME,
    "password": ZINIAO_PASSWORD
}
result = send_http(data)
if result.get('statusCode') != 0:
    print(f"[ERROR] 登录失败: {result}")
    exit()
print("[OK] 登录成功")

# 4. 获取店铺列表
print("[INFO] 获取店铺列表...")
data = {
    "action": "getBrowserList",
    "requestId": str(uuid.uuid4()),
    "company": ZINIAO_COMPANY,
    "username": ZINIAO_USERNAME,
    "password": ZINIAO_PASSWORD
}
result = send_http(data)
browsers = result.get('browserList', [])
print(f"[OK] 获取到 {len(browsers)} 个店铺")

# 打印完整店铺信息
print("\n" + "="*60)
print("完整店铺信息:")
print("="*60)
for idx, browser in enumerate(browsers, 1):
    print(f"\n店铺 {idx}:")
    for key, value in browser.items():
        print(f"  {key}: {value}")
print("="*60)

# 5. 启动第一个店铺
if browsers:
    print(f"\n[INFO] 启动第一个店铺...")
    browser_oauth = browsers[0].get('browserOauth')

    data = {
        "action": "startBrowser",
        "requestId": str(uuid.uuid4()),
        "browserOauth": browser_oauth,
        "company": ZINIAO_COMPANY,
        "username": ZINIAO_USERNAME,
        "password": ZINIAO_PASSWORD
    }

    result = send_http(data)

    print("\n" + "="*60)
    print("startBrowser 完整返回信息:")
    print("="*60)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("="*60)

    # 检查关键字段
    print("\n" + "="*60)
    print("关键字段提取:")
    print("="*60)
    print(f"debuggingPort: {result.get('debuggingPort')}")
    print(f"ipDetectionPage: {result.get('ipDetectionPage')}")
    print(f"launcherPage: {result.get('launcherPage')}")
    print(f"browserName: {result.get('browserName')}")
    print(f"browserOauth: {result.get('browserOauth')}")
    print(f"core_type: {result.get('core_type')}")
    print(f"core_version: {result.get('core_version')}")
    print("="*60)

print("\n[INFO] 测试完成!")
print("[INFO] 请检查打开的浏览器窗口")
print("[INFO] 按Ctrl+C退出")

# 保持运行
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n[INFO] 退出...")
