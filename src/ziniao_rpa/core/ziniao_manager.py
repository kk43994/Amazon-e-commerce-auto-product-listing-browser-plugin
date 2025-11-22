"""
紫鸟浏览器管理器
负责与紫鸟浏览器主进程通信和管理店铺浏览器
"""

import subprocess
import platform
import time
import requests
import json
import uuid
from typing import Optional, Dict, List
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service


class ZiniaoManager:
    """紫鸟浏览器管理器"""

    def __init__(self, client_path: str, port: int = 8848):
        """
        初始化紫鸟浏览器管理器

        Args:
            client_path: 紫鸟浏览器可执行文件路径
            port: HTTP通信端口,默认8848
        """
        self.client_path = client_path
        self.port = port
        self.base_url = f"http://127.0.0.1:{port}"
        self.is_running = False
        self.process = None
        # 存储认证信息,用于后续API调用
        self.company = None
        self.username = None
        self.password = None

    def start_client(self) -> bool:
        """
        启动紫鸟浏览器客户端(WebDriver模式)

        Returns:
            bool: 启动是否成功
        """
        # 先关闭已存在的进程(关键!防止进程冲突)
        print("[INFO] 检查并关闭现有紫鸟浏览器进程...")
        import os
        os.system('taskkill /f /t /im ziniao.exe 2>nul')
        time.sleep(2)  # 等待进程完全关闭

        # 检查是否已经在运行
        if self._check_connection():
            print("[INFO] 紫鸟浏览器已在运行")
            self.is_running = True
            return True

        try:
            # 构建启动命令
            cmd = [
                self.client_path,
                '--run_type=web_driver',
                '--ipc_type=http',
                f'--port={self.port}'
            ]

            print(f"[INFO] 启动紫鸟浏览器: {' '.join(cmd)}")

            # 启动进程
            self.process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

            # 等待启动
            print("[INFO] 等待浏览器启动...")
            time.sleep(5)

            # 验证连接
            for i in range(10):
                if self._check_connection():
                    print("[OK] 紫鸟浏览器启动成功")
                    self.is_running = True
                    return True
                time.sleep(2)
                print(f"[INFO] 等待连接... ({i+1}/10)")

            print("[ERROR] 无法连接到紫鸟浏览器")
            return False

        except Exception as e:
            print(f"[ERROR] 启动失败: {e}")
            return False

    def _check_connection(self) -> bool:
        """
        检查与紫鸟浏览器的连接

        Returns:
            bool: 是否可以连接
        """
        try:
            response = requests.post(
                self.base_url,
                json={"action": "ping", "requestId": str(uuid.uuid4())},
                timeout=2
            )
            return response.status_code == 200
        except:
            return False

    def login(self, company: str, username: str, password: str) -> bool:
        """
        登录紫鸟账号

        Args:
            company: 公司名称
            username: 用户名
            password: 密码

        Returns:
            bool: 登录是否成功
        """
        if not self.is_running:
            print("[ERROR] 紫鸟浏览器未运行")
            return False

        data = {
            "action": "applyAuth",
            "requestId": str(uuid.uuid4()),
            "company": company,
            "username": username,
            "password": password
        }

        try:
            print(f"[INFO] 正在登录: {company}/{username}")
            response = requests.post(self.base_url, json=data, timeout=120)
            result = response.json()

            if result.get('statusCode') == 0:
                print("[OK] 登录成功")
                # 保存认证信息供后续API使用
                self.company = company
                self.username = username
                self.password = password
                return True
            else:
                error_msg = result.get('err', '未知错误')
                print(f"[ERROR] 登录失败: {error_msg}")
                return False

        except Exception as e:
            print(f"[ERROR] 登录请求异常: {e}")
            return False

    def apply_auth(self, username: str, password: str, security_password: str = None,
                   company: str = "") -> bool:
        """
        登录紫鸟账号 (兼容方法)

        Args:
            username: 用户名
            password: 密码
            security_password: 安全密码 (可选,暂未使用)
            company: 公司名称 (可选,默认为空)

        Returns:
            bool: 登录是否成功
        """
        return self.login(company, username, password)

    def get_browser_list(self) -> Optional[List[Dict]]:
        """
        获取店铺浏览器列表

        Returns:
            Optional[List[Dict]]: 店铺列表,失败返回None
        """
        if not self.is_running:
            print("[ERROR] 紫鸟浏览器未运行")
            return None

        # 根据官方文档,需要传递认证信息
        data = {
            "action": "getBrowserList",
            "requestId": str(uuid.uuid4()),
            "company": self.company,
            "username": self.username,
            "password": self.password
        }

        try:
            response = requests.post(self.base_url, json=data, timeout=120)
            result = response.json()

            if result.get('statusCode') == 0:
                # 官方返回格式: browserList 而不是 data.list
                browsers = result.get('browserList', [])
                print(f"[OK] 获取到 {len(browsers)} 个店铺")
                return browsers
            else:
                error_msg = result.get('err', '未知错误')
                print(f"[ERROR] 获取店铺列表失败: {error_msg}")
                return None

        except Exception as e:
            print(f"[ERROR] 请求异常: {e}")
            return None

    def start_browser(self, browser_oauth: str = None, shop_id: str = None,
                     load_cookie: bool = True, chromedriver_path: str = None,
                     open_url: str = None) -> Optional[webdriver.Chrome]:
        """
        启动指定的店铺浏览器并返回WebDriver实例

        Args:
            browser_oauth: 店铺的唯一标识ID (优先使用)
            shop_id: 店铺ID (browser_oauth的别名,为了兼容)
            load_cookie: 是否加载已保存的Cookie (默认True,加载你在GUI中配置的环境)
            chromedriver_path: ChromeDriver路径 (可选)
            open_url: 启动后打开的URL (可选,如果提供则在启动后导航到此URL)

        Returns:
            Optional[webdriver.Chrome]: WebDriver实例,失败返回None
        """
        # 兼容两种参数名
        if shop_id and not browser_oauth:
            browser_oauth = shop_id

        if not browser_oauth:
            print("[ERROR] 必须提供 browser_oauth 或 shop_id 参数")
            return None

        # 先启动浏览器获取调试端口
        browser_info = self._start_browser_internal(browser_oauth, load_cookie, open_url)
        if not browser_info:
            return None

        # 等待浏览器窗口完全加载
        print("[INFO] 等待浏览器窗口加载...")
        time.sleep(3)

        # 然后创建WebDriver连接
        driver = self.create_webdriver(browser_info, chromedriver_path)

        # 如果指定了URL但当前不是该URL,则导航过去
        if driver and open_url:
            current_url = driver.current_url
            if current_url == "about:blank" or not current_url.startswith(open_url[:20]):
                print(f"[INFO] 导航到指定URL: {open_url}")
                driver.get(open_url)
                time.sleep(2)

        return driver

    def _start_browser_internal(self, browser_oauth: str, load_cookie: bool = True,
                               open_url: str = None) -> Optional[Dict]:
        """
        内部方法: 启动指定的店铺浏览器

        Args:
            browser_oauth: 店铺的唯一标识ID
            load_cookie: 是否加载已保存的Cookie (默认True,加载你在GUI中配置的环境)
            open_url: 启动时打开的URL (可选)

        Returns:
            Optional[Dict]: 浏览器信息(包含debuggingPort),失败返回None
        """
        if not self.is_running:
            print("[ERROR] 紫鸟浏览器未运行")
            return None

        # 根据官方文档,完整的参数列表
        data = {
            "action": "startBrowser",
            "requestId": str(uuid.uuid4()),
            "browserOauth": browser_oauth,
            "company": self.company,
            "username": self.username,
            "password": self.password,
            # 以下是关键参数,用于加载环境配置
            "isWaitPluginUpdate": 0,        # 不等待插件更新
            "isHeadless": 0,                # 不使用无头模式
            "isWebDriverReadOnlyMode": 0,   # 不使用只读模式
            "cookieTypeLoad": 1 if load_cookie else 0,  # 加载Cookie!
            "cookieTypeSave": 1,            # 保存Cookie
            "runMode": "1",                 # 运行模式
            "isLoadUserPlugin": False,      # 不加载用户插件
            "pluginIdType": 1,              # 插件ID类型
            "privacyMode": 0                # 不使用隐私模式
        }

        # 如果指定了打开URL,添加到参数中
        if open_url:
            data["openUrl"] = open_url
            print(f"[INFO] 将在启动时打开: {open_url}")

        try:
            print(f"[INFO] 正在启动店铺浏览器: {browser_oauth}")
            response = requests.post(self.base_url, json=data, timeout=120)
            result = response.json()

            if result.get('statusCode') == 0:
                # 官方返回的字段名是 debuggingPort 不是 debugPort
                debug_port = result.get('debuggingPort')
                print(f"[OK] 店铺浏览器启动成功, 调试端口: {debug_port}")
                return result  # 直接返回整个结果
            else:
                error_msg = result.get('err', '未知错误')
                print(f"[ERROR] 启动店铺浏览器失败: {error_msg}")
                return None

        except Exception as e:
            print(f"[ERROR] 请求异常: {e}")
            return None

    def stop_browser(self, browser_oauth: str) -> bool:
        """
        停止指定的店铺浏览器

        Args:
            browser_oauth: 店铺的唯一标识ID

        Returns:
            bool: 是否成功停止
        """
        if not self.is_running:
            print("[ERROR] 紫鸟浏览器未运行")
            return False

        # 根据官方文档,需要传递认证信息
        data = {
            "action": "stopBrowser",
            "requestId": str(uuid.uuid4()),
            "browserOauth": browser_oauth,
            "company": self.company,
            "username": self.username,
            "password": self.password
        }

        try:
            print(f"[INFO] 正在停止店铺浏览器: {browser_oauth}")
            response = requests.post(self.base_url, json=data, timeout=60)
            result = response.json()

            if result.get('statusCode') == 0:
                print(f"[OK] 店铺浏览器已停止")
                return True
            else:
                error_msg = result.get('err', '未知错误')
                print(f"[ERROR] 停止店铺浏览器失败: {error_msg}")
                return False

        except Exception as e:
            print(f"[ERROR] 请求异常: {e}")
            return False

    def create_webdriver(self, browser_info: Dict,
                        chromedriver_path: Optional[str] = None) -> Optional[webdriver.Chrome]:
        """
        创建连接到店铺浏览器的Selenium WebDriver

        Args:
            browser_info: start_browser返回的浏览器信息字典
            chromedriver_path: ChromeDriver路径,可选

        Returns:
            Optional[webdriver.Chrome]: WebDriver实例,失败返回None
        """
        try:
            # 从浏览器信息中获取调试端口(官方字段名: debuggingPort)
            debug_port = browser_info.get('debuggingPort')
            if not debug_port:
                print("[ERROR] 未找到debuggingPort字段")
                return None

            print(f"[INFO] 创建WebDriver连接到端口: {debug_port}")

            # 配置Chrome选项
            chrome_options = Options()
            chrome_options.add_experimental_option(
                "debuggerAddress",
                f"127.0.0.1:{debug_port}"
            )

            # 创建WebDriver
            if chromedriver_path:
                service = Service(chromedriver_path)
                driver = webdriver.Chrome(service=service, options=chrome_options)
            else:
                driver = webdriver.Chrome(options=chrome_options)

            print(f"[OK] WebDriver创建成功")
            print(f"[INFO] 当前URL: {driver.current_url}")

            return driver

        except Exception as e:
            print(f"[ERROR] 创建WebDriver失败: {e}")
            return None

    def shutdown(self):
        """关闭紫鸟浏览器客户端"""
        if self.process:
            print("[INFO] 正在关闭紫鸟浏览器...")
            self.process.terminate()
            self.process.wait(timeout=10)
            print("[OK] 紫鸟浏览器已关闭")
        self.is_running = False
