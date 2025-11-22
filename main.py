"""
紫鸟RPA主程序
亚马逊商品批量上架工具
"""

import sys
import os
import time
import argparse

# 添加src目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager
from ziniao_rpa.modules.excel_reader import ExcelReader, create_template_excel
from ziniao_rpa.modules.amazon_uploader import AmazonUploader
from ziniao_rpa.utils.config_loader import ConfigLoader


def print_banner():
    """打印程序横幅"""
    banner = """
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           紫鸟RPA - 亚马逊商品批量上架工具                  ║
║                                                           ║
║               Powered by Ziniao Browser                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    """
    print(banner)


def create_config_template():
    """创建配置文件模板"""
    template_path = "config/config.yaml.example"
    target_path = "config/config.yaml"

    if os.path.exists(target_path):
        print(f"[WARN] 配置文件已存在: {target_path}")
        return False

    try:
        import shutil
        os.makedirs("config", exist_ok=True)
        shutil.copy(template_path, target_path)
        print(f"[OK] 配置文件已创建: {target_path}")
        print("[INFO] 请编辑配置文件后再运行程序")
        return True
    except Exception as e:
        print(f"[ERROR] 创建配置文件失败: {e}")
        return False


def create_excel_template():
    """创建Excel模板"""
    output_path = "data/input/products_template.xlsx"

    try:
        os.makedirs("data/input", exist_ok=True)
        create_template_excel(output_path)
        print(f"[OK] Excel模板已创建: {output_path}")
        return True
    except Exception as e:
        print(f"[ERROR] 创建Excel模板失败: {e}")
        return False


def main_upload(config_path: str = "config/config.yaml"):
    """
    主上传流程

    Args:
        config_path: 配置文件路径
    """
    # 1. 加载配置
    print("\n[1/6] 加载配置文件...")
    config = ConfigLoader(config_path)
    if not config.load():
        print("[ERROR] 配置加载失败")
        return False

    if not config.validate():
        print("[ERROR] 配置验证失败")
        return False

    config.print_config()

    # 2. 读取Excel数据
    print("\n[2/6] 读取商品数据...")
    excel_path = config.get('data.input_excel')
    sheet_name = config.get('data.sheet_name') or 0

    reader = ExcelReader(excel_path)
    if not reader.load(sheet_name):
        print("[ERROR] Excel数据加载失败")
        return False

    # 验证必需列
    required_columns = config.get('data.required_columns', [])
    if required_columns and not reader.validate_columns(required_columns):
        print("[ERROR] Excel数据格式不符合要求")
        return False

    products = reader.get_products()
    print(f"[OK] 成功读取 {len(products)} 个商品")
    reader.print_sample(3)

    # 3. 启动紫鸟浏览器
    print("\n[3/6] 启动紫鸟浏览器...")
    client_path = config.get('ziniao.client_path')
    port = config.get('ziniao.port', 8848)

    manager = ZiniaoManager(client_path, port)
    if not manager.start_client():
        print("[ERROR] 紫鸟浏览器启动失败")
        return False

    try:
        # 4. 登录紫鸟账号
        print("\n[4/6] 登录紫鸟账号...")
        company = config.get('ziniao.account.company')
        username = config.get('ziniao.account.username')
        password = config.get('ziniao.account.password')

        if not manager.login(company, username, password):
            print("[ERROR] 登录失败")
            return False

        # 5. 获取并启动店铺浏览器
        print("\n[5/6] 启动店铺浏览器...")

        browsers = manager.get_browser_list()
        if not browsers:
            print("[ERROR] 没有可用的店铺")
            return False

        print(f"\n可用店铺列表:")
        for idx, browser in enumerate(browsers, 1):
            print(f"  {idx}. {browser.get('name', '未命名')} "
                  f"({browser.get('platform', '未知平台')})")

        # 选择第一个店铺(可以改为用户输入)
        target_browser = browsers[0]
        browser_oauth = target_browser.get('browserOauth')

        print(f"\n[INFO] 使用店铺: {target_browser.get('name', '未命名')}")

        browser_info = manager.start_browser(browser_oauth)
        if not browser_info:
            print("[ERROR] 启动店铺浏览器失败")
            return False

        # 6. 创建WebDriver并上传商品
        print("\n[6/6] 开始上传商品...")

        chromedriver_path = config.get('chromedriver.path')

        driver = manager.create_webdriver(browser_info, chromedriver_path)
        if not driver:
            print("[ERROR] 创建WebDriver失败")
            return False

        try:
            # 创建上传器
            wait_timeout = config.get('settings.element_wait_timeout', 30)
            uploader = AmazonUploader(driver, wait_timeout)

            # 批量上传
            results = uploader.batch_upload(products)

            # 打印结果
            print(f"\n{'='*60}")
            print("上传任务完成!")
            print(f"{'='*60}")
            print(f"总计: {results['total']}")
            print(f"成功: {results['success']}")
            print(f"失败: {results['failed']}")
            print(f"成功率: {results['success']/results['total']*100:.1f}%")
            print(f"{'='*60}\n")

            return results['failed'] == 0

        finally:
            print("[INFO] 关闭WebDriver...")
            driver.quit()

    finally:
        # 清理
        print("[INFO] 清理资源...")
        manager.shutdown()


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='紫鸟RPA - 亚马逊商品批量上架工具'
    )

    parser.add_argument(
        'command',
        choices=['upload', 'init', 'template'],
        help='执行命令: upload(上传商品), init(初始化配置), template(创建模板)'
    )

    parser.add_argument(
        '-c', '--config',
        default='config/config.yaml',
        help='配置文件路径 (默认: config/config.yaml)'
    )

    args = parser.parse_args()

    print_banner()

    if args.command == 'init':
        # 初始化配置
        print("[INFO] 初始化配置文件...")
        if create_config_template():
            print("\n[SUCCESS] 初始化完成!")
            print("[INFO] 下一步: 编辑 config/config.yaml 文件")
        else:
            print("\n[FAILED] 初始化失败")

    elif args.command == 'template':
        # 创建Excel模板
        print("[INFO] 创建Excel模板...")
        if create_excel_template():
            print("\n[SUCCESS] 模板创建完成!")
            print("[INFO] 下一步: 填写商品数据到 data/input/products_template.xlsx")
        else:
            print("\n[FAILED] 模板创建失败")

    elif args.command == 'upload':
        # 执行上传
        print("[INFO] 开始上传流程...\n")
        start_time = time.time()

        success = main_upload(args.config)

        elapsed_time = time.time() - start_time
        print(f"\n总耗时: {elapsed_time:.1f}秒")

        if success:
            print("\n[SUCCESS] 所有商品上传成功!")
            sys.exit(0)
        else:
            print("\n[FAILED] 部分商品上传失败,请查看日志")
            sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[WARN] 程序被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] 程序异常: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
