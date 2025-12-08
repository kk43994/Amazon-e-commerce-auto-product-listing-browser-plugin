"""
分析亚马逊添加商品页面的元素
这个脚本会帮助我们找到所有需要填写的表单字段
"""
import sys
import os
import time
import json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ziniao_rpa.core.ziniao_manager import ZiniaoManager

def analyze_page(driver):
    """分析页面上的所有输入元素"""
    print("\n" + "="*70)
    print("分析页面元素...")
    print("="*70)

    # 执行JavaScript获取所有表单元素
    script = """
    const elements = [];

    // 查找所有input元素
    document.querySelectorAll('input').forEach((el, idx) => {
        elements.push({
            type: 'input',
            inputType: el.type,
            id: el.id || '',
            name: el.name || '',
            placeholder: el.placeholder || '',
            value: el.value || '',
            class: el.className || '',
            xpath: getXPath(el)
        });
    });

    // 查找所有textarea元素
    document.querySelectorAll('textarea').forEach((el, idx) => {
        elements.push({
            type: 'textarea',
            id: el.id || '',
            name: el.name || '',
            placeholder: el.placeholder || '',
            class: el.className || '',
            xpath: getXPath(el)
        });
    });

    // 查找所有select元素
    document.querySelectorAll('select').forEach((el, idx) => {
        elements.push({
            type: 'select',
            id: el.id || '',
            name: el.name || '',
            class: el.className || '',
            xpath: getXPath(el)
        });
    });

    // 查找所有按钮
    document.querySelectorAll('button').forEach((el, idx) => {
        elements.push({
            type: 'button',
            id: el.id || '',
            text: el.textContent.trim().substring(0, 30),
            class: el.className || '',
            xpath: getXPath(el)
        });
    });

    // 辅助函数: 生成XPath
    function getXPath(element) {
        if (element.id !== '') {
            return '//*[@id="' + element.id + '"]';
        }
        if (element === document.body) {
            return '/html/body';
        }
        let ix = 0;
        const siblings = element.parentNode.childNodes;
        for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling === element) {
                return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
            }
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                ix++;
            }
        }
    }

    return elements;
    """

    try:
        elements = driver.execute_script(script)

        print(f"\n找到 {len(elements)} 个表单元素\n")

        # 按类型分组
        by_type = {}
        for el in elements:
            el_type = el['type']
            if el_type not in by_type:
                by_type[el_type] = []
            by_type[el_type].append(el)

        # 显示每种类型的元素
        for el_type, items in by_type.items():
            print(f"\n{el_type.upper()} 元素 ({len(items)}个):")
            print("-" * 70)
            for idx, item in enumerate(items[:10], 1):  # 只显示前10个
                print(f"\n{idx}.")
                if item.get('id'):
                    print(f"  ID: {item['id']}")
                if item.get('name'):
                    print(f"  Name: {item['name']}")
                if item.get('placeholder'):
                    print(f"  Placeholder: {item['placeholder']}")
                if item.get('text'):
                    print(f"  Text: {item['text']}")
                if item.get('inputType'):
                    print(f"  Type: {item['inputType']}")
                print(f"  XPath: {item['xpath'][:80]}...")

            if len(items) > 10:
                print(f"\n... 还有 {len(items) - 10} 个 {el_type} 元素")

        # 保存完整数据到文件
        output_file = "amazon_page_elements.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(elements, f, ensure_ascii=False, indent=2)

        print(f"\n\n完整元素信息已保存到: {output_file}")

        return elements

    except Exception as e:
        print(f"[ERROR] 分析页面失败: {e}")
        return None

def main():
    print("="*70)
    print(" 亚马逊页面元素分析工具")
    print("="*70)

    # 连接到正在运行的浏览器
    manager = ZiniaoManager(r"D:\ziniao\ziniao.exe", 8848)

    print("\n[INFO] 连接到紫鸟浏览器...")
    if not manager._check_connection():
        print("[ERROR] 无法连接到紫鸟浏览器!")
        print("请确保 test_with_navigation.py 正在运行")
        return

    print("[OK] 已连接到紫鸟")

    # 从正在运行的脚本获取浏览器信息
    # 由于我们无法直接获取,让用户手动提供调试端口
    print("\n请提供浏览器调试端口号:")
    print("(可以在 test_with_navigation.py 的输出中找到)")

    # 或者我们可以创建一个简化版本,直接读取之前保存的信息
    # 这里我先硬编码使用最近一次的端口

    # 实际上,让我们改用另一个方法...

if __name__ == "__main__":
    main()
