"""
紫鸟RPA GUI界面
集成所有功能和日志显示
"""
import sys
import os
import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox
from tkinter.font import Font
import threading
from datetime import datetime
import queue

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager
from ziniao_rpa.core.safety_manager import SafetyManager
from ziniao_rpa.modules.excel_reader import ExcelReader
from ziniao_rpa.modules.variation_handler import VariationHandler


class ZiniaoRPAGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("紫鸟RPA - 亚马逊自动上架工具")
        self.root.geometry("1000x700")

        # 日志队列
        self.log_queue = queue.Queue()

        # 配置
        self.config = {
            'ziniao_path': r'D:\ziniao\ziniao.exe',
            'port': 8848,
            'username': 'banbantt',
            'password': 'Abanbantt',
            'security_password': '~Abanbantt',
            'chromedriver_path': os.path.abspath('drivers/chromedriver137.exe'),
            'excel_path': 'data/input/test_products.xlsx'
        }

        # 状态
        self.is_running = False
        self.manager = None

        self.setup_ui()
        self.check_log_queue()

    def setup_ui(self):
        """设置UI"""
        # 标题
        title_frame = tk.Frame(self.root, bg='#2c3e50', height=60)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)

        title_font = Font(family='微软雅黑', size=16, weight='bold')
        title_label = tk.Label(
            title_frame,
            text="🚀 紫鸟RPA - 亚马逊自动上架工具",
            font=title_font,
            bg='#2c3e50',
            fg='white'
        )
        title_label.pack(pady=15)

        # 主容器
        main_frame = tk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # 左侧控制面板
        left_frame = tk.LabelFrame(main_frame, text="控制面板", padx=10, pady=10)
        left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))

        # 配置区域
        config_frame = tk.LabelFrame(left_frame, text="配置", padx=5, pady=5)
        config_frame.pack(fill=tk.X, pady=(0, 10))

        # Excel文件选择
        tk.Label(config_frame, text="Excel文件:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.excel_entry = tk.Entry(config_frame, width=25)
        self.excel_entry.insert(0, self.config['excel_path'])
        self.excel_entry.grid(row=0, column=1, pady=2)
        tk.Button(config_frame, text="浏览", command=self.browse_excel).grid(row=0, column=2, padx=5, pady=2)

        # 紫鸟路径
        tk.Label(config_frame, text="紫鸟路径:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.ziniao_entry = tk.Entry(config_frame, width=25)
        self.ziniao_entry.insert(0, self.config['ziniao_path'])
        self.ziniao_entry.grid(row=1, column=1, pady=2)
        tk.Button(config_frame, text="浏览", command=self.browse_ziniao).grid(row=1, column=2, padx=5, pady=2)

        # 账号信息
        account_frame = tk.LabelFrame(left_frame, text="账号信息", padx=5, pady=5)
        account_frame.pack(fill=tk.X, pady=(0, 10))

        tk.Label(account_frame, text="用户名:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.username_entry = tk.Entry(account_frame, width=20)
        self.username_entry.insert(0, self.config['username'])
        self.username_entry.grid(row=0, column=1, pady=2, sticky=tk.W)

        tk.Label(account_frame, text="密码:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.password_entry = tk.Entry(account_frame, width=20, show='*')
        self.password_entry.insert(0, self.config['password'])
        self.password_entry.grid(row=1, column=1, pady=2, sticky=tk.W)

        # 安全配置
        safety_frame = tk.LabelFrame(left_frame, text="安全配置", padx=5, pady=5)
        safety_frame.pack(fill=tk.X, pady=(0, 10))

        self.check_ip_var = tk.BooleanVar(value=True)
        tk.Checkbutton(safety_frame, text="IP安全检查", variable=self.check_ip_var).pack(anchor=tk.W)

        self.check_account_var = tk.BooleanVar(value=True)
        tk.Checkbutton(safety_frame, text="账号健康检查", variable=self.check_account_var).pack(anchor=tk.W)

        self.check_time_var = tk.BooleanVar(value=True)
        tk.Checkbutton(safety_frame, text="操作时段检查", variable=self.check_time_var).pack(anchor=tk.W)

        self.human_like_var = tk.BooleanVar(value=True)
        tk.Checkbutton(safety_frame, text="模拟真人操作", variable=self.human_like_var).pack(anchor=tk.W)

        # 操作按钮
        button_frame = tk.Frame(left_frame)
        button_frame.pack(fill=tk.X, pady=10)

        self.start_btn = tk.Button(
            button_frame,
            text="▶ 开始上传",
            bg='#27ae60',
            fg='white',
            font=Font(size=12, weight='bold'),
            command=self.start_upload,
            height=2
        )
        self.start_btn.pack(fill=tk.X, pady=5)

        self.stop_btn = tk.Button(
            button_frame,
            text="⏸ 停止",
            bg='#e74c3c',
            fg='white',
            font=Font(size=12, weight='bold'),
            command=self.stop_upload,
            state=tk.DISABLED,
            height=2
        )
        self.stop_btn.pack(fill=tk.X, pady=5)

        tk.Button(
            button_frame,
            text="📊 查看数据",
            command=self.view_data
        ).pack(fill=tk.X, pady=5)

        tk.Button(
            button_frame,
            text="🔄 创建测试数据",
            command=self.create_test_data
        ).pack(fill=tk.X, pady=5)

        # 统计信息
        stats_frame = tk.LabelFrame(left_frame, text="统计信息", padx=5, pady=5)
        stats_frame.pack(fill=tk.BOTH, expand=True)

        self.stats_text = tk.Text(stats_frame, height=10, width=30)
        self.stats_text.pack(fill=tk.BOTH, expand=True)
        self.update_stats("等待开始...")

        # 右侧日志区域
        right_frame = tk.Frame(main_frame)
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        # 日志标签栏
        log_tabs = ttk.Notebook(right_frame)
        log_tabs.pack(fill=tk.BOTH, expand=True)

        # 主日志
        main_log_frame = tk.Frame(log_tabs)
        log_tabs.add(main_log_frame, text="主日志")

        self.main_log = scrolledtext.ScrolledText(
            main_log_frame,
            wrap=tk.WORD,
            font=Font(family='Consolas', size=9)
        )
        self.main_log.pack(fill=tk.BOTH, expand=True)

        # 安全日志
        safety_log_frame = tk.Frame(log_tabs)
        log_tabs.add(safety_log_frame, text="安全日志")

        self.safety_log = scrolledtext.ScrolledText(
            safety_log_frame,
            wrap=tk.WORD,
            font=Font(family='Consolas', size=9)
        )
        self.safety_log.pack(fill=tk.BOTH, expand=True)

        # 错误日志
        error_log_frame = tk.Frame(log_tabs)
        log_tabs.add(error_log_frame, text="错误日志")

        self.error_log = scrolledtext.ScrolledText(
            error_log_frame,
            wrap=tk.WORD,
            font=Font(family='Consolas', size=9),
            fg='red'
        )
        self.error_log.pack(fill=tk.BOTH, expand=True)

        # 状态栏
        status_frame = tk.Frame(self.root, relief=tk.SUNKEN, bd=1)
        status_frame.pack(side=tk.BOTTOM, fill=tk.X)

        self.status_label = tk.Label(status_frame, text="就绪", anchor=tk.W)
        self.status_label.pack(side=tk.LEFT, padx=5)

    def log(self, message, level='INFO'):
        """添加日志"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        formatted_msg = f"[{timestamp}] [{level}] {message}\n"

        self.log_queue.put(('main', formatted_msg))

        if level in ['SAFETY', 'CHECK']:
            self.log_queue.put(('safety', formatted_msg))
        elif level == 'ERROR':
            self.log_queue.put(('error', formatted_msg))

    def check_log_queue(self):
        """检查日志队列并更新UI"""
        try:
            while True:
                log_type, message = self.log_queue.get_nowait()

                if log_type == 'main':
                    self.main_log.insert(tk.END, message)
                    self.main_log.see(tk.END)
                elif log_type == 'safety':
                    self.safety_log.insert(tk.END, message)
                    self.safety_log.see(tk.END)
                elif log_type == 'error':
                    self.error_log.insert(tk.END, message)
                    self.error_log.see(tk.END)

        except queue.Empty:
            pass

        self.root.after(100, self.check_log_queue)

    def update_stats(self, text):
        """更新统计信息"""
        self.stats_text.delete(1.0, tk.END)
        self.stats_text.insert(1.0, text)

    def browse_excel(self):
        """浏览Excel文件"""
        filename = filedialog.askopenfilename(
            title="选择Excel文件",
            filetypes=[("Excel文件", "*.xlsx"), ("所有文件", "*.*")]
        )
        if filename:
            self.excel_entry.delete(0, tk.END)
            self.excel_entry.insert(0, filename)

    def browse_ziniao(self):
        """浏览紫鸟路径"""
        filename = filedialog.askopenfilename(
            title="选择紫鸟程序",
            filetypes=[("可执行文件", "*.exe"), ("所有文件", "*.*")]
        )
        if filename:
            self.ziniao_entry.delete(0, tk.END)
            self.ziniao_entry.insert(0, filename)

    def view_data(self):
        """查看商品数据"""
        excel_path = self.excel_entry.get()
        if not os.path.exists(excel_path):
            messagebox.showerror("错误", f"文件不存在: {excel_path}")
            return

        try:
            reader = ExcelReader(excel_path)
            reader.load()

            handler = VariationHandler(reader.data)
            groups = handler.group_by_parent()

            info = f"文件: {excel_path}\n"
            info += f"总数据: {len(reader.data)} 条\n\n"

            independent = sum(1 for _, ps in groups.items() if len(ps) == 1 and not ps[0].get('parent_sku'))
            parents = sum(1 for _, ps in groups.items() if len(ps) > 1)

            info += f"独立商品: {independent} 个\n"
            info += f"变体组: {parents} 个\n\n"

            info += "商品列表:\n"
            info += "="*40 + "\n"
            for parent_sku, products in list(groups.items())[:5]:
                if len(products) == 1 and not products[0].get('parent_sku'):
                    p = products[0]
                    info += f"\n[独立] {p.get('sku', 'N/A')}\n"
                    info += f"  {p.get('title', 'N/A')[:30]}...\n"
                else:
                    info += f"\n[变体] {parent_sku}\n"
                    for p in products[:3]:
                        info += f"  └─ {p.get('sku', 'N/A')}\n"

            self.update_stats(info)
            self.log("数据加载成功", "INFO")

        except Exception as e:
            messagebox.showerror("错误", f"读取失败: {e}")
            self.log(f"读取失败: {e}", "ERROR")

    def create_test_data(self):
        """创建测试数据"""
        if messagebox.askyesno("确认", "是否创建测试数据?\n将覆盖现有文件。"):
            try:
                import subprocess
                result = subprocess.run(['python', 'create_test_products.py'],
                                      capture_output=True, text=True, encoding='utf-8', errors='ignore')
                self.log("测试数据创建完成", "INFO")
                messagebox.showinfo("成功", "测试数据已创建!")
                self.view_data()
            except Exception as e:
                messagebox.showerror("错误", f"创建失败: {e}")
                self.log(f"创建失败: {e}", "ERROR")

    def start_upload(self):
        """开始上传"""
        if self.is_running:
            return

        self.is_running = True
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        self.status_label.config(text="运行中...")

        # 在新线程中运行
        thread = threading.Thread(target=self.upload_worker, daemon=True)
        thread.start()

    def stop_upload(self):
        """停止上传"""
        self.is_running = False
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        self.status_label.config(text="已停止")
        self.log("用户停止操作", "INFO")

    def upload_worker(self):
        """上传工作线程"""
        try:
            self.log("="*50, "INFO")
            self.log("开始上传流程", "INFO")
            self.log("="*50, "INFO")

            # 读取配置
            excel_path = self.excel_entry.get()
            ziniao_path = self.ziniao_entry.get()
            username = self.username_entry.get()
            password = self.password_entry.get()

            # 读取数据
            self.log("[1/7] 读取商品数据...", "INFO")
            reader = ExcelReader(excel_path)
            if not reader.load():
                self.log("数据读取失败", "ERROR")
                return

            self.log(f"成功读取 {len(reader.data)} 条数据", "INFO")

            # 分析变体
            self.log("[2/7] 分析商品结构...", "INFO")
            handler = VariationHandler(reader.data)
            groups = handler.group_by_parent()
            self.log(f"共 {len(groups)} 个商品组", "INFO")

            # 启动紫鸟
            self.log("[3/7] 启动紫鸟...", "INFO")
            self.manager = ZiniaoManager(ziniao_path, self.config['port'])
            if not self.manager.start_client():
                self.log("紫鸟启动失败", "ERROR")
                return
            self.log("紫鸟启动成功", "INFO")

            # 登录
            self.log("[4/7] 登录账号...", "INFO")
            if not self.manager.login(username, password, self.config['security_password']):
                self.log("登录失败", "ERROR")
                return
            self.log("登录成功", "INFO")

            # 启动浏览器
            self.log("[5/7] 启动浏览器...", "INFO")
            browsers = self.manager.get_browser_list()
            if not browsers:
                self.log("获取店铺失败", "ERROR")
                return

            browser_oauth = browsers[0].get('browserOauth')
            browser_info = self.manager.start_browser(browser_oauth, load_cookie=True)
            if not browser_info:
                self.log("浏览器启动失败", "ERROR")
                return
            self.log("浏览器启动成功", "INFO")

            import time
            time.sleep(3)

            driver = self.manager.create_webdriver(
                browser_info,
                self.config['chromedriver_path']
            )

            if not driver:
                self.log("WebDriver创建失败", "ERROR")
                return

            # 先导航到亚马逊卖家中心
            self.log("[6/6] 导航到亚马逊卖家中心...", "INFO")
            try:
                driver.get("https://sellercentral-japan.amazon.com")
                time.sleep(5)
                self.log(f"当前页面: {driver.title[:50]}", "INFO")
            except Exception as e:
                self.log(f"导航失败: {e}", "ERROR")
                return

            # 安全检查
            self.log("[7/7] 执行安全检查...", "SAFETY")
            safety = SafetyManager(driver)

            if self.check_ip_var.get():
                self.log("开始IP安全检查...", "SAFETY")
                if not safety.check_ip_safety():
                    self.log("IP检查失败!", "ERROR")
                    return
                self.log("IP检查通过", "SAFETY")

            if self.check_account_var.get():
                if not safety.check_account_health():
                    self.log("账号健康检查失败!", "ERROR")
                    return
                self.log("账号健康检查通过", "SAFETY")

            if self.check_time_var.get():
                if not safety.is_safe_time_to_operate():
                    self.log("当前时段不推荐操作", "SAFETY")

            self.log("所有安全检查完成", "SAFETY")
            self.log("准备开始上传商品...", "INFO")

            # 更新统计
            stats = f"总商品组: {len(groups)}\n"
            stats += f"已上传: 0\n"
            stats += f"失败: 0\n"
            self.update_stats(stats)

            self.log("上传流程完成(演示模式)", "INFO")
            self.log("实际上传功能需要根据页面元素调整", "INFO")

        except Exception as e:
            self.log(f"严重错误: {e}", "ERROR")
            import traceback
            self.log(traceback.format_exc(), "ERROR")

        finally:
            self.is_running = False
            self.root.after(0, lambda: self.start_btn.config(state=tk.NORMAL))
            self.root.after(0, lambda: self.stop_btn.config(state=tk.DISABLED))
            self.root.after(0, lambda: self.status_label.config(text="完成"))


def main():
    root = tk.Tk()
    app = ZiniaoRPAGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()
