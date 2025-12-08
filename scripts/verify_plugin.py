#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Chrome扩展插件完整性验证脚本
验证所有必需文件是否存在且有效
"""

import os
import json
from pathlib import Path

def check_file(filepath, min_size=0, description=""):
    """检查文件是否存在且大小合适"""
    if not os.path.exists(filepath):
        return False, f"❌ 文件不存在: {description}"

    size = os.path.getsize(filepath)
    if size < min_size:
        return False, f"❌ 文件太小 ({size} bytes): {description}"

    size_kb = size / 1024
    return True, f"✅ {description} ({size_kb:.1f} KB)"

def main():
    print("=" * 70)
    print("🔍 Chrome扩展插件完整性验证")
    print("=" * 70)
    print()

    base_dir = Path(__file__).parent
    all_good = True

    # 1. 核心配置文件
    print("📋 核心配置文件:")
    print("-" * 70)

    files_to_check = [
        ("manifest.json", 500, "插件配置文件"),
        ("popup.html", 5000, "用户界面HTML"),
        ("popup.js", 10000, "用户界面逻辑"),
        ("content.js", 5000, "内容脚本"),
        ("background.js", 500, "后台服务"),
        ("page-analyzer.js", 5000, "页面分析器"),
        ("learning-mode.js", 8000, "学习模式"),
    ]

    for filename, min_size, desc in files_to_check:
        filepath = base_dir / filename
        ok, msg = check_file(filepath, min_size, desc)
        print(msg)
        if not ok:
            all_good = False

    print()

    # 2. 依赖库
    print("📚 依赖库文件:")
    print("-" * 70)

    xlsx_path = base_dir / "libs" / "xlsx.full.min.js"
    ok, msg = check_file(xlsx_path, 800000, "SheetJS Excel处理库")
    print(msg)
    if not ok:
        all_good = False
        print("   💡 下载命令: curl -o libs/xlsx.full.min.js https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js")

    print()

    # 3. 图标文件
    print("🎨 图标文件:")
    print("-" * 70)

    icon_sizes = [16, 48, 128]
    for size in icon_sizes:
        icon_path = base_dir / "icons" / f"icon{size}.png"
        ok, msg = check_file(icon_path, 50, f"图标 {size}x{size}")
        print(msg)
        if not ok:
            all_good = False

    print()

    # 4. 文档文件
    print("📖 文档文件:")
    print("-" * 70)

    doc_files = [
        ("README.md", 1000, "功能说明"),
        ("INSTALLATION.md", 1000, "安装指南"),
        ("CHECKLIST.txt", 500, "使用检查清单"),
        ("学习模式使用说明.md", 1000, "学习模式文档"),
        ("product_template.csv", 100, "Excel模板"),
    ]

    for filename, min_size, desc in doc_files:
        filepath = base_dir / filename
        ok, msg = check_file(filepath, min_size, desc)
        print(msg)
        if not ok:
            all_good = False

    print()

    # 5. 验证manifest.json内容
    print("🔧 配置验证:")
    print("-" * 70)

    manifest_path = base_dir / "manifest.json"
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)

        # 检查必需字段
        required_fields = ['manifest_version', 'name', 'version', 'description']
        for field in required_fields:
            if field in manifest:
                print(f"✅ {field}: {manifest[field]}")
            else:
                print(f"❌ 缺少必需字段: {field}")
                all_good = False

        # 检查权限
        if 'permissions' in manifest:
            print(f"✅ 权限配置: {', '.join(manifest['permissions'])}")

        # 检查主机权限
        if 'host_permissions' in manifest:
            print(f"✅ 支持站点数: {len(manifest['host_permissions'])} 个")

    except Exception as e:
        print(f"❌ manifest.json解析失败: {e}")
        all_good = False

    print()
    print("=" * 70)

    # 最终结果
    if all_good:
        print("🎉 所有检查通过! 插件已准备就绪!")
        print()
        print("📋 下一步:")
        print("   1. 打开Chrome浏览器")
        print("   2. 访问 chrome://extensions/")
        print("   3. 开启'开发者模式'")
        print("   4. 点击'加载已解压的扩展程序'")
        print("   5. 选择 chrome_extension 文件夹")
        print()
        print("📚 使用指南:")
        print("   - 查看 INSTALLATION.md 了解详细安装步骤")
        print("   - 查看 CHECKLIST.txt 获取使用检查清单")
        print("   - 查看 README.md 了解完整功能")
    else:
        print("⚠️  发现问题,请修复后重试")

    print("=" * 70)

if __name__ == "__main__":
    main()
