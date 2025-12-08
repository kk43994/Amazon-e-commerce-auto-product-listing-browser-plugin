"""
分析当前打开的亚马逊添加商品页面
提取所有表单元素的定位信息
"""
import sys
import os
import time
import json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager

def analyze_page_elements(driver):
    """分析页面元素并保存"""
    print("\n" + "="*70)
    print("正在分析页面元素...")
    print("="*70)

    # JavaScript脚本:扫描所有表单元素
    script = """
    const elements = [];

    // 扫描所有input
    document.querySelectorAll('input').forEach((el, idx) => {
        // 只收集可见的元素
        if (el.offsetParent !== null || el.type === 'hidden') {
            const rect = el.getBoundingClientRect();
            elements.push({
                type: 'input',
                inputType: el.type,
                id: el.id || '',
                name: el.name || '',
                placeholder: el.placeholder || '',
                value: el.value || '',
                className: el.className || '',
                required: el.required,
                visible: el.offsetParent !== null,
                label: findLabelText(el),
                ariaLabel: el.getAttribute('aria-label') || '',
                position: {
                    top: Math.round(rect.top),
                    left: Math.round(rect.left)
                }
            });
        }
    });

    // 扫描所有textarea
    document.querySelectorAll('textarea').forEach((el, idx) => {
        if (el.offsetParent !== null) {
            const rect = el.getBoundingClientRect();
            elements.push({
                type: 'textarea',
                id: el.id || '',
                name: el.name || '',
                placeholder: el.placeholder || '',
                className: el.className || '',
                label: findLabelText(el),
                ariaLabel: el.getAttribute('aria-label') || '',
                position: {
                    top: Math.round(rect.top),
                    left: Math.round(rect.left)
                }
            });
        }
    });

    // 扫描所有select
    document.querySelectorAll('select').forEach((el, idx) => {
        if (el.offsetParent !== null) {
            const rect = el.getBoundingClientRect();
            const options = Array.from(el.options).map(opt => opt.text);
            elements.push({
                type: 'select',
                id: el.id || '',
                name: el.name || '',
                className: el.className || '',
                label: findLabelText(el),
                ariaLabel: el.getAttribute('aria-label') || '',
                options: options.slice(0, 5), // 只保存前5个选项
                position: {
                    top: Math.round(rect.top),
                    left: Math.round(rect.left)
                }
            });
        }
    });

    // 扫描所有button
    document.querySelectorAll('button').forEach((el, idx) => {
        if (el.offsetParent !== null) {
            elements.push({
                type: 'button',
                id: el.id || '',
                text: el.textContent.trim().substring(0, 50),
                className: el.className || '',
                buttonType: el.type || 'button'
            });
        }
    });

    // 辅助函数:查找关联的label文本
    function findLabelText(element) {
        // 方法1: 通过for属性关联
        if (element.id) {
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label) return label.textContent.trim();
        }

        // 方法2: 父级label
        const parentLabel = element.closest('label');
        if (parentLabel) {
            const clone = parentLabel.cloneNode(true);
            // 移除输入框,只保留文本
            const inputs = clone.querySelectorAll('input, textarea, select');
            inputs.forEach(inp => inp.remove());
            return clone.textContent.trim();
        }

        // 方法3: 前一个兄弟节点
        let prev = element.previousElementSibling;
        if (prev && prev.tagName === 'LABEL') {
            return prev.textContent.trim();
        }

        return '';
    }

    return elements;
    """

    try:
        elements = driver.execute_script(script)

        # 保存到JSON文件
        output_file = "amazon_add_product_page.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(elements, f, ensure_ascii=False, indent=2)

        print(f"[OK] 找到 {len(elements)} 个元素")
        print(f"[OK] 已保存到: {output_file}")

        # 按类型统计
        by_type = {}
        for el in elements:
            t = el['type']
            by_type[t] = by_type.get(t, 0) + 1

        print("\n元素统计:")
        for t, count in by_type.items():
            print(f"  {t}: {count} 个")

        # 显示前20个重要元素
        print("\n" + "="*70)
        print("前20个重要的表单元素:")
        print("="*70)

        important = [el for el in elements if el['type'] in ['input', 'textarea', 'select'] and el.get('visible', True)]

        for i, el in enumerate(important[:20], 1):
            label = el.get('label', '') or el.get('ariaLabel', '') or el.get('placeholder', '')
            el_id = el.get('id', '')
            el_name = el.get('name', '')

            print(f"\n{i}. {el['type'].upper()}")
            if label:
                print(f"   标签: {label[:50]}")
            if el_id:
                print(f"   ID: {el_id}")
            if el_name:
                print(f"   Name: {el_name}")
            if el.get('inputType'):
                print(f"   类型: {el['inputType']}")

        return elements

    except Exception as e:
        print(f"[ERROR] 分析失败: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    print("="*70)
    print(" 分析亚马逊添加商品页面")
    print("="*70)

    # 连接到紫鸟
    manager = ZiniaoManager(r"D:\ziniao\ziniao.exe", 8848)

    print("\n[步骤 1/5] 启动紫鸟...")
    if not manager.start_client():
        return

    try:
        print("\n[步骤 2/5] 登录...")
        if not manager.login("banbantt", "Abanbantt", "~Abanbantt"):
            return

        print("\n[步骤 3/5] 获取店铺...")
        browsers = manager.get_browser_list()
        if not browsers:
            return

        browser_oauth = browsers[0].get('browserOauth')
        print(f"[OK] 使用店铺: {browsers[0].get('browserName')}")

        print("\n[步骤 4/5] 启动浏览器...")
        browser_info = manager.start_browser(browser_oauth, load_cookie=True)
        if not browser_info:
            return

        launcher_page = browser_info.get('launcherPage')
        time.sleep(5)

        driver = manager.create_webdriver(
            browser_info,
            os.path.abspath("drivers/chromedriver137.exe")
        )

        if not driver:
            return

        # 导航到店铺页面
        if driver.current_url in ["about:blank", "data:,"]:
            print(f"[INFO] 导航到: {launcher_page}")
            driver.get(launcher_page)
            time.sleep(5)

        print(f"[OK] 当前页面: {driver.title}")
        print(f"[OK] URL: {driver.current_url}")

        print("\n[步骤 5/5] 等待您手动导航到添加商品页面...")
        print("\n请在浏览器中:")
        print("  1. 导航到'添加商品'页面")
        print("  2. 等待页面完全加载")
        print("  3. 然后按Enter继续分析")

        input("\n按Enter开始分析...")

        # 分析页面
        print("\n正在分析页面...")
        elements = analyze_page_elements(driver)

        if elements:
            print("\n" + "="*70)
            print("分析完成!")
            print("="*70)
            print(f"\n请查看 amazon_add_product_page.json 了解完整的元素信息")
            print("\n现在可以根据这些元素信息编写自动填写脚本")

        print("\n浏览器保持打开,按Ctrl+C退出...")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n退出...")
            driver.quit()
            manager.stop_browser(browser_oauth)

    finally:
        manager.shutdown()

if __name__ == "__main__":
    main()
