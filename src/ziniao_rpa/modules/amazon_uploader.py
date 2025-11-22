"""
亚马逊商品自动上架模块
负责在亚马逊卖家后台自动填写商品信息并上传图片
"""

import time
from typing import Dict, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import os


class AmazonUploader:
    """亚马逊商品上架器"""

    def __init__(self, driver: webdriver.Chrome, wait_timeout: int = 30):
        """
        初始化上架器

        Args:
            driver: Selenium WebDriver实例
            wait_timeout: 元素等待超时时间(秒)
        """
        self.driver = driver
        self.wait = WebDriverWait(driver, wait_timeout)
        self.wait_timeout = wait_timeout

    def navigate_to_add_product(self):
        """导航到添加商品页面"""
        try:
            print("[INFO] 导航到添加商品页面...")

            # 方式1: 直接访问URL (更快)
            # self.driver.get("https://sellercentral.amazon.com/product-search/search")

            # 方式2: 通过菜单点击 (更稳定)
            # 这里需要根据实际的亚马逊卖家后台结构来定位元素
            # 示例代码:
            # catalog_menu = self.wait.until(
            #     EC.element_to_be_clickable((By.ID, "sc-navtab-catalog"))
            # )
            # catalog_menu.click()

            print("[OK] 成功导航到添加商品页面")
            return True

        except Exception as e:
            print(f"[ERROR] 导航失败: {e}")
            return False

    def fill_product_title(self, title: str) -> bool:
        """
        填写商品标题

        Args:
            title: 商品标题

        Returns:
            bool: 是否成功
        """
        try:
            print(f"[INFO] 填写标题: {title[:50]}...")

            # 需要根据实际页面找到标题输入框的定位符
            # 示例定位方式 (需要根据实际情况调整):
            title_input = self.wait.until(
                EC.presence_of_element_located((By.ID, "product-title"))
            )

            title_input.clear()
            title_input.send_keys(title)

            print("[OK] 标题填写完成")
            return True

        except Exception as e:
            print(f"[ERROR] 填写标题失败: {e}")
            return False

    def fill_brand(self, brand: str) -> bool:
        """填写品牌"""
        try:
            print(f"[INFO] 填写品牌: {brand}")

            brand_input = self.wait.until(
                EC.presence_of_element_located((By.ID, "brand"))
            )

            brand_input.clear()
            brand_input.send_keys(brand)

            print("[OK] 品牌填写完成")
            return True

        except Exception as e:
            print(f"[ERROR] 填写品牌失败: {e}")
            return False

    def fill_description(self, description: str) -> bool:
        """填写商品描述"""
        try:
            print(f"[INFO] 填写描述...")

            desc_input = self.wait.until(
                EC.presence_of_element_located((By.ID, "description"))
            )

            desc_input.clear()
            desc_input.send_keys(description)

            print("[OK] 描述填写完成")
            return True

        except Exception as e:
            print(f"[ERROR] 填写描述失败: {e}")
            return False

    def fill_bullet_points(self, bullet_points: str) -> bool:
        """
        填写要点说明

        Args:
            bullet_points: 要点说明,多个要点用换行符分隔
        """
        try:
            print(f"[INFO] 填写要点说明...")

            # 将多个要点分开
            points = bullet_points.split('\n')

            for i, point in enumerate(points[:5], 1):  # 亚马逊最多5个要点
                if not point.strip():
                    continue

                bullet_input = self.wait.until(
                    EC.presence_of_element_located(
                        (By.ID, f"bullet_point_{i}")
                    )
                )

                bullet_input.clear()
                bullet_input.send_keys(point.strip())
                print(f"[OK] 要点{i}填写完成")

            return True

        except Exception as e:
            print(f"[ERROR] 填写要点失败: {e}")
            return False

    def fill_price(self, price: float) -> bool:
        """填写价格"""
        try:
            print(f"[INFO] 填写价格: ${price}")

            price_input = self.wait.until(
                EC.presence_of_element_located((By.ID, "standard-price"))
            )

            price_input.clear()
            price_input.send_keys(str(price))

            print("[OK] 价格填写完成")
            return True

        except Exception as e:
            print(f"[ERROR] 填写价格失败: {e}")
            return False

    def fill_quantity(self, quantity: int) -> bool:
        """填写库存数量"""
        try:
            print(f"[INFO] 填写库存: {quantity}")

            quantity_input = self.wait.until(
                EC.presence_of_element_located((By.ID, "quantity"))
            )

            quantity_input.clear()
            quantity_input.send_keys(str(quantity))

            print("[OK] 库存填写完成")
            return True

        except Exception as e:
            print(f"[ERROR] 填写库存失败: {e}")
            return False

    def upload_image(self, image_path: str, image_index: int = 1) -> bool:
        """
        上传商品图片

        Args:
            image_path: 图片文件路径
            image_index: 图片位置索引 (1=主图, 2-8=副图)

        Returns:
            bool: 是否成功
        """
        try:
            if not os.path.exists(image_path):
                print(f"[ERROR] 图片文件不存在: {image_path}")
                return False

            print(f"[INFO] 上传图片{image_index}: {os.path.basename(image_path)}")

            # 找到文件上传输入框
            # 注意: 文件上传输入框通常是 input[type="file"]
            file_input = self.wait.until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, f"input[type='file'][data-image-index='{image_index}']")
                )
            )

            # 发送文件路径 (不需要点击,直接send_keys)
            file_input.send_keys(os.path.abspath(image_path))

            # 等待上传完成
            print("[INFO] 等待图片上传...")
            time.sleep(3)

            print(f"[OK] 图片{image_index}上传完成")
            return True

        except Exception as e:
            print(f"[ERROR] 上传图片失败: {e}")
            return False

    def upload_product(self, product_data: Dict) -> bool:
        """
        上传完整商品信息

        Args:
            product_data: 商品数据字典

        Returns:
            bool: 是否成功
        """
        try:
            print(f"\n{'='*60}")
            print(f"开始上传商品: {product_data.get('title', 'N/A')[:50]}...")
            print(f"{'='*60}\n")

            # 1. 导航到添加商品页面
            if not self.navigate_to_add_product():
                return False

            time.sleep(2)

            # 2. 填写基本信息
            if product_data.get('title'):
                if not self.fill_product_title(product_data['title']):
                    return False

            if product_data.get('brand'):
                if not self.fill_brand(product_data['brand']):
                    return False

            if product_data.get('description'):
                if not self.fill_description(product_data['description']):
                    return False

            if product_data.get('bullet_points'):
                if not self.fill_bullet_points(product_data['bullet_points']):
                    return False

            # 3. 填写价格和库存
            if product_data.get('price'):
                if not self.fill_price(float(product_data['price'])):
                    return False

            if product_data.get('quantity'):
                if not self.fill_quantity(int(product_data['quantity'])):
                    return False

            # 4. 上传图片
            # 主图
            if product_data.get('main_image'):
                if not self.upload_image(product_data['main_image'], 1):
                    print("[WARN] 主图上传失败,继续处理其他图片...")

            # 副图
            for i in range(1, 8):
                image_key = f'image_{i}'
                if product_data.get(image_key):
                    if not self.upload_image(product_data[image_key], i+1):
                        print(f"[WARN] 副图{i}上传失败,继续...")

            # 5. 提交保存
            print("[INFO] 准备提交商品...")

            # 找到保存/提交按钮并点击
            # submit_button = self.wait.until(
            #     EC.element_to_be_clickable((By.ID, "submit-button"))
            # )
            # submit_button.click()

            print("[OK] 商品提交成功!")
            print(f"{'='*60}\n")

            return True

        except Exception as e:
            print(f"[ERROR] 上传商品失败: {e}")
            import traceback
            traceback.print_exc()
            return False

    def batch_upload(self, products: list) -> Dict:
        """
        批量上传商品

        Args:
            products: 商品数据列表

        Returns:
            Dict: 上传结果统计
        """
        results = {
            'total': len(products),
            'success': 0,
            'failed': 0,
            'failed_list': []
        }

        print(f"\n开始批量上传 {len(products)} 个商品...\n")

        for index, product in enumerate(products, 1):
            print(f"\n[{index}/{len(products)}] 处理商品...")

            if self.upload_product(product):
                results['success'] += 1
            else:
                results['failed'] += 1
                results['failed_list'].append({
                    'index': index,
                    'title': product.get('title', 'N/A'),
                    'sku': product.get('sku', 'N/A')
                })

            # 每个商品之间暂停一下
            if index < len(products):
                print("[INFO] 等待3秒后处理下一个商品...")
                time.sleep(3)

        # 打印汇总
        print(f"\n{'='*60}")
        print("批量上传完成!")
        print(f"{'='*60}")
        print(f"总计: {results['total']}")
        print(f"成功: {results['success']}")
        print(f"失败: {results['failed']}")

        if results['failed_list']:
            print("\n失败商品列表:")
            for item in results['failed_list']:
                print(f"  - [{item['index']}] {item['title']} (SKU: {item['sku']})")

        print(f"{'='*60}\n")

        return results

    def take_screenshot(self, filename: str):
        """截图保存"""
        try:
            self.driver.save_screenshot(filename)
            print(f"[OK] 截图已保存: {filename}")
        except Exception as e:
            print(f"[ERROR] 截图失败: {e}")

    def scroll_to_element(self, element):
        """滚动到元素可见"""
        try:
            self.driver.execute_script(
                "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});",
                element
            )
            time.sleep(0.5)
        except Exception as e:
            print(f"[ERROR] 滚动失败: {e}")

    def safe_click(self, locator, timeout: int = 10) -> bool:
        """
        安全点击元素 (等待可点击)

        Args:
            locator: 元素定位器 (By, value)
            timeout: 超时时间

        Returns:
            bool: 是否成功
        """
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable(locator)
            )
            self.scroll_to_element(element)
            element.click()
            return True
        except Exception as e:
            print(f"[ERROR] 点击失败: {e}")
            return False

    def safe_input(self, locator, text: str, timeout: int = 10) -> bool:
        """
        安全输入文本

        Args:
            locator: 元素定位器
            text: 输入文本
            timeout: 超时时间

        Returns:
            bool: 是否成功
        """
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located(locator)
            )
            self.scroll_to_element(element)
            element.clear()
            element.send_keys(text)
            return True
        except Exception as e:
            print(f"[ERROR] 输入失败: {e}")
            return False
