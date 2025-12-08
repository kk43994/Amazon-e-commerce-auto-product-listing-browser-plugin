# 🚀 亚马逊商品快速上传助手

> Chrome浏览器扩展 - 简单、快速、智能

[![Version](https://img.shields.io/badge/version-6.0-blue.svg)](https://github.com/kk43994/Amazon-e-commerce-auto-product-listing-browser-plugin/releases)
[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)
[![Chrome](https://img.shields.io/badge/Chrome-Extension-green.svg)](chrome_extension/)

---

## 📖 项目简介

本项目为亚马逊卖家提供**Chrome浏览器扩展**，实现从CSV/Excel表格批量导入商品数据，一键自动填写亚马逊商品上传表单。

**为什么选择浏览器扩展？**
- ✅ 用户已登录，无需重复登录
- ✅ 已在目标页面，无需复杂导航
- ✅ 智能元素匹配，无需硬编码
- ✅ 3步操作：打开页面 → 导入CSV → 完成
- ✅ 支持真人行为模拟
- ✅ 支持批量处理

---

## ✨ 核心功能

### 🎯 完整页面覆盖
- ✅ **产品详情页** - 40个字段（标题、品牌、描述、要点等）
- ✅ **安全合规页** - 11个字段（原产国、保修、认证等）
- ✅ **报价页** - 18个字段（SKU、价格、库存、礼品选项等）
- ✅ **变体页** - 多行变体支持、矩阵自动填写
- ✅ **图片页** - 主图 + 8张附加图

### 📊 CSV模板（v6.0新特性）
- ✅ **完整模板** - 78个字段全覆盖
- ✅ **中文注释** - 详细填写说明（必填/选填、格式要求）
- ✅ **智能识别** - 自动跳过注释行
- ✅ **多格式兼容** - 支持下划线和驼峰命名

示例：
```csv
asin,item_name,brand_name,sku,quantity,your_price,...
ASIN(选填),商品名称(必填|最多200字),品牌名(必填),SKU编号(必填),...
B0008XXX,测试商品,TestBrand,SKU-001,100,49.99,...
```

### 🤖 智能自动化
- ✅ **批量导入** - 支持CSV/Excel批量导入
- ✅ **真人模拟** - 模拟真人打字速度
- ✅ **智能匹配** - 多语言字段自动识别
- ✅ **暂停/继续** - 随时暂停和恢复
- ✅ **错误处理** - 失败重试、详细日志

---

## 📥 快速开始

### 1. 下载扩展

**GitHub Release:**
```
https://github.com/kk43994/Amazon-e-commerce-auto-product-listing-browser-plugin/releases/tag/v6.0
```

下载 `amazon-upload-assistant-v6.0.zip` 并解压。

### 2. 安装扩展

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择解压后的 `chrome_extension` 文件夹
6. 完成！

### 3. 准备CSV模板

下载 `wanzhengbiaodan.csv` 模板：
- 第1行：英文字段名（程序读取）
- 第2行：中文详细注释（用户参考）
- 第3行开始：填写商品数据

### 4. 使用步骤

```
1. 登录亚马逊卖家后台
   ↓
2. 打开"添加商品"页面
   ↓
3. 点击扩展图标 → 选择CSV文件
   ↓
4. 点击"开始全自动上传" → 完成！
```

---

## 📋 支持的字段（78个）

### 产品详情页（40字段）
- `item_name` - 商品名称 ⭐必填
- `brand_name` - 品牌名称 ⭐必填
- `external_product_id_type` - 外部ID类型（UPC/EAN/JAN）⭐必填
- `external_product_id` - 外部产品ID ⭐必填
- `bullet_point1~5` - 商品要点
- `product_description` - 产品描述
- `material`, `color`, `size` - 材质、颜色、尺寸
- `item_weight`, `item_dimensions` - 重量、尺寸
- ...等40个字段

### 安全合规页（11字段）
- `country_of_origin` - 原产国 ⭐必填
- `dangerous_goods` - 危险品 ⭐必填
- `warranty` - 保修信息
- `responsible_person_email` - 责任人邮箱
- `gpsr_safety_certification` - GPSR认证
- ...等11个字段

### 报价页（18字段）
- `sku` - SKU编号 ⭐必填
- `quantity` - 库存数量 ⭐必填
- `handling_time` - 处理时间 ⭐必填
- `your_price` - 售价 ⭐必填
- `list_price` - 市场价
- `sale_price` - 促销价
- `map_price` - 最低广告价格
- `gift_message`, `gift_wrap` - 礼品选项
- ...等18个字段

### 图片（9字段）
- `main_image` - 主图URL ⭐必填
- `image_1~8` - 附加图URL

---

## 🎨 CSV模板使用说明

### 第2行中文注释格式

```csv
字段名称(要求|说明)
```

**示例：**
- `商品名称(必填|最多200字)` - 必须填写，最多200字
- `售价(必填|纯数字不含货币符号)` - 填写纯数字如：49.99
- `促销价(选填)` - 可选填写
- `日期(选填|YYYY-MM-DD)` - 格式：2024-01-01

### 数据格式要求

| 类型 | 格式 | 示例 |
|------|------|------|
| 文本 | UTF-8文本 | 测试商品 |
| 数字 | 纯数字，无符号 | 49.99 |
| 日期 | YYYY-MM-DD | 2024-01-01 |
| 布尔值 | Yes/No | Yes |
| 枚举 | 具体值 | UPC, New, FBM |
| 网址 | https:// | https://... |

---

## 📚 文档

### 用户文档
- 📖 [CSV使用说明](docs/csv_usage_guide.md) - 详细填写指南
- 📖 [完整字段参考](docs/complete_csv_reference.md) - 所有78个字段
- 📖 [版本更新日志](CHANGELOG_v6.0.md) - v6.0更新内容

### 模板文件
- 📄 `wanzhengbiaodan.csv` - 完整模板（78字段+中文注释）
- 📄 `chanpingxiangqingye_utf8.csv` - 产品详情页模板
- 📄 `baojia.csv` - 报价页模板
- 📄 `anquanyuhegui.csv` - 安全合规模板

---

## 🔧 技术架构

### 核心模块

```
chrome_extension/
├── manifest.json           # 扩展配置
├── popup.html/js          # 用户界面
├── content.js             # 消息处理
├── amazon-form-filler.js  # 表单填写引擎
├── page-detector.js       # 页面检测
├── amazon-navigator.js    # 页面导航
├── floating-panel.js      # 浮动面板
└── libs/
    └── xlsx.full.min.js   # Excel解析库
```

### 技术栈
- **HTML/CSS/JavaScript** - 前端技术
- **Chrome Extension Manifest V3** - 扩展框架
- **SheetJS (XLSX)** - CSV/Excel解析
- **Shadow DOM** - Amazon UI元素处理

---

## 📊 版本历史

### v6.0 (2025-12-09) - 当前版本 🎉
- ✅ 完整CSV模板（78字段）
- ✅ 详细中文注释
- ✅ 报价页字段补全（新增9个字段）
- ✅ Bug修复（const赋值、fillTextbox、变体矩阵）

### v5.0
- ✅ 基础CSV支持（60字段）
- ✅ 变体页支持
- ✅ 图片上传

[查看完整更新日志](CHANGELOG_v6.0.md)

---

## ⚠️ 注意事项

### 1. 图片URL
- ⚠️ 某些图床可能有防盗链限制
- 💡 建议：使用稳定图床或本地图片

### 2. 日期字段
- ⚠️ 某些日期选择器可能报错
- 💡 建议：使用标准格式 `YYYY-MM-DD` 或留空

### 3. 填写频率
- ⚠️ 控制填写频率，避免触发风控
- 💡 建议：使用"真人模拟"选项

---

## 🐛 常见问题

### Q1: CSV读取失败？
**A:** 确保文件编码为UTF-8，检查是否有特殊字符

### Q2: 某些字段没有填写？
**A:** 
1. 检查控制台日志，查看 `[元素未找到]` 警告
2. 某些字段可能不适用于当前产品类别
3. 确认CSV数据不为空

### Q3: 第2行中文注释会影响导入吗？
**A:** 不会！程序会自动识别并跳过注释行

### Q4: 如何处理多行变体？
**A:** 相同ASIN/item_name的行会自动合并为一个商品的变体

---

## 📞 技术支持

### 反馈渠道
- 🐛 [GitHub Issues](https://github.com/kk43994/Amazon-e-commerce-auto-product-listing-browser-plugin/issues)
- 📧 项目主页

### 开发计划
- [ ] 日期选择器完善
- [ ] 本地图片上传
- [ ] 批量自动导航
- [ ] 填写进度优化

---

## ⚖️ 免责声明

本工具仅供学习和合法商业用途使用。使用者需遵守：
- 亚马逊平台使用条款
- 相关法律法规

请合理控制使用频率，避免触发平台风控机制。

---

## 📝 许可证

本项目代码仅供授权用户使用。

---

## 🎉 开始使用

1. 📥 [下载v6.0](https://github.com/kk43994/Amazon-e-commerce-auto-product-listing-browser-plugin/releases/tag/v6.0)
2. 📖 查看 [CSV使用说明](docs/csv_usage_guide.md)
3. 🚀 导入CSV，开始自动化！

**祝你使用愉快！** 🎉

---

**项目版本**: v6.0  
**最后更新**: 2025-12-09  
**状态**: 生产就绪 ✅
