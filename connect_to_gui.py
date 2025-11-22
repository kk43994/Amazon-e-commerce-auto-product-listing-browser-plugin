"""
连接到手动打开的紫鸟GUI环境

使用步骤:
1. 手动双击打开 D:\\ziniao\\ziniao.exe (不要用命令行!)
2. 登录你的账号
3. 点击打开"小昭 日本0-1"环境
4. 等待环境完全加载(应该自动登录到亚马逊后台)
5. 运行此脚本连接到已打开的浏览器
"""
import sys
import os
import time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

import requests
import uuid
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

# 紫鸟GUI默认也会监听HTTP端口
ZINIAO_PORT = 8848
BASE_URL = f"http://127.0.0.1:{ZINIAO_PORT}"

def get_running_browsers():
    """获取正在运行的浏览器列表"""
    print("[INFO] 查询正在运行的浏览器...")

    data = {
        "action": "getRunningInfo",
        "requestId": str(uuid.uuid4())
    }

    try:
        response = requests.post(BASE_URL, json=data, timeout=10)
        result = response.json()

        if result.get('statusCode') == 0:
            running_list = result.get('runningList', [])
            print(f"[OK] 找到 {len(running_list)} 个正在运行的浏览器")
            return running_list
        else:
            print(f"[ERROR] 查询失败: {result.get('err')}")
            return None
    except Exception as e:
        print(f"[ERROR] 连接失败: {e}")
        print("\n请确保:")
        print("  1. 紫鸟GUI已经打开")
        print("  2. 已经在GUI中点击打开了店铺环境")
        return None

def main():
    print("=" * 70)
    print(" 连接到手动打开的紫鸟GUI环境")
    print("=" * 70)

    # 获取运行中的浏览器
    running_browsers = get_running_browsers()

    if not running_browsers:
        print("\n[ERROR] 没有找到运行中的浏览器!")
        print("\n请按照以下步骤操作:")
        print("  1. 双击打开 D:\\ziniao\\ziniao.exe")
        print("  2. 登录你的紫鸟账号 (banbantt)")
        print("  3. 找到'小昭 日本0-1'环境")
        print("  4. 点击'打开'按钮")
        print("  5. 等待浏览器窗口出现并完全加载")
        print("  6. 再次运行此脚本")
        return

    # 显示所有运行中的浏览器
    print("\n" + "=" * 70)
    print("正在运行的浏览器:")
    print("=" * 70)
    for idx, browser in enumerate(running_browsers, 1):
        name = browser.get('browserName', '未命名')
        debug_port = browser.get('debuggingPort', 'N/A')
        browser_oauth = browser.get('browserOauth', 'N/A')
        print(f"{idx}. {name}")
        print(f"   调试端口: {debug_port}")
        print(f"   ID: {browser_oauth}")
        print()

    # 使用第一个浏览器
    target_browser = running_browsers[0]
    debug_port = target_browser.get('debuggingPort')
    name = target_browser.get('browserName', '未命名')

    if not debug_port:
        print("[ERROR] 无法获取调试端口!")
        return

    print(f"[INFO] 准备连接到: {name} (端口 {debug_port})")

    # 创建WebDriver连接
    print("[INFO] 创建Selenium WebDriver连接...")
    try:
        chrome_options = Options()
        chrome_options.add_experimental_option("debuggerAddress", f"127.0.0.1:{debug_port}")

        driver = webdriver.Chrome(
            service=Service(os.path.abspath("drivers/chromedriver137.exe")),
            options=chrome_options
        )

        print(f"[OK] 连接成功!")
        print(f"\n当前页面信息:")
        print(f"  URL: {driver.current_url}")
        print(f"  标题: {driver.title}")

        # 检查是否已经登录到亚马逊
        if "sellercentral" in driver.current_url:
            print(f"\n[OK] 已经进入亚马逊卖家中心!")
        elif "amazon.com" in driver.current_url:
            print(f"\n[WARN] 在亚马逊页面,但可能还没登录")
        else:
            print(f"\n[INFO] 当前不在亚马逊页面")

        # 保持连接
        print("\n" + "=" * 70)
        print("WebDriver已连接,浏览器保持打开")
        print("现在可以使用此driver进行自动化操作")
        print("按 Ctrl+C 退出")
        print("=" * 70 + "\n")

        # 这里可以添加你的自动化代码
        # 例如: 导航到添加商品页面, 填写表单等

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n[INFO] 用户中断,断开连接...")
            driver.quit()

    except Exception as e:
        print(f"[ERROR] 连接失败: {e}")

if __name__ == "__main__":
    main()
