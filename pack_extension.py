#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
打包Chrome扩展插件为.zip格式
用于上传到紫鸟浏览器
"""

import os
import zipfile
from pathlib import Path

def create_extension_zip():
    """创建插件zip包"""

    # 定义源目录和输出文件
    source_dir = Path(__file__).parent / "chrome_extension"
    output_file = Path(__file__).parent / "amazon-upload-assistant-v3.0.1.zip"

    # 需要打包的文件类型
    include_files = {
        # 核心文件
        "manifest.json",
        "popup.html",
        "popup.js",
        "content.js",
        "background.js",
        "page-analyzer.js",
        "learning-mode.js",
        # v3新增核心模块
        "page-detector.js",
        "amazon-navigator.js",
        "amazon-form-filler.js",
    }

    # 需要打包的目录
    include_dirs = {
        "icons",
        "libs"
    }

    # 排除的文件
    exclude_patterns = {
        ".py",
        ".md",
        ".txt",
        ".csv"
    }

    print("=" * 70)
    print("打包Chrome扩展插件")
    print("=" * 70)
    print(f"源目录: {source_dir}")
    print(f"输出文件: {output_file}")
    print()

    # 创建zip文件
    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        file_count = 0

        # 添加核心文件
        print("添加核心文件:")
        for filename in include_files:
            filepath = source_dir / filename
            if filepath.exists():
                arcname = filename
                zipf.write(filepath, arcname)
                size_kb = filepath.stat().st_size / 1024
                print(f"  [OK] {filename} ({size_kb:.1f} KB)")
                file_count += 1
            else:
                print(f"  [SKIP] {filename} (not found)")

        print()

        # 添加目录
        for dir_name in include_dirs:
            dir_path = source_dir / dir_name
            if dir_path.exists() and dir_path.is_dir():
                print(f"添加目录: {dir_name}/")
                for root, dirs, files in os.walk(dir_path):
                    for file in files:
                        # 检查是否需要排除
                        if any(file.endswith(ext) for ext in exclude_patterns):
                            continue

                        filepath = Path(root) / file
                        # 计算相对路径
                        arcname = filepath.relative_to(source_dir)
                        zipf.write(filepath, arcname)
                        size_kb = filepath.stat().st_size / 1024
                        print(f"  [OK] {arcname} ({size_kb:.1f} KB)")
                        file_count += 1
                print()

    # 检查zip文件
    zip_size = output_file.stat().st_size / 1024 / 1024  # MB

    print("=" * 70)
    print("打包完成!")
    print("=" * 70)
    print(f"文件数量: {file_count}")
    print(f"文件大小: {zip_size:.2f} MB")
    print(f"保存位置: {output_file}")
    print()
    print("下一步:")
    print("1. 打开紫鸟浏览器")
    print("2. 访问 chrome://extensions/")
    print("3. 开启'开发者模式'")
    print("4. 点击'加载已解压的扩展程序'或'上传扩展'")
    print("5. 选择这个.zip文件")
    print()

    # 验证zip文件内容
    print("=" * 70)
    print("zip文件内容验证:")
    print("=" * 70)
    with zipfile.ZipFile(output_file, 'r') as zipf:
        for info in zipf.filelist:
            print(f"  {info.filename} ({info.file_size} bytes)")

    print("=" * 70)

if __name__ == "__main__":
    create_extension_zip()
