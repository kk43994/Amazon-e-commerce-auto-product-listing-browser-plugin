"""
紫鸟浏览器连接测试脚本
功能：验证能否成功启动和控制紫鸟浏览器

使用前请先配置以下参数：
1. 紫鸟浏览器安装路径
2. 紫鸟账号信息
3. ChromeDriver路径
"""

import subprocess
import platform
import time
import requests
import json
import uuid

# ============== 配置区域（请根据实际情况修改） ==============

# 1. 紫鸟浏览器配置
ZINIAO_CLIENT_PATH = r"D:\ziniao\ziniao.exe"  # 紫鸟浏览器路径（已配置）
# Mac路径示例: "/Applications/SuperBrowser.app/Contents/MacOS/SuperBrowser"

ZINIAO_PORT = 8848  # 通信端口，可以自定义

# 2. 紫鸟账号信息（测试账号 - 已配置）
ZINIAO_COMPANY = "banbantt"        # 公司名称
ZINIAO_USERNAME = "Abanbantt"      # 用户名
ZINIAO_PASSWORD = "~Abanbantt"     # 登陆密码

# 3. ChromeDriver 路径（可选，如果要测试Selenium连接）
CHROMEDRIVER_PATH = r"C:\Tools\chromedriver.exe"
TEST_SELENIUM = False  # 是否测试Selenium连接

# ============== 测试脚本开始 ==============

class Colors:
    """终端颜色输出"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}[OK] {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}[ERROR] {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}[INFO] {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}[WARN] {msg}{Colors.END}")

def print_separator():
    print("\n" + "="*60 + "\n")

# ====== 步骤1: 启动紫鸟浏览器 ======

def start_ziniao_browser():
    """启动紫鸟浏览器（WebDriver模式）"""
    print_separator()
    print("步骤 1/5: 启动紫鸟浏览器")
    print_separator()

    is_windows = platform.system() == 'Windows'
    is_mac = platform.system() == 'Darwin'

    print_info(f"操作系统: {platform.system()}")
    print_info(f"客户端路径: {ZINIAO_CLIENT_PATH}")
    print_info(f"通信端口: {ZINIAO_PORT}")

    try:
        if is_windows:
            cmd = [
                ZINIAO_CLIENT_PATH,
                '--run_type=web_driver',
                '--ipc_type=http',
                '--port=' + str(ZINIAO_PORT)
            ]
        elif is_mac:
            cmd = [
                'open', '-a', ZINIAO_CLIENT_PATH, '--args',
                '--run_type=web_driver',
                '--ipc_type=http',
                '--port=' + str(ZINIAO_PORT)
            ]
        else:
            print_error("不支持的操作系统")
            return False

        print_info("执行命令: " + ' '.join(cmd))
        subprocess.Popen(cmd)

        print_info("等待5秒让浏览器启动...")
        time.sleep(5)

        print_success("紫鸟浏览器启动命令已执行")
        return True

    except FileNotFoundError:
        print_error(f"未找到紫鸟浏览器: {ZINIAO_CLIENT_PATH}")
        print_warning("请检查 ZINIAO_CLIENT_PATH 配置是否正确")
        return False
    except Exception as e:
        print_error(f"启动失败: {e}")
        return False

# ====== 步骤2: 测试HTTP连接 ======

def test_http_connection():
    """测试HTTP连接"""
    print_separator()
    print("步骤 2/5: 测试HTTP连接")
    print_separator()

    url = f"http://127.0.0.1:{ZINIAO_PORT}"
    print_info(f"目标地址: {url}")

    # 尝试多次连接（因为浏览器可能还在启动中）
    for attempt in range(5):
        try:
            print_info(f"尝试连接 ({attempt + 1}/5)...")
            response = requests.post(
                url,
                json={"action": "ping", "requestId": str(uuid.uuid4())},
                timeout=5
            )
            print_success("HTTP连接成功！")
            print_info(f"响应状态码: {response.status_code}")
            return True
        except requests.exceptions.ConnectionError:
            if attempt < 4:
                print_warning(f"连接失败，2秒后重试...")
                time.sleep(2)
            else:
                print_error("无法连接到紫鸟浏览器")
                print_warning("可能原因：")
                print_warning("1. 浏览器未启动成功")
                print_warning("2. 端口号配置错误")
                print_warning("3. 防火墙阻止连接")
                return False
        except Exception as e:
            print_error(f"连接异常: {e}")
            return False

# ====== 步骤3: 登录验证 ======

def test_login():
    """测试登录功能"""
    print_separator()
    print("步骤 3/5: 登录紫鸟账号")
    print_separator()

    url = f"http://127.0.0.1:{ZINIAO_PORT}"

    # 检查配置
    if ZINIAO_COMPANY == "你的公司名" or ZINIAO_USERNAME == "你的用户名":
        print_warning("检测到默认配置，跳过登录测试")
        print_info("请在脚本顶部配置你的紫鸟账号信息")
        return None

    data = {
        "action": "applyAuth",
        "requestId": str(uuid.uuid4()),
        "company": ZINIAO_COMPANY,
        "username": ZINIAO_USERNAME,
        "password": ZINIAO_PASSWORD
    }

    print_info(f"公司: {ZINIAO_COMPANY}")
    print_info(f"用户名: {ZINIAO_USERNAME}")
    print_info(f"密码: {'*' * len(ZINIAO_PASSWORD)}")

    try:
        response = requests.post(url, json=data, timeout=120)
        result = response.json()

        print_info(f"响应: {json.dumps(result, ensure_ascii=False, indent=2)}")

        if result.get('statusCode') == 0:
            print_success("登录成功！")
            return True
        else:
            error_msg = result.get('err', '未知错误')
            print_error(f"登录失败: {error_msg}")

            # 根据错误码给出提示
            status_code = result.get('statusCode')
            if status_code == -10004:
                print_warning("可能是账号或密码错误")

            return False

    except Exception as e:
        print_error(f"登录请求异常: {e}")
        return False

# ====== 步骤4: 获取店铺列表 ======

def test_get_browsers():
    """测试获取店铺列表"""
    print_separator()
    print("步骤 4/5: 获取店铺列表")
    print_separator()

    url = f"http://127.0.0.1:{ZINIAO_PORT}"

    # 根据官方文档,需要传递认证信息
    data = {
        "action": "getBrowserList",
        "requestId": str(uuid.uuid4()),
        "company": ZINIAO_COMPANY,
        "username": ZINIAO_USERNAME,
        "password": ZINIAO_PASSWORD
    }

    try:
        response = requests.post(url, json=data, timeout=120)
        result = response.json()

        if result.get('statusCode') == 0:
            # 官方返回格式: browserList (直接在result中)
            browsers = result.get('browserList', [])
            print_success(f"获取到 {len(browsers)} 个店铺")

            if browsers:
                print_info("\n店铺列表:")
                for idx, browser in enumerate(browsers[:5], 1):  # 只显示前5个
                    print(f"\n  店铺 {idx}:")
                    print(f"    - ID: {browser.get('browserOauth', 'N/A')}")
                    print(f"    - 名称: {browser.get('name', '未命名')}")
                    print(f"    - 平台: {browser.get('platform', '未知')}")
                    print(f"    - 备注: {browser.get('remark', '无')}")

                if len(browsers) > 5:
                    print(f"\n  ... 还有 {len(browsers) - 5} 个店铺")

                return browsers
            else:
                print_warning("账号下没有店铺")
                return []
        else:
            error_msg = result.get('err', '未知错误')
            print_error(f"获取店铺列表失败: {error_msg}")
            return None

    except Exception as e:
        print_error(f"请求异常: {e}")
        return None

# ====== 步骤5: 启动店铺浏览器 ======

def test_start_browser(browsers):
    """测试启动店铺浏览器"""
    print_separator()
    print("步骤 5/5: 启动店铺浏览器")
    print_separator()

    if not browsers:
        print_warning("没有可用的店铺，跳过此步骤")
        return None

    # 选择第一个店铺
    target_browser = browsers[0]
    browser_oauth = target_browser.get('browserOauth')
    browser_name = target_browser.get('name', '未命名')

    print_info(f"准备启动店铺: {browser_name}")
    print_info(f"店铺ID: {browser_oauth}")

    url = f"http://127.0.0.1:{ZINIAO_PORT}"

    # 根据官方文档,需要传递认证信息
    data = {
        "action": "startBrowser",
        "requestId": str(uuid.uuid4()),
        "browserOauth": browser_oauth,
        "company": ZINIAO_COMPANY,
        "username": ZINIAO_USERNAME,
        "password": ZINIAO_PASSWORD
    }

    try:
        print_info("发送启动请求...")
        response = requests.post(url, json=data, timeout=120)
        result = response.json()

        if result.get('statusCode') == 0:
            # 官方返回字段: debuggingPort (直接在result中,不在data中)
            debug_port = result.get('debuggingPort')

            print_success(f"店铺浏览器启动成功！")
            print_info(f"调试端口: {debug_port}")
            print_info(f"可以使用此端口连接Selenium WebDriver")

            # 等待浏览器窗口出现
            print_info("等待3秒让浏览器窗口完全加载...")
            time.sleep(3)

            return result
        else:
            error_msg = result.get('err', '未知错误')
            print_error(f"启动店铺浏览器失败: {error_msg}")
            return None

    except Exception as e:
        print_error(f"请求异常: {e}")
        return None

# ====== 可选: 测试Selenium连接 ======

def test_selenium_connection(debug_port):
    """测试Selenium WebDriver连接"""
    print_separator()
    print("可选步骤: 测试Selenium连接")
    print_separator()

    if not TEST_SELENIUM:
        print_warning("未启用Selenium测试，如需测试请设置 TEST_SELENIUM = True")
        return

    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service

        print_info("正在连接Selenium WebDriver...")

        chrome_options = Options()
        chrome_options.add_experimental_option(
            "debuggerAddress",
            f"127.0.0.1:{debug_port}"
        )

        service = Service(CHROMEDRIVER_PATH)
        driver = webdriver.Chrome(service=service, options=chrome_options)

        print_success("Selenium WebDriver 连接成功！")
        print_info(f"当前URL: {driver.current_url}")
        print_info(f"页面标题: {driver.title}")

        # 简单测试
        print_info("测试导航到百度...")
        driver.get("https://www.baidu.com")
        time.sleep(2)

        print_success("页面导航成功！")

        # 关闭
        driver.quit()
        print_success("Selenium测试完成")

    except ImportError:
        print_error("未安装Selenium，请运行: pip install selenium")
    except Exception as e:
        print_error(f"Selenium测试失败: {e}")

# ====== 主测试流程 ======

def main():
    """主测试流程"""
    print("\n")
    print("="*60)
    print("     紫鸟浏览器连接测试脚本")
    print("="*60)
    print("\n[注意] 测试前请确保:")
    print("  1. 紫鸟浏览器主进程已关闭")
    print("  2. 已配置正确的安装路径和账号信息")
    print("  3. 已申请开通WebDriver权限")
    print("\n开始测试...")

    # 步骤1: 启动浏览器
    if not start_ziniao_browser():
        print_error("测试中断：无法启动紫鸟浏览器")
        return

    # 步骤2: 测试HTTP连接
    if not test_http_connection():
        print_error("测试中断：无法建立HTTP连接")
        return

    # 步骤3: 登录测试
    login_result = test_login()
    if login_result is False:  # None表示跳过，False表示失败
        print_error("测试中断：登录失败")
        return

    # 步骤4: 获取店铺列表
    browsers = test_get_browsers()
    if browsers is None:  # None表示失败，[]表示空列表
        print_error("测试中断：无法获取店铺列表")
        return

    # 步骤5: 启动店铺浏览器
    browser_info = test_start_browser(browsers)

    # 可选: Selenium测试
    if browser_info and TEST_SELENIUM:
        debug_port = browser_info.get('debugPort')
        if debug_port:
            test_selenium_connection(debug_port)

    # 测试总结
    print_separator()
    print("📊 测试总结")
    print_separator()

    print_success("基础连接测试通过")
    if login_result:
        print_success("账号登录测试通过")
    if browsers:
        print_success(f"成功获取 {len(browsers)} 个店铺")
    if browser_info:
        print_success("店铺浏览器启动成功")

    print("\n[SUCCESS] 恭喜！紫鸟浏览器连接测试全部通过！")
    print("接下来可以开始开发RPA自动化功能了。\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[WARN] 测试被用户中断")
    except Exception as e:
        print_error(f"测试过程中出现异常: {e}")
        import traceback
        traceback.print_exc()
