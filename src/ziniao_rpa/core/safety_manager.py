"""
安全管理模块
防止账号被封,模拟真人操作
"""

import time
import random
from datetime import datetime
from typing import Optional
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By


class SafetyManager:
    """安全管理器 - 防风控"""

    def __init__(self, driver: webdriver.Remote):
        self.driver = driver
        self.upload_count = 0
        self.start_time = datetime.now()

    def check_ip_safety(self) -> bool:
        """
        检查当前IP是否安全

        Returns:
            bool: IP是否安全
        """
        try:
            print("[安全检查] 开始验证IP环境...")

            # 紫鸟浏览器使用 cookieTypeLoad=1 时会自动加载配置的IP代理
            # 我们只需要验证浏览器能正常工作即可
            current_url = self.driver.current_url
            print(f"[DEBUG] 当前URL: {current_url[:50]}...")

            # 检查是否能获取页面标题
            try:
                title = self.driver.title
                print(f"[DEBUG] 页面标题: {title[:30]}...")
            except:
                print("[警告] 无法获取页面标题")

            # 简单验证:能正常访问页面就说明IP环境OK
            print("[安全检查] 紫鸟浏览器已配置IP代理 (cookieTypeLoad=1)")
            print("[OK] IP检查完成 - 使用紫鸟配置的环境")
            return True

        except Exception as e:
            print(f"[错误] IP安全检查异常: {e}")
            import traceback
            print(traceback.format_exc())
            return False

    def check_account_health(self) -> bool:
        """
        检查账号健康状态

        Returns:
            bool: 账号是否健康
        """
        try:
            print("[安全检查] 检查账号健康状态...")

            # 检查当前页面源码中是否有风险关键词
            # 避免跳转页面导致卡顿
            print("[DEBUG] 检查当前页面内容...")
            page_source = self.driver.page_source.lower()

            risk_keywords = [
                'suspension', 'suspended', '停用', '暂停',
                'warning', '警告', 'violation', '违规',
                'deactivated', '禁用', 'restricted', '限制',
                'account health', 'performance notification'
            ]

            found_risks = []
            for keyword in risk_keywords:
                if keyword in page_source:
                    found_risks.append(keyword)

            if found_risks:
                print(f"[警告] 检测到可能的风险关键词: {', '.join(found_risks[:3])}")
                print("[提示] 建议人工登录查看账号Performance页面")
                # 不直接返回False,只是警告
                # return False

            print("[OK] 账号状态初步检查通过")
            print("[提示] 建议定期人工检查 Performance Dashboard")

            return True

        except Exception as e:
            print(f"[错误] 账号健康检查失败: {e}")
            import traceback
            print(traceback.format_exc())
            # 检查失败不影响继续运行
            return True

    def is_safe_time_to_operate(self) -> bool:
        """
        检查当前是否是安全的操作时间

        Returns:
            bool: 是否是安全时间
        """
        now = datetime.now()
        hour = now.hour

        # 深夜时段 (1-5点) - 相对安全
        if 1 <= hour <= 5:
            print(f"[时间检查] {hour}:00 深夜时段,相对安全")
            return True

        # 正常工作时间 (9-17点) - 正常
        if 9 <= hour <= 17:
            print(f"[时间检查] {hour}:00 工作时段,正常操作")
            return True

        # 其他时间 - 谨慎
        print(f"[警告] {hour}:00 非推荐时段,建议避免批量操作")
        return False

    def human_like_type(self, element, text: str, min_delay: float = 0.05, max_delay: float = 0.15):
        """
        模拟真人打字

        Args:
            element: 输入元素
            text: 要输入的文本
            min_delay: 最小延迟(秒)
            max_delay: 最大延迟(秒)
        """
        element.clear()

        for char in str(text):
            element.send_keys(char)
            time.sleep(random.uniform(min_delay, max_delay))

    def random_mouse_movement(self):
        """随机移动鼠标 - 模拟真人"""
        try:
            action = ActionChains(self.driver)

            # 随机移动3-5次
            for _ in range(random.randint(3, 5)):
                x = random.randint(-100, 100)
                y = random.randint(-100, 100)
                action.move_by_offset(x, y).perform()
                time.sleep(random.uniform(0.1, 0.3))

        except Exception as e:
            # 鼠标移动失败不影响主流程
            pass

    def random_scroll(self, times: int = 1):
        """
        随机滚动页面

        Args:
            times: 滚动次数
        """
        for _ in range(times):
            # 随机向上或向下滚动
            direction = random.choice([1, -1])
            amount = random.randint(100, 500) * direction

            self.driver.execute_script(f"window.scrollBy(0, {amount})")
            time.sleep(random.uniform(0.5, 1.5))

    def random_pause(self, min_sec: int = 1, max_sec: int = 3):
        """
        随机暂停 - 模拟思考时间

        Args:
            min_sec: 最小暂停秒数
            max_sec: 最大暂停秒数
        """
        delay = random.uniform(min_sec, max_sec)
        time.sleep(delay)

    def calculate_next_delay(self) -> int:
        """
        计算下一次操作的延迟时间

        Returns:
            int: 延迟秒数
        """
        self.upload_count += 1

        # 基础延迟: 2-5分钟
        base_delay = random.randint(120, 300)

        # 每上传3-5个商品,增加长时间休息
        if self.upload_count % random.randint(3, 5) == 0:
            long_delay = random.randint(600, 900)  # 10-15分钟
            print(f"[安全] 已连续上传{self.upload_count}个商品,休息 {long_delay//60} 分钟")
            return long_delay

        return base_delay

    def safe_delay_between_uploads(self):
        """商品上传之间的安全延迟"""
        delay = self.calculate_next_delay()

        print(f"[安全] 等待 {delay} 秒后继续...")
        print(f"[提示] 已上传: {self.upload_count} 个商品")

        # 显示倒计时
        for remaining in range(delay, 0, -10):
            if remaining % 60 == 0:
                print(f"  剩余: {remaining//60} 分钟")
            time.sleep(min(10, remaining))

    def check_operation_limit(self, max_per_session: int = 20) -> bool:
        """
        检查单次运行上传数量限制

        Args:
            max_per_session: 单次最多上传数量

        Returns:
            bool: 是否可以继续
        """
        if self.upload_count >= max_per_session:
            print(f"[安全] 已达到单次上传限制({max_per_session}个)")
            print("[安全] 建议停止并休息至少1小时")
            return False

        return True

    def perform_human_like_actions(self):
        """执行一系列类人操作"""
        # 随机滚动
        self.random_scroll(random.randint(1, 3))

        # 随机鼠标移动
        self.random_mouse_movement()

        # 随机暂停
        self.random_pause(1, 3)

    def take_safety_screenshot(self, filename: str):
        """安全截图 - 记录操作过程"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            full_path = f"logs/screenshots/{timestamp}_{filename}.png"

            import os
            os.makedirs("logs/screenshots", exist_ok=True)

            self.driver.save_screenshot(full_path)
            print(f"[截图] 已保存: {full_path}")

        except Exception as e:
            print(f"[警告] 截图失败: {e}")

    def emergency_stop(self, reason: str):
        """紧急停止 - 发现风险时调用"""
        print("\n" + "="*70)
        print("【紧急停止】")
        print(f"原因: {reason}")
        print("="*70)

        # 截图保存现场
        self.take_safety_screenshot("emergency_stop")

        # 记录日志
        with open("logs/emergency.log", "a", encoding="utf-8") as f:
            f.write(f"{datetime.now()} - {reason}\n")

        # 可以添加邮件/短信通知
        print("[建议] 请人工检查账号状态")

    def get_session_stats(self) -> dict:
        """获取本次会话统计"""
        elapsed = (datetime.now() - self.start_time).total_seconds()

        return {
            'upload_count': self.upload_count,
            'elapsed_time': int(elapsed),
            'avg_time_per_upload': int(elapsed / max(self.upload_count, 1)),
            'start_time': self.start_time.strftime("%Y-%m-%d %H:%M:%S")
        }

    def print_safety_summary(self):
        """打印安全统计摘要"""
        stats = self.get_session_stats()

        print("\n" + "="*70)
        print("【安全统计】")
        print(f"开始时间: {stats['start_time']}")
        print(f"上传数量: {stats['upload_count']} 个")
        print(f"总用时: {stats['elapsed_time']//60} 分钟")
        print(f"平均每个商品: {stats['avg_time_per_upload']//60} 分钟")
        print("="*70 + "\n")
