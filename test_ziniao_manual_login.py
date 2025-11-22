"""
紫鸟浏览器手动登录测试脚本
功能：启动浏览器后等待手动登录，然后测试API连接
"""

import subprocess
import platform
import time
import requests
import json
import uuid

# ============== 配置区域 ==============

ZINIAO_CLIENT_PATH = r"D:\ziniao\ziniao.exe"
ZINIAO_PORT = 8848

# ============== 辅助函数 ==============

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}[OK] {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}[ERROR] {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}[INFO] {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}[WARN] {msg}{Colors.END}")

def print_step(msg):
    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}{msg}{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}\n")

# ============== 主要函数 ==============

def check_if_running():
    """检查紫鸟浏览器是否已经在运行"""
    try:
        response = requests.post(
            f"http://127.0.0.1:{ZINIAO_PORT}",
            json={"action": "ping", "requestId": str(uuid.uuid4())},
            timeout=2
        )
        return True
    except:
        return False

def start_ziniao_browser():
    """启动紫鸟浏览器"""
    print_step("步骤 1/4: 启动紫鸟浏览器")

    # 检查是否已经在运行
    if check_if_running():
        print_warning("检测到紫鸟浏览器已在运行")
        print_info("将直接使用现有进程")
        return True

    print_info(f"客户端路径: {ZINIAO_CLIENT_PATH}")
    print_info(f"通信端口: {ZINIAO_PORT}")

    try:
        cmd = [
            ZINIAO_CLIENT_PATH,
            '--run_type=web_driver',
            '--ipc_type=http',
            '--port=' + str(ZINIAO_PORT)
        ]

        print_info("执行命令: " + ' '.join(cmd))
        subprocess.Popen(cmd)

        print_success("紫鸟浏览器启动命令已执行")
        return True

    except FileNotFoundError:
        print_error(f"未找到紫鸟浏览器: {ZINIAO_CLIENT_PATH}")
        return False
    except Exception as e:
        print_error(f"启动失败: {e}")
        return False

def wait_for_manual_login():
    """等待用户手动登录"""
    print_step("步骤 2/4: 手动登录")

    print_warning("请在紫鸟浏览器窗口中:")
    print("  1. 点击登录按钮")
    print("  2. 等待登录成功")
    print()
    print_info("登录完成后,按 Enter 键继续...")

    input()
    print_success("收到确认,继续测试...")

def test_api_connection():
    """测试API连接"""
    print_step("步骤 3/4: 测试API连接")

    url = f"http://127.0.0.1:{ZINIAO_PORT}"

    # 测试获取店铺列表
    print_info("正在获取店铺列表...")

    data = {
        "action": "getBrowserList",
        "requestId": str(uuid.uuid4())
    }

    try:
        response = requests.post(url, json=data, timeout=30)
        result = response.json()

        print_info(f"响应状态码: {response.status_code}")

        if result.get('statusCode') == 0:
            browsers = result.get('data', {}).get('list', [])
            print_success(f"成功获取到 {len(browsers)} 个店铺!")

            if browsers:
                print_info("\n店铺列表:")
                for idx, browser in enumerate(browsers[:3], 1):
                    print(f"  {idx}. {browser.get('name', '未命名')} "
                          f"({browser.get('platform', '未知平台')})")

                if len(browsers) > 3:
                    print(f"  ... 还有 {len(browsers) - 3} 个店铺")

                return browsers
            else:
                print_warning("账号下没有店铺")
                return []
        else:
            error_msg = result.get('err', '未知错误')
            print_error(f"API调用失败: {error_msg}")
            print_info(f"完整响应: {json.dumps(result, ensure_ascii=False, indent=2)}")
            return None

    except requests.exceptions.ConnectionError:
        print_error("无法连接到紫鸟浏览器API")
        print_warning("可能原因:")
        print_warning("  1. 浏览器未成功启动")
        print_warning("  2. 登录未完成")
        print_warning("  3. 端口被占用")
        return None
    except Exception as e:
        print_error(f"请求异常: {e}")
        return None

def test_start_browser(browsers):
    """测试启动店铺浏览器"""
    print_step("步骤 4/4: 启动店铺浏览器")

    if not browsers:
        print_warning("没有可用的店铺,跳过此步骤")
        return None

    target_browser = browsers[0]
    browser_oauth = target_browser.get('browserOauth')
    browser_name = target_browser.get('name', '未命名')

    print_info(f"准备启动店铺: {browser_name}")
    print_info(f"店铺ID: {browser_oauth}")

    url = f"http://127.0.0.1:{ZINIAO_PORT}"

    data = {
        "action": "startBrowser",
        "requestId": str(uuid.uuid4()),
        "browserOauth": browser_oauth
    }

    try:
        print_info("发送启动请求...")
        response = requests.post(url, json=data, timeout=120)
        result = response.json()

        if result.get('statusCode') == 0:
            browser_info = result.get('data', {})
            debug_port = browser_info.get('debugPort')

            print_success("店铺浏览器启动成功!")
            print_info(f"调试端口: {debug_port}")
            print_info("现在可以使用Selenium WebDriver连接到这个端口")
            print_info(f"连接地址: 127.0.0.1:{debug_port}")

            return browser_info
        else:
            error_msg = result.get('err', '未知错误')
            print_error(f"启动失败: {error_msg}")
            print_info(f"完整响应: {json.dumps(result, ensure_ascii=False, indent=2)}")
            return None

    except Exception as e:
        print_error(f"请求异常: {e}")
        return None

def print_summary(success_steps):
    """打印测试总结"""
    print_step("测试总结")

    total = len(success_steps)

    for step, success in success_steps.items():
        if success:
            print_success(step)
        else:
            print_error(step)

    print()

    if all(success_steps.values()):
        print(f"{Colors.GREEN}")
        print("="*60)
        print(" 恭喜! 紫鸟浏览器测试全部通过!")
        print(" 接下来可以开始开发RPA自动化功能了")
        print("="*60)
        print(f"{Colors.END}\n")
    else:
        print(f"{Colors.YELLOW}")
        print("部分测试未通过,请根据上面的错误信息排查问题")
        print(f"{Colors.END}\n")

# ============== 主程序 ==============

def main():
    print("\n")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}     紫鸟浏览器手动登录测试脚本{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print()

    success_steps = {}

    # 步骤1: 启动浏览器
    if not start_ziniao_browser():
        print_error("测试中断: 无法启动紫鸟浏览器")
        return
    success_steps["浏览器启动"] = True

    # 步骤2: 等待手动登录
    wait_for_manual_login()
    success_steps["手动登录"] = True

    # 步骤3: 测试API连接
    browsers = test_api_connection()
    success_steps["API连接"] = browsers is not None

    if browsers is None:
        print_error("测试中断: API连接失败")
        print_summary(success_steps)
        return

    # 步骤4: 启动店铺浏览器
    if browsers:
        browser_info = test_start_browser(browsers)
        success_steps["启动店铺浏览器"] = browser_info is not None
    else:
        success_steps["启动店铺浏览器"] = False

    # 打印总结
    print_summary(success_steps)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}[WARN] 测试被用户中断{Colors.END}")
    except Exception as e:
        print_error(f"测试过程中出现异常: {e}")
        import traceback
        traceback.print_exc()
