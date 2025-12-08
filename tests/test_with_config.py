"""
使用配置文件的完整流程测试脚本
演示如何从config.yaml读取配置并运行RPA流程
"""
import sys
import os
import time

# 添加src目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager
from ziniao_rpa.core.safety_manager import SafetyManager
from ziniao_rpa.modules.excel_reader import ExcelReader
from ziniao_rpa.modules.amazon_uploader import AmazonUploader
from ziniao_rpa.utils.config_loader import ConfigLoader


def print_step(step_num, description):
    """打印步骤信息"""
    print("\n" + "="*70)
    print(f"步骤 {step_num}: {description}")
    print("="*70)


def main():
    """主测试流程"""

    print("\n" + "="*70)
    print("紫鸟RPA - 配置文件测试")
    print("="*70)
    print(f"\n测试时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    manager = None
    driver = None

    try:
        # ========== 步骤1: 加载配置文件 ==========
        print_step(1, "加载配置文件")

        config_loader = ConfigLoader("config/config.yaml")
        config_loader.load()

        # 验证配置
        if not config_loader.validate():
            print("[FAIL] 配置验证失败!")
            print("\n提示:")
            print("  1. 确保 config/config.yaml 存在")
            print("  2. 从 config/config.yaml.template 复制模板")
            print("  3. 填写您的紫鸟账号信息")
            return False

        # 打印配置(隐藏敏感信息)
        config_loader.print_config(hide_sensitive=True)

        print("[OK] 配置加载成功")

        # ========== 步骤2: 启动紫鸟浏览器 ==========
        print_step(2, "启动紫鸟浏览器主进程")

        manager = ZiniaoManager(
            client_path=config_loader.get('ziniao.client_path'),
            port=config_loader.get('ziniao.port', 8848)
        )

        if not manager.start_client():
            print("[FAIL] 启动紫鸟浏览器失败!")
            return False

        print("[OK] 紫鸟浏览器启动成功")

        # ========== 步骤3: 登录紫鸟账号 ==========
        print_step(3, "登录紫鸟账号")

        if not manager.apply_auth(
            company=config_loader.get('account.company'),
            username=config_loader.get('account.username'),
            password=config_loader.get('account.password'),
            security_password=config_loader.get('account.security_password', '')
        ):
            print("[FAIL] 登录失败!")
            return False

        print("[OK] 登录成功")

        # ========== 步骤4: 获取店铺列表 ==========
        print_step(4, "获取店铺列表")

        shops = manager.get_browser_list()
        if not shops:
            print("[FAIL] 没有可用店铺!")
            print("请先在紫鸟客户端中创建店铺")
            return False

        print(f"[OK] 找到 {len(shops)} 个店铺:")
        for idx, shop in enumerate(shops):
            print(f"  [{idx+1}] {shop.get('name', 'Unknown')} (ID: {shop.get('browserOauth')})")

        # ========== 步骤5: 选择并启动店铺 ==========
        print_step(5, "启动第一个店铺")

        shop_id = shops[0]['browserOauth']
        print(f"选择店铺ID: {shop_id}")

        driver = manager.start_browser(
            shop_id=shop_id,
            chromedriver_path=config_loader.get('chromedriver.path', 'drivers/chromedriver137.exe')
        )

        if not driver:
            print("[FAIL] 启动店铺失败!")
            return False

        print("[OK] 店铺启动成功")
        print(f"当前URL: {driver.current_url}")

        # ========== 步骤6: 初始化安全管理器 ==========
        print_step(6, "初始化安全管理器")

        safety_mgr = SafetyManager(driver)

        # 执行安全检查
        print("\n正在执行安全检查...")

        # IP安全检查
        print("  - 检查IP安全性...")
        if safety_mgr.check_ip_safety():
            print("  [OK] IP检查通过")
        else:
            print("  [WARN] IP检查有警告")

        # 账号健康检查
        print("  - 检查账号健康...")
        if safety_mgr.check_account_health():
            print("  [OK] 账号健康")
        else:
            print("  [WARN] 账号健康检查有警告")

        # 操作时段检查
        print("  - 检查操作时段...")
        if safety_mgr.is_safe_time_to_operate():
            print("  [OK] 当前时段适合操作")
        else:
            print("  [WARN] 当前时段不是最佳操作时间")

        print("\n[OK] 安全检查完成")

        # ========== 步骤7: 读取Excel数据 ==========
        print_step(7, "读取商品数据")

        excel_path = config_loader.get('data.input_excel', 'data/input/test_products.xlsx')
        excel_reader = ExcelReader(excel_path)

        # 先加载Excel文件
        if not excel_reader.load():
            print("[FAIL] Excel文件加载失败!")
            return False

        # 再获取商品数据
        products = excel_reader.get_products()

        if not products:
            print("[FAIL] 没有读取到商品数据!")
            return False

        print(f"[OK] 成功读取 {len(products)} 个商品")

        # 显示前3个商品预览
        print("\n商品预览:")
        for idx, product in enumerate(products[:3]):
            print(f"\n  商品 {idx+1}:")
            print(f"    标题: {str(product.get('title', ''))[:50]}...")
            print(f"    品牌: {product.get('brand', '')}")
            print(f"    价格: {product.get('price', '')}")
            print(f"    SKU: {product.get('sku', '')}")

        if len(products) > 3:
            print(f"\n  ... 还有 {len(products) - 3} 个商品")

        # ========== 步骤8: 初始化亚马逊上传器 ==========
        print_step(8, "初始化亚马逊上传器")
        uploader = AmazonUploader(driver)
        print("[OK] 上传器初始化完成")

        # ========== 步骤9: 显示下一步指引 ==========
        print_step(9, "下一步工作")

        print("""
[提示] 基础框架测试成功!

接下来需要:
  1. 手动访问亚马逊卖家后台的添加商品页面
  2. 使用页面分析器获取真实的页面元素定位
  3. 更新 AmazonUploader 中的元素定位代码
  4. 实现实际的表单填写和图片上传逻辑

运行页面分析器:
  python universal_page_analyzer.py

当前浏览器将保持打开状态,您可以手动操作测试...
        """)

        print("="*70)
        print("测试完成! 基础框架工作正常")
        print("="*70)

        return True

    except KeyboardInterrupt:
        print("\n\n[INFO] 用户中断测试")
        return False

    except Exception as e:
        print(f"\n\n[FAIL] 测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        # ========== 清理资源 ==========
        print("\n" + "="*70)
        print("清理资源")
        print("="*70)

        if driver:
            print("提示: 浏览器保持打开,您可以继续手动测试")
            print("关闭此窗口不会关闭浏览器")

        # 不关闭浏览器和驱动,方便继续测试
        # if manager:
        #     manager.shutdown()

        print("\n测试结束!")


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
