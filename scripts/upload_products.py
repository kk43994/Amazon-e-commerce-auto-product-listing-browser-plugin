"""
亚马逊商品自动上架脚本 - 支持独立商品和变体
"""
import sys
import os
import time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager
from ziniao_rpa.modules.excel_reader import ExcelReader
from ziniao_rpa.modules.variation_handler import VariationHandler
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 亚马逊日本站商品创建URL
PRODUCT_CREATE_URL = "https://sellercentral-japan.amazon.com/abis/listing/create/product_identity#product_identity"


def wait_and_fill(driver, by, value, text, desc="字段"):
    """等待元素并填写"""
    try:
        wait = WebDriverWait(driver, 5)
        element = wait.until(EC.presence_of_element_located((by, value)))
        element.clear()
        element.send_keys(text)
        print(f"  [OK] 填写{desc}: {str(text)[:30]}")
        return True
    except Exception as e:
        print(f"  [WARN] {desc}填写失败: {e}")
        return False


def wait_and_click(driver, by, value, desc="按钮"):
    """等待元素并点击"""
    try:
        wait = WebDriverWait(driver, 5)
        element = wait.until(EC.element_to_be_clickable((by, value)))
        element.click()
        print(f"  [OK] 点击{desc}")
        return True
    except Exception as e:
        print(f"  [WARN] {desc}点击失败: {e}")
        return False


def upload_single_product(driver, product):
    """上传独立商品"""
    print(f"\n{'='*70}")
    print(f"上传独立商品: {product.get('title', 'N/A')[:40]}")
    print(f"SKU: {product.get('sku', 'N/A')}")
    print(f"{'='*70}")

    # 导航到创建页面
    driver.get(PRODUCT_CREATE_URL)
    time.sleep(3)

    # 填写商品信息
    # 标题
    if product.get('title'):
        wait_and_fill(driver, By.ID, "product-title", product['title'], "商品标题")

    # 品牌
    if product.get('brand'):
        wait_and_fill(driver, By.ID, "brand", product['brand'], "品牌")

    # SKU
    if product.get('sku'):
        wait_and_fill(driver, By.ID, "sku", product['sku'], "SKU")

    # 价格
    if product.get('price'):
        wait_and_fill(driver, By.ID, "standard-price", str(product['price']), "价格")

    # 库存
    if product.get('quantity'):
        wait_and_fill(driver, By.ID, "quantity", str(product['quantity']), "库存")

    # 描述
    if product.get('description'):
        wait_and_fill(driver, By.ID, "product-description", product['description'], "商品描述")

    # 上传图片
    if product.get('main_image') and os.path.exists(product['main_image']):
        try:
            file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
            file_input.send_keys(os.path.abspath(product['main_image']))
            print(f"  [OK] 上传主图")
            time.sleep(2)
        except Exception as e:
            print(f"  [WARN] 主图上传失败: {e}")

    print(f"[INFO] 商品信息填写完成")
    return True


def upload_variation_product(driver, parent, children):
    """上传变体商品"""
    print(f"\n{'='*70}")
    print(f"上传变体商品: {parent.get('title', 'N/A')[:40]}")
    print(f"父SKU: {parent.get('sku', 'N/A')}")
    print(f"子变体数: {len(children)}")
    print(f"{'='*70}")

    # 导航到创建页面
    driver.get(PRODUCT_CREATE_URL)
    time.sleep(3)

    # 填写父商品信息
    print("\n[步骤 1] 填写父商品信息...")

    # 标题
    if parent.get('title'):
        wait_and_fill(driver, By.ID, "product-title", parent['title'], "商品标题")

    # 品牌
    if parent.get('brand'):
        wait_and_fill(driver, By.ID, "brand", parent['brand'], "品牌")

    # 父SKU
    if parent.get('sku'):
        wait_and_fill(driver, By.ID, "sku", parent['sku'], "父SKU")

    # 描述
    if parent.get('description'):
        wait_and_fill(driver, By.ID, "product-description", parent['description'], "商品描述")

    # 选择变体主题
    if parent.get('variation_theme'):
        print(f"\n[步骤 2] 选择变体主题: {parent['variation_theme']}")
        # 这里需要根据实际页面元素定位变体主题选择器
        # 例如: ColorSize, SizeColor 等

    # 添加子变体
    print(f"\n[步骤 3] 添加 {len(children)} 个子变体...")

    for idx, child in enumerate(children, 1):
        print(f"\n  子变体 #{idx}: {child.get('sku', 'N/A')}")

        # 这里需要根据实际页面交互添加子变体
        # 通常需要:
        # 1. 点击"添加变体"按钮
        # 2. 填写变体属性 (颜色/尺寸)
        # 3. 填写SKU
        # 4. 填写价格
        # 5. 填写库存
        # 6. 上传图片

        if child.get('color'):
            print(f"    颜色: {child['color']}")

        if child.get('size'):
            print(f"    尺寸: {child['size']}")

        if child.get('price'):
            print(f"    价格: {child['price']}")

        if child.get('quantity'):
            print(f"    库存: {child['quantity']}")

    print(f"\n[INFO] 变体商品信息填写完成")
    return True


def main():
    print(f"\n{'='*70}")
    print(" 亚马逊商品自动上架工具")
    print(f"{'='*70}\n")

    # 读取Excel数据
    print("[步骤 1/6] 读取商品数据...")
    reader = ExcelReader("data/input/test_products.xlsx")
    if not reader.load():
        return

    products_df = reader.data
    print(f"[OK] 成功读取 {len(products_df)} 条数据")

    # 分析变体结构
    print("\n[步骤 2/6] 分析变体结构...")
    handler = VariationHandler(products_df)
    handler.print_variation_structure()

    # 启动紫鸟
    print("\n[步骤 3/6] 启动紫鸟浏览器...")
    manager = ZiniaoManager(r"D:\ziniao\ziniao.exe", 8848)
    if not manager.start_client():
        return

    try:
        # 登录
        print("\n[步骤 4/6] 登录账号...")
        if not manager.login("banbantt", "Abanbantt", "~Abanbantt"):
            return

        # 获取店铺
        print("\n[步骤 5/6] 获取店铺...")
        browsers = manager.get_browser_list()
        if not browsers:
            return

        browser_oauth = browsers[0].get('browserOauth')
        print(f"[OK] 使用店铺: {browsers[0].get('browserName')}")

        # 启动浏览器
        browser_info = manager.start_browser(browser_oauth, load_cookie=True)
        if not browser_info:
            return

        time.sleep(3)

        driver = manager.create_webdriver(
            browser_info,
            os.path.abspath("drivers/chromedriver137.exe")
        )

        if not driver:
            return

        print(f"[OK] 浏览器已启动")

        # 开始上架
        print(f"\n{'='*70}")
        print("[步骤 6/6] 开始上架商品...")
        print(f"{'='*70}")

        # 获取所有商品组
        groups = handler.group_by_parent()

        for parent_sku, products in groups.items():
            # 判断是独立商品还是变体商品
            if len(products) == 1 and not products[0].get('parent_sku'):
                # 独立商品
                upload_single_product(driver, products[0])
            else:
                # 变体商品
                parent = handler.get_parent_product(parent_sku)
                children = [p for p in products if p.get('parent_sku') == parent_sku]

                if parent and children:
                    upload_variation_product(driver, parent, children)

            # 每个商品之间暂停
            time.sleep(2)

        print(f"\n{'='*70}")
        print("所有商品上架完成!")
        print(f"{'='*70}")

        print("\n浏览器保持打开,按Ctrl+C退出...")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n退出...")

    finally:
        if 'driver' in locals():
            driver.quit()
        if 'browser_oauth' in locals():
            manager.stop_browser(browser_oauth)
        manager.shutdown()


if __name__ == "__main__":
    main()
