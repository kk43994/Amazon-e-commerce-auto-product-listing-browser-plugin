"""
安全的商品上传脚本
集成防风控功能,模拟真人操作
"""
import sys
import os
import time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager
from ziniao_rpa.core.safety_manager import SafetyManager
from ziniao_rpa.modules.excel_reader import ExcelReader
from ziniao_rpa.modules.variation_handler import VariationHandler
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

PRODUCT_CREATE_URL = "https://sellercentral-japan.amazon.com/abis/listing/create/product_identity#product_identity"


def safe_fill_field(safety: SafetyManager, by, value, text, desc="字段"):
    """安全填写字段 - 模拟真人"""
    try:
        wait = WebDriverWait(safety.driver, 10)
        element = wait.until(EC.presence_of_element_located((by, value)))

        # 随机滚动到元素
        safety.driver.execute_script(
            "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});",
            element
        )
        safety.random_pause(0.5, 1)

        # 模拟真人打字
        safety.human_like_type(element, text)
        print(f"  [OK] {desc}: {str(text)[:30]}")

        # 随机暂停
        safety.random_pause(0.5, 1.5)
        return True

    except Exception as e:
        print(f"  [WARN] {desc}填写失败: {e}")
        safety.take_safety_screenshot(f"error_{desc}")
        return False


def upload_single_product_safe(driver, product, safety: SafetyManager):
    """安全上传独立商品"""
    print(f"\n{'='*70}")
    print(f"上传商品: {product.get('title', 'N/A')[:40]}")
    print(f"SKU: {product.get('sku', 'N/A')}")
    print(f"{'='*70}")

    try:
        # 执行类人操作
        safety.perform_human_like_actions()

        # 导航到创建页面
        print("[导航] 打开商品创建页面...")
        driver.get(PRODUCT_CREATE_URL)
        time.sleep(3)

        safety.take_safety_screenshot("page_loaded")

        # 填写字段 (使用真人模拟)
        print("\n[填写] 开始填写商品信息...")

        if product.get('title'):
            safe_fill_field(safety, By.ID, "product-title", product['title'], "商品标题")

        if product.get('brand'):
            safe_fill_field(safety, By.ID, "brand", product['brand'], "品牌")

        if product.get('sku'):
            safe_fill_field(safety, By.ID, "sku", product['sku'], "SKU")

        if product.get('price'):
            safe_fill_field(safety, By.ID, "standard-price", str(product['price']), "价格")

        if product.get('quantity'):
            safe_fill_field(safety, By.ID, "quantity", str(product['quantity']), "库存")

        if product.get('description'):
            safe_fill_field(safety, By.ID, "product-description", product['description'], "商品描述")

        # 随机滚动
        safety.random_scroll(2)

        # 上传图片
        if product.get('main_image') and os.path.exists(product['main_image']):
            print("\n[上传] 上传商品图片...")
            try:
                file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
                file_input.send_keys(os.path.abspath(product['main_image']))
                print("  [OK] 图片上传完成")
                time.sleep(2)
            except Exception as e:
                print(f"  [WARN] 图片上传失败: {e}")

        safety.take_safety_screenshot("form_filled")

        print("\n[OK] 商品信息填写完成")
        return True

    except Exception as e:
        print(f"\n[ERROR] 上传失败: {e}")
        safety.emergency_stop(f"商品上传异常: {e}")
        return False


def main():
    print(f"\n{'='*70}")
    print(" 亚马逊安全上传工具 - 防风控版本")
    print(f"{'='*70}\n")

    # === 步骤 1: 读取数据 ===
    print("[1/8] 读取商品数据...")
    reader = ExcelReader("data/input/test_products.xlsx")
    if not reader.load():
        return

    products_df = reader.data
    print(f"[OK] 成功读取 {len(products_df)} 条数据")

    # === 步骤 2: 分析变体 ===
    print("\n[2/8] 分析商品结构...")
    handler = VariationHandler(products_df)
    handler.print_variation_structure()

    # === 步骤 3: 启动紫鸟 ===
    print("\n[3/8] 启动紫鸟浏览器...")
    manager = ZiniaoManager(r"D:\ziniao\ziniao.exe", 8848)
    if not manager.start_client():
        return

    driver = None
    browser_oauth = None

    try:
        # === 步骤 4: 登录 ===
        print("\n[4/8] 登录账号...")
        if not manager.login("banbantt", "Abanbantt", "~Abanbantt"):
            return

        # === 步骤 5: 启动浏览器 ===
        print("\n[5/8] 获取店铺并启动浏览器...")
        browsers = manager.get_browser_list()
        if not browsers:
            return

        browser_oauth = browsers[0].get('browserOauth')
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

        # === 步骤 6: 安全检查 ===
        print(f"\n{'='*70}")
        print("[6/8] 执行安全检查...")
        print(f"{'='*70}")

        safety = SafetyManager(driver)

        # 检查操作时间
        if not safety.is_safe_time_to_operate():
            print("[警告] 当前时段不是最佳操作时间")
            choice = input("是否继续? (y/n): ")
            if choice.lower() != 'y':
                print("已取消操作")
                return

        # 检查IP安全
        if not safety.check_ip_safety():
            print("[严重] IP环境不安全!")
            safety.emergency_stop("IP检查失败")
            return

        # 检查账号健康
        if not safety.check_account_health():
            print("[严重] 账号存在风险!")
            safety.emergency_stop("账号健康检查失败")
            return

        print("[OK] 所有安全检查通过")

        # === 步骤 7: 开始上传 ===
        print(f"\n{'='*70}")
        print("[7/8] 开始安全上传商品...")
        print(f"{'='*70}")

        groups = handler.group_by_parent()
        total_groups = len(groups)
        success_count = 0
        failed_count = 0

        for idx, (parent_sku, products) in enumerate(groups.items(), 1):
            print(f"\n\n【{idx}/{total_groups}】处理商品组: {parent_sku}")

            # 检查上传数量限制
            if not safety.check_operation_limit(max_per_session=20):
                print("[安全] 已达到单次上传限制,停止操作")
                break

            # 判断商品类型
            if len(products) == 1 and not products[0].get('parent_sku'):
                # 独立商品
                result = upload_single_product_safe(driver, products[0], safety)
            else:
                # 变体商品 (暂未实现)
                print("[提示] 变体商品上传功能开发中...")
                result = False

            if result:
                success_count += 1
            else:
                failed_count += 1

            # 商品之间的安全延迟
            if idx < total_groups:
                safety.safe_delay_between_uploads()

        # === 步骤 8: 完成总结 ===
        print(f"\n{'='*70}")
        print("[8/8] 上传完成")
        print(f"{'='*70}")
        print(f"成功: {success_count}")
        print(f"失败: {failed_count}")

        safety.print_safety_summary()

        print("\n浏览器保持打开,按Ctrl+C退出...")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n正在退出...")

    except Exception as e:
        print(f"\n[严重错误] {e}")
        import traceback
        traceback.print_exc()

        if driver and 'safety' in locals():
            safety.emergency_stop(f"程序异常: {e}")

    finally:
        # 清理资源
        if driver:
            driver.quit()
        if browser_oauth:
            manager.stop_browser(browser_oauth)
        manager.shutdown()


if __name__ == "__main__":
    # 创建日志目录
    os.makedirs("logs/screenshots", exist_ok=True)

    main()
