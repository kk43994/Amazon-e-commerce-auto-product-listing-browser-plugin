"""
通用页面结构分析工具
可以分析任何通过Selenium打开的页面
"""

import sys
import time
import json
from datetime import datetime
from selenium.webdriver.common.by import By

sys.path.insert(0, 'src')
from ziniao_rpa.core.ziniao_manager import ZiniaoManager


class UniversalPageAnalyzer:
    """通用页面分析器"""

    def __init__(self, driver):
        self.driver = driver

    def analyze(self, save_prefix="page"):
        """
        分析当前页面

        Args:
            save_prefix: 保存文件的前缀

        Returns:
            dict: 页面分析结果
        """
        print("="*70)
        print("通用页面结构分析工具")
        print("="*70)

        result = {
            'timestamp': datetime.now().isoformat(),
            'url': self.driver.current_url,
            'title': self.driver.title,
            'elements': {}
        }

        # 1. 基本信息
        print(f"\n[基本信息]")
        print(f"URL: {result['url']}")
        print(f"标题: {result['title']}")

        # 2. 分析所有表单元素
        print(f"\n[分析表单元素]")
        result['elements'] = self._analyze_elements()

        # 3. 查找所有链接
        print(f"\n[分析链接]")
        result['links'] = self._analyze_links()

        # 4. 保存页面源码
        print(f"\n[保存页面数据]")
        html_file = f"logs/{save_prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(self.driver.page_source)
        print(f"HTML: {html_file}")

        # 5. 保存截图
        screenshot_file = f"logs/{save_prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        self.driver.save_screenshot(screenshot_file)
        print(f"截图: {screenshot_file}")

        # 6. 保存JSON
        json_file = f"logs/{save_prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"JSON: {json_file}")

        return result

    def _analyze_elements(self):
        """分析所有表单元素"""

        elements = {
            'inputs': [],
            'textareas': [],
            'selects': [],
            'buttons': []
        }

        # 分析input元素
        print("  - 分析input元素...")
        inputs = self.driver.find_elements(By.TAG_NAME, "input")
        for inp in inputs:
            try:
                elements['inputs'].append({
                    'id': inp.get_attribute('id') or '',
                    'name': inp.get_attribute('name') or '',
                    'type': inp.get_attribute('type') or 'text',
                    'placeholder': inp.get_attribute('placeholder') or '',
                    'class': inp.get_attribute('class') or '',
                    'value': inp.get_attribute('value') or '',
                    'required': inp.get_attribute('required') is not None
                })
            except:
                continue
        print(f"    找到 {len(elements['inputs'])} 个input")

        # 分析textarea元素
        print("  - 分析textarea元素...")
        textareas = self.driver.find_elements(By.TAG_NAME, "textarea")
        for ta in textareas:
            try:
                elements['textareas'].append({
                    'id': ta.get_attribute('id') or '',
                    'name': ta.get_attribute('name') or '',
                    'placeholder': ta.get_attribute('placeholder') or '',
                    'class': ta.get_attribute('class') or '',
                    'required': ta.get_attribute('required') is not None
                })
            except:
                continue
        print(f"    找到 {len(elements['textareas'])} 个textarea")

        # 分析select元素
        print("  - 分析select元素...")
        selects = self.driver.find_elements(By.TAG_NAME, "select")
        for sel in selects:
            try:
                options = sel.find_elements(By.TAG_NAME, "option")
                elements['selects'].append({
                    'id': sel.get_attribute('id') or '',
                    'name': sel.get_attribute('name') or '',
                    'class': sel.get_attribute('class') or '',
                    'required': sel.get_attribute('required') is not None,
                    'options': [opt.text for opt in options[:10]]  # 只取前10个选项
                })
            except:
                continue
        print(f"    找到 {len(elements['selects'])} 个select")

        # 分析button元素
        print("  - 分析button元素...")
        buttons = self.driver.find_elements(By.TAG_NAME, "button")
        for btn in buttons:
            try:
                elements['buttons'].append({
                    'id': btn.get_attribute('id') or '',
                    'text': btn.text.strip()[:50],
                    'type': btn.get_attribute('type') or 'button',
                    'class': btn.get_attribute('class') or ''
                })
            except:
                continue
        print(f"    找到 {len(elements['buttons'])} 个button")

        return elements

    def _analyze_links(self):
        """分析所有链接"""

        links = []

        print("  - 分析链接...")
        all_links = self.driver.find_elements(By.TAG_NAME, "a")

        for link in all_links[:100]:  # 只分析前100个链接
            try:
                href = link.get_attribute('href')
                text = link.text.strip()

                if href:
                    links.append({
                        'text': text[:50],
                        'href': href,
                        'id': link.get_attribute('id') or ''
                    })
            except:
                continue

        print(f"    找到 {len(links)} 个链接")
        return links

    def print_summary(self, result):
        """打印分析摘要"""

        print("\n" + "="*70)
        print("分析摘要")
        print("="*70)

        print(f"\n表单元素:")
        print(f"  Input字段: {len(result['elements']['inputs'])}")
        print(f"  Textarea字段: {len(result['elements']['textareas'])}")
        print(f"  Select下拉框: {len(result['elements']['selects'])}")
        print(f"  按钮: {len(result['elements']['buttons'])}")
        print(f"  链接: {len(result['links'])}")

        # 显示一些重要的input
        print(f"\n重要的Input字段(有ID的):")
        important_inputs = [inp for inp in result['elements']['inputs'] if inp['id']]
        for inp in important_inputs[:10]:
            print(f"  - {inp['id']} (type={inp['type']})")
            if inp['placeholder']:
                print(f"    placeholder: {inp['placeholder']}")

        # 显示重要的按钮
        print(f"\n重要的按钮(有文本的):")
        important_buttons = [btn for btn in result['elements']['buttons'] if btn['text']]
        for btn in important_buttons[:10]:
            print(f"  - {btn['text']}")
            if btn['id']:
                print(f"    id: {btn['id']}")


def main():
    """主函数"""

    print("="*70)
    print("通用页面分析工具")
    print("="*70)

    # 配置
    ZINIAO_PATH = r"D:\ziniao\ziniao.exe"
    USERNAME = "banbantt"
    PASSWORD = "Zjk15161671594"
    SECURITY_PASSWORD = "Zjk15161671594"
    PORT = 8848

    print("\n[1/5] 启动紫鸟...")
    manager = ZiniaoManager(ZINIAO_PATH, PORT)
    if not manager.start_client():
        print("启动失败")
        return
    print("[OK] 紫鸟已启动")

    print("\n[2/5] 登录账号...")
    if not manager.login(USERNAME, PASSWORD, SECURITY_PASSWORD):
        print("登录失败")
        return
    print("[OK] 登录成功")

    print("\n[3/5] 启动浏览器...")
    browsers = manager.get_browser_list()
    if not browsers:
        print("获取店铺失败")
        return

    browser_oauth = browsers[0].get('browserOauth')
    browser_info = manager.start_browser(browser_oauth, load_cookie=True)
    if not browser_info:
        print("浏览器启动失败")
        return
    print("[OK] 浏览器已启动")

    time.sleep(3)

    driver = manager.create_webdriver(browser_info, "chromedriver.exe")
    if not driver:
        print("WebDriver创建失败")
        return

    try:
        print("\n[4/5] 导航到页面...")

        # 让用户选择要分析的页面
        print("\n请选择要分析的页面:")
        print("  1. 亚马逊卖家中心首页")
        print("  2. 自定义URL")

        choice = input("\n选择 (1-2): ").strip()

        if choice == "1":
            url = "https://sellercentral-japan.amazon.com/home"
        else:
            url = input("请输入URL: ").strip()
            if not url.startswith('http'):
                url = "https://" + url

        print(f"\n正在访问: {url}")
        driver.get(url)
        time.sleep(5)

        print(f"[OK] 页面已加载")
        print(f"     当前URL: {driver.current_url}")
        print(f"     页面标题: {driver.title}")

        print("\n[5/5] 分析页面...")
        analyzer = UniversalPageAnalyzer(driver)
        result = analyzer.analyze(save_prefix="analyzed_page")

        analyzer.print_summary(result)

        print("\n" + "="*70)
        print("分析完成!")
        print("="*70)
        print("\n你可以:")
        print("1. 查看 logs/ 目录下的HTML/JSON/PNG文件")
        print("2. 在浏览器中继续导航到其他页面")
        print("3. 按Enter键重新分析当前页面")
        print("4. 输入q退出")

        while True:
            cmd = input("\n命令 (Enter=重新分析, q=退出): ").strip().lower()

            if cmd == 'q':
                break
            else:
                # 重新分析当前页面
                print("\n重新分析当前页面...")
                result = analyzer.analyze(save_prefix="analyzed_page")
                analyzer.print_summary(result)

    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        print(traceback.format_exc())

    finally:
        print("\n浏览器保持打开状态...")
        input("按Enter键关闭...")


if __name__ == "__main__":
    main()
