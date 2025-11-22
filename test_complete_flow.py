"""
完整流程测试脚本
测试从启动紫鸟浏览器到商品上传的完整流程
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


def print_step(step_num, description):
    """打印步骤信息"""
    print("\n" + "="*70)
    print(f"步骤 {step_num}: {description}")
    print("="*70)


def main():
    """主测试流程"""

    # ========== 配置信息 ==========
    config = {
        'ziniao_path': r'D:\ziniao\ziniao.exe',
        'port': 8848,
        'company': 'banbantt',          # 公司名称
        'username': 'Abanbantt',        # 用户名
        'password': '~Abanbantt',       # 密码
        'security_password': '~Abanbantt',  # 安全密码(暂未使用)
        'chromedriver_path': os.path.abspath('drivers/chromedriver137.exe'),
        'excel_path': 'data/input/test_products.xlsx'
    }

    print("\n" + "="*70)
    print("紫鸟RPA - 完整流程测试")
    print("="*70)
    print(f"\n测试时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Excel文件: {config['excel_path']}")

    manager = None
    driver = None

    try:
        # ========== 步骤1: 启动紫鸟浏览器 ==========
        print_step(1, "启动紫鸟浏览器主进程")

        manager = ZiniaoManager(
            client_path=config['ziniao_path'],
            port=config['port']
        )

        if not manager.start_client():
            print("[FAIL] 启动紫鸟浏览器失败!")
            return False

        print("[OK] 紫鸟浏览器启动成功")

        # ========== 步骤2: 登录紫鸟账号 ==========
        print_step(2, "登录紫鸟账号")

        if not manager.apply_auth(
            company=config['company'],
            username=config['username'],
            password=config['password'],
            security_password=config['security_password']
        ):
            print("[FAIL] 登录失败!")
            return False

        print("[OK] 登录成功")

        # ========== 步骤3: 获取店铺列表 ==========
        print_step(3, "获取店铺列表")

        shops = manager.get_browser_list()
        if not shops:
            print("[FAIL] 没有可用店铺!")
            print("请先在紫鸟客户端中创建店铺")
            return False

        print(f"[OK] 找到 {len(shops)} 个店铺:")
        for idx, shop in enumerate(shops):
            print(f"  [{idx+1}] {shop.get('name', 'Unknown')} (browserOauth: {shop.get('browserOauth')})")

        # ========== 步骤4: 选择并启动店铺 ==========
        print_step(4, "启动第一个店铺")

        shop_id = shops[0]['browserOauth']
        print(f"选择店铺ID: {shop_id}")

        driver = manager.start_browser(
            shop_id=shop_id,
            chromedriver_path=config['chromedriver_path']
        )

        if not driver:
            print("[FAIL] 启动店铺失败!")
            return False

        print("[OK] 店铺启动成功")
        print(f"当前URL: {driver.current_url}")

        # ========== 步骤5: 初始化安全管理器 ==========
        print_step(5, "初始化安全管理器")

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

        # ========== 步骤6: 读取Excel数据 ==========
        print_step(6, "读取商品数据")

        excel_reader = ExcelReader(config['excel_path'])

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
            print(f"    标题: {product.get('title', 'N/A')[:50]}...")
            print(f"    品牌: {product.get('brand', 'N/A')}")
            print(f"    价格: {product.get('price', 'N/A')}")
            print(f"    SKU: {product.get('sku', 'N/A')}")

        if len(products) > 3:
            print(f"\n  ... 还有 {len(products)-3} 个商品")

        # ========== 步骤7: 初始化亚马逊上传器 ==========
        print_step(7, "初始化亚马逊上传器")

        uploader = AmazonUploader(driver, wait_timeout=30)
        print("[OK] 上传器初始化完成")

        # ========== 步骤8: 导航到添加商品页面 ==========
        print_step(8, "导航到添加商品页面")

        print("\n[WARN] 注意: 此步骤需要手动操作或实际的页面元素定位")
        print("当前这是一个框架测试,实际上传需要:")
        print("  1. 分析亚马逊添加商品页面的元素结构")
        print("  2. 更新 AmazonUploader 中的元素定位符")
        print("  3. 实现完整的表单填写逻辑")

        # 显示当前页面信息
        print(f"\n当前页面标题: {driver.title}")
        print(f"当前页面URL: {driver.current_url}")

        # ========== 步骤9: 等待用户检查 ==========
        print_step(9, "用户验证")

        print("\n浏览器窗口已打开,你可以:")
        print("  1. 检查浏览器是否正常显示")
        print("  2. 手动导航到添加商品页面")
        print("  3. 检查页面元素")
        print("  4. 测试表单填写")

        input("\n按 Enter 键继续测试,或 Ctrl+C 中止...")

        # ========== 步骤10: 测试第一个商品 ==========
        print_step(10, "测试上传第一个商品(模拟)")

        if products:
            test_product = products[0]
            print(f"\n测试商品信息:")
            print(f"  标题: {test_product.get('title', 'N/A')}")
            print(f"  品牌: {test_product.get('brand', 'N/A')}")
            print(f"  价格: {test_product.get('price', 'N/A')}")
            print(f"  SKU: {test_product.get('sku', 'N/A')}")

            print("\n[WARN] 实际上传逻辑待实现")
            print("需要根据实际亚马逊页面结构完成以下功能:")
            print("  - 填写商品标题")
            print("  - 填写品牌名称")
            print("  - 填写商品描述")
            print("  - 上传商品图片")
            print("  - 设置价格和库存")
            print("  - 提交商品信息")

        # ========== 测试总结 ==========
        print("\n" + "="*70)
        print("测试总结")
        print("="*70)
        print("[OK] 紫鸟浏览器连接: 成功")
        print("[OK] 账号登录: 成功")
        print("[OK] 店铺启动: 成功")
        print("[OK] 安全检查: 成功")
        print("[OK] 数据读取: 成功")
        print("[WARN] 商品上传: 需要实际页面元素定位")
        print("\n下一步工作:")
        print("  1. 使用 universal_page_analyzer.py 分析亚马逊添加商品页面")
        print("  2. 更新 AmazonUploader 的元素定位代码")
        print("  3. 实现完整的表单填写逻辑")
        print("  4. 实现图片上传功能")
        print("  5. 添加错误处理和重试机制")

        input("\n按 Enter 键关闭浏览器...")

        return True

    except KeyboardInterrupt:
        print("\n\n[WARN] 用户中止测试")
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
            print("关闭浏览器...")
            try:
                driver.quit()
                print("[OK] 浏览器已关闭")
            except:
                pass

        if manager:
            print("停止紫鸟浏览器...")
            try:
                manager.stop_client()
                print("[OK] 紫鸟浏览器已停止")
            except:
                pass

        print("\n测试完成!")


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
