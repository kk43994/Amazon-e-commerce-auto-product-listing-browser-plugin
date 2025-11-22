# 🚀 快速安装指南

## ✅ 安装前检查清单

在开始之前,请确认:
- [ ] 已安装Chrome浏览器或紫鸟浏览器
- [ ] 可以访问亚马逊卖家后台
- [ ] 有待上传的商品Excel数据

---

## 📥 第一步: 下载依赖库 (必须)

### SheetJS库下载

插件需要SheetJS来读取Excel文件。

#### 方法1: 手动下载 (推荐)

1. **创建目录**:
   ```bash
   cd chrome_extension
   mkdir libs
   ```

2. **下载文件**:
   - 访问: https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
   - 右键 → 另存为
   - 保存到 `chrome_extension/libs/xlsx.full.min.js`

3. **验证文件**:
   - 文件大小: 约800KB
   - 文件路径: `chrome_extension/libs/xlsx.full.min.js`

#### 方法2: 使用命令行

**Windows (PowerShell)**:
```powershell
cd chrome_extension
if (!(Test-Path -Path "libs")) { New-Item -ItemType Directory -Path "libs" }
Invoke-WebRequest -Uri "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js" -OutFile "libs/xlsx.full.min.js"
```

**Mac/Linux**:
```bash
cd chrome_extension
mkdir -p libs
curl -o libs/xlsx.full.min.js https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
```

**Git Bash (Windows)**:
```bash
cd chrome_extension
mkdir -p libs
curl -o libs/xlsx.full.min.js https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
```

---

## 🎨 第二步: 创建图标文件 (可选)

### 快速方案: 使用占位图标

如果暂时没有图标,可以使用纯色占位:

1. **在线生成**:
   - 访问: https://placeholder.com/
   - 生成 16x16, 48x48, 128x128 的PNG图片
   - 下载并重命名为 `icon16.png`, `icon48.png`, `icon128.png`
   - 放到 `chrome_extension/icons/` 目录

2. **使用系统图标**:
   - 找任何PNG图片
   - 复制3份,重命名为上述文件名
   - Chrome会自动缩放

### 推荐图标主题

建议使用与电商/购物相关的图标:
- 🛒 购物车
- 📦 包裹/箱子
- ⚡ 闪电/快速
- 🏪 商店
- 📊 图表

**免费图标网站**:
- https://www.flaticon.com/ (需注册)
- https://icons8.com/ (部分免费)
- https://www.iconfinder.com/ (搜索"ecommerce")

---

## 🔧 第三步: 安装扩展到浏览器

### Chrome浏览器

1. **打开扩展管理页**:
   - 地址栏输入: `chrome://extensions/`
   - 或: 菜单 → 更多工具 → 扩展程序

2. **启用开发者模式**:
   - 页面右上角切换 "开发者模式" 开关
   - 开关变蓝即为开启

3. **加载扩展**:
   - 点击 "加载已解压的扩展程序"
   - 选择 `chrome_extension` 文件夹
   - **不要选择里面的文件,要选择整个文件夹**

4. **验证安装**:
   - 扩展列表中出现 "亚马逊商品快速上传助手"
   - 浏览器工具栏出现插件图标
   - 状态显示 "已启用"

### 紫鸟浏览器

步骤与Chrome浏览器相同:
1. 访问 `chrome://extensions/`
2. 开启开发者模式
3. 加载已解压的扩展程序
4. 选择 `chrome_extension` 文件夹

---

## ✅ 第四步: 验证安装

### 检查清单

- [ ] 扩展已在扩展列表中显示
- [ ] 扩展状态为 "已启用"
- [ ] 浏览器工具栏有插件图标
- [ ] libs/xlsx.full.min.js 文件存在

### 功能测试

1. **打开任意网页**

2. **点击插件图标**
   - 应该弹出插件界面
   - 界面显示 "商品上传助手"

3. **查看控制台**:
   - 按F12打开DevTools
   - 切换到Console标签
   - 应该看到:
     ```
     [学习模式] 已加载
     [页面分析器] 已加载
     ```

4. **测试页面分析**:
   - 在控制台输入: `window.pageAnalyzer`
   - 应该返回对象(不是undefined)

---

## 🎉 安装完成!

### 下一步做什么?

#### 首次使用建议流程:

1. **打开亚马逊卖家后台**
   - 登录亚马逊卖家中心
   - 导航到 "添加商品" 或 "创建新商品" 页面

2. **运行页面分析** (推荐)
   - 点击插件图标
   - 点击 "📊 分析当前页面所有元素"
   - 查看自动生成的分析报告
   - 了解页面元素分布

3. **运行学习模式** (可选)
   - 如果页面分析置信度低
   - 或想手动指定元素
   - 点击 "🎯 教插件识别页面元素"
   - 按提示依次点击各个字段

4. **准备测试数据**
   - 创建包含1-2个商品的Excel文件
   - 确保包含: title, brand, price

5. **第一次填写测试**
   - 点击插件图标
   - 选择Excel文件
   - 点击 "开始自动填写"
   - 观察填写过程

6. **检查结果**
   - 查看是否所有字段都填写正确
   - 如有问题,使用学习模式调整

7. **批量处理**
   - 测试无误后
   - 准备完整的商品Excel文件
   - 开启 "自动填写下一个" 选项
   - 开始批量处理

---

## 🐛 安装故障排查

### 问题1: "加载已解压的扩展程序" 按钮不可点击

**原因**: 未开启开发者模式

**解决**:
- 找到页面右上角 "开发者模式" 开关
- 点击开启(变成蓝色)
- 刷新页面

### 问题2: 加载扩展后报错 "Cannot load extension"

**可能原因**:
1. 选择了错误的文件夹
2. manifest.json文件损坏
3. 缺少必需文件

**解决**:
1. 确认选择的是 `chrome_extension` 文件夹(不是里面的子文件夹)
2. 检查 `manifest.json` 是否存在且格式正确
3. 查看错误详情,找到具体问题文件

### 问题3: 扩展加载成功但图标不显示

**原因**: icons目录下缺少PNG文件

**解决**:
- 这不影响功能使用
- 可以暂时忽略
- 或按照第二步创建图标文件
- 然后点击扩展的 "重新加载" 按钮

### 问题4: 点击插件图标没有反应

**可能原因**:
1. popup.html文件损坏
2. popup.js有错误
3. 缺少xlsx.full.min.js

**解决**:
1. 右键点击插件图标 → "检查弹出内容"
2. 查看Console中的错误信息
3. 最常见: "XLSX is not defined" → 需要下载SheetJS库

### 问题5: 控制台看不到 "[学习模式] 已加载"

**原因**: content scripts未注入

**解决**:
1. 刷新目标网页
2. 重新加载扩展
3. 检查manifest.json中的content_scripts配置
4. 确认当前网页URL匹配 host_permissions

---

## 📂 最终文件结构检查

安装完成后,您的目录应该是这样的:

```
chrome_extension/
├── manifest.json              ✅ 必需
├── popup.html                 ✅ 必需
├── popup.js                   ✅ 必需
├── content.js                 ✅ 必需
├── background.js              ✅ 必需
├── page-analyzer.js           ✅ 必需
├── learning-mode.js           ✅ 必需
├── libs/
│   └── xlsx.full.min.js       ✅ 必需 (需要下载)
├── icons/
│   ├── icon16.png             ⚠️ 推荐 (可选)
│   ├── icon48.png             ⚠️ 推荐 (可选)
│   └── icon128.png            ⚠️ 推荐 (可选)
├── README.md                  ℹ️ 文档
└── INSTALLATION.md            ℹ️ 本文档
```

**必需文件检查**:
```bash
# Windows PowerShell
Test-Path chrome_extension/manifest.json
Test-Path chrome_extension/popup.html
Test-Path chrome_extension/popup.js
Test-Path chrome_extension/content.js
Test-Path chrome_extension/background.js
Test-Path chrome_extension/page-analyzer.js
Test-Path chrome_extension/learning-mode.js
Test-Path chrome_extension/libs/xlsx.full.min.js

# 所有都应该返回 True
```

---

## 📞 获取帮助

如果安装过程中遇到问题:

1. **检查本文档的故障排查部分**
2. **查看浏览器控制台错误信息** (F12)
3. **查看扩展管理页面的错误详情**
4. **重新阅读README.md文档**

---

**安装指南版本**: 1.0
**最后更新**: 2025-11-17
