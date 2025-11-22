# 📦 亚马逊商品快速上传助手

> 浏览器插件版 - 简单、快速、智能

## 🎯 核心优势

### ✅ 为什么选择插件方案？

**传统Selenium方案的问题**：
- ❌ 需要启动浏览器进程
- ❌ 需要复杂的账号登录
- ❌ 需要WebDriver连接
- ❌ 元素定位容易失效
- ❌ 8-10个操作步骤

**插件方案的优势**：
- ✅ 用户已经登录，直接使用
- ✅ 已经在目标页面，无需导航
- ✅ 智能匹配元素，无需硬编码
- ✅ 3步操作：打开页面 → 选择Excel → 完成
- ✅ 支持真人行为模拟
- ✅ 支持批量处理

## 🚀 快速开始

### 1. 安装插件

#### 方式一：开发者模式安装（推荐）

1. 打开Chrome或紫鸟浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `chrome_extension` 文件夹

#### 方式二：打包安装

```bash
# 在chrome_extension目录下
# Chrome会生成.crx文件和.pem密钥
# 保存.pem文件用于后续更新
```

### 2. 准备Excel数据

**必需字段**：
- `title` - 商品标题
- `brand` - 品牌
- `price` - 价格

**可选字段**：
- `description` - 商品描述
- `bullet_points` - 要点说明（换行分隔或数组）
- `quantity` - 库存数量
- `sku` - SKU编号
- `category` - 分类

**Excel示例**：
```
| title                      | brand    | price | description          |
|----------------------------|----------|-------|----------------------|
| iPhone 15 Pro 256GB        | Apple    | 999   | Latest iPhone model  |
| Samsung Galaxy S24         | Samsung  | 899   | Flagship Android     |
```

### 3. 使用步骤

```
第1步：手动登录亚马逊卖家后台
       ↓
第2步：打开"添加商品"页面
       ↓
第3步：点击插件图标 → 选择Excel
       ↓
第4步：点击"开始自动填写" → 完成！
```

## 💡 核心功能

### 1. 智能字段匹配

插件会自动识别页面元素，**无需手动配置**：

```javascript
// 自动匹配这些字段
✅ title     - 标题/Product Title/商品名称
✅ brand     - 品牌/Brand Name/制造商
✅ price     - 价格/Price/售价
✅ quantity  - 数量/库存/Stock
✅ sku       - SKU/Seller SKU
✅ description - 描述/产品描述
```

### 2. 真人行为模拟

- ⌨️ 模拟真人打字速度（50-150ms/字符）
- 🖱️ 随机延迟（300-800ms）
- 📜 自动滚动到视图
- ✨ 聚焦/失焦动画

### 3. 批量处理

- 📊 支持一次导入多个商品
- ⏭️ 逐个填写或自动连续
- 📈 实时进度显示
- ✅ 高亮显示已填写字段

### 4. 页面分析器 🆕

**自动检测当前页面的所有表单元素！**

在插件中点击"分析当前页面"按钮，或在控制台运行：

```javascript
// 分析当前页面
const results = window.pageAnalyzer.analyze();

// 导出分析结果（包含智能匹配建议）
window.pageAnalyzer.export();

// 高亮显示元素
window.pageAnalyzer.highlight('#product-title');
```

**分析结果包括**：
- 所有input元素（ID、name、placeholder、label）
- 所有textarea元素
- 所有select下拉框
- 所有按钮
- 智能字段匹配建议（带置信度）

## 📁 项目结构

```
chrome_extension/
├── manifest.json          # 插件配置文件
├── popup.html            # 弹出界面（用户交互）
├── popup.js              # 界面逻辑（Excel读取）
├── content.js            # 内容脚本（DOM操作）
├── background.js         # 后台脚本（消息处理）
├── page-analyzer.js      # 页面分析器 🆕
├── icons/                # 图标文件夹
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── libs/                 # 第三方库
│   └── xlsx.full.min.js  # SheetJS Excel库
└── README.md            # 本文档
```

## 🔧 技术实现

### 智能元素查找

```javascript
function findInputElement(fieldType) {
    // 策略1: 通过ID查找
    // 策略2: 通过name属性
    // 策略3: 通过label文本
    // 策略4: 通过placeholder
    // 支持多语言、部分匹配、模糊搜索
}
```

### 字段映射配置

```javascript
const FIELD_MAPPINGS = {
    title: {
        labels: ['product title', '商品标题', 'title'],
        names: ['title', 'product_title'],
        ids: ['product-title', 'title']
    },
    // ... 其他字段
};
```

## 🎨 用户界面

### 主界面

- 📄 Excel文件选择（拖拽支持）
- 📊 商品数量显示
- ⚙️ 设置选项
  - ✅ 模拟真人打字
  - ✅ 自动填写下一个
- 📈 进度条显示
- 💬 状态提示（成功/错误/信息）

### 视觉反馈

- 🟢 填写完成高亮（绿色边框）
- 🔔 完成提示横幅
- 📊 实时进度百分比

## 🛠️ 开发调试

### 控制台调试

```javascript
// 查看插件日志
console.log('[亚马逊上传助手]');

// 分析页面
window.pageAnalyzer.export();

// 测试字段匹配
chrome.runtime.sendMessage({
    action: 'analyzePage'
}, (response) => {
    console.log(response.data);
});
```

### 热重载

修改代码后：
1. 访问 `chrome://extensions/`
2. 点击插件的"重新加载"按钮
3. 刷新目标网页

## 📝 Excel模板

### 基础模板

```
title,brand,price,quantity,description
"iPhone 15 Pro 256GB","Apple",999,100,"Latest model"
"MacBook Air M2","Apple",1199,50,"Ultra-thin laptop"
```

### 完整模板

```
title,brand,price,quantity,sku,category,description,bullet_points
"Product A","Brand X",29.99,100,"SKU-001","Electronics","Description...","Point 1
Point 2
Point 3"
```

## ⚠️ 注意事项

### 使用建议

1. **首次使用**：
   - 先测试1-2个商品
   - 检查填写是否正确
   - 确认后再批量处理

2. **网络稳定**：
   - 确保网络连接稳定
   - 避免页面加载过慢

3. **页面停留**：
   - 填写过程中不要切换标签页
   - 不要刷新页面

4. **手动检查**：
   - 填写完成后人工检查
   - 特别是价格和数量
   - 确认无误后提交

### 限制说明

1. **图片上传**：
   - 当前版本不支持自动上传图片
   - 需要手动上传或提供URL

2. **复杂字段**：
   - 某些特殊字段可能需要手动填写
   - 如变体、尺寸选择等

3. **页面兼容性**：
   - 仅支持标准的亚马逊商品上传页面
   - 不同站点可能有差异

## 🔄 与Selenium方案对比

| 特性 | Selenium方案 | 插件方案 ✅ |
|------|-------------|------------|
| 复杂度 | ⚠️ 高（8-10步） | ✅ 低（3步） |
| 代码量 | ⚠️ 5000+ 行 | ✅ 500 行 |
| 启动时间 | ⚠️ 需要启动浏览器 | ✅ 即点即用 |
| 登录需求 | ⚠️ 需要自动登录 | ✅ 用户已登录 |
| 元素定位 | ⚠️ 硬编码，易失效 | ✅ 智能匹配 |
| 维护成本 | ⚠️ 高 | ✅ 低 |
| 用户体验 | ⚠️ 复杂 | ✅ 简单 |

## 📞 技术支持

### 常见问题

**Q: 插件无法找到输入框？**
A: 使用页面分析器检查元素，可能需要等待页面完全加载

**Q: Excel读取失败？**
A: 检查文件格式（仅支持.xlsx/.xls），确保包含必需字段

**Q: 填写不完整？**
A: 某些字段可能需要手动填写，插件会跳过无法识别的字段

### 获取帮助

1. 查看控制台日志
2. 使用页面分析器检查元素
3. 参考Excel模板

## 🎉 版本历史

### v1.0.0 (2025-11-17)
- ✅ 首次发布
- ✅ Excel数据导入
- ✅ 智能字段匹配
- ✅ 真人行为模拟
- ✅ 批量处理支持
- ✅ 页面分析器

## 📄 许可证

本项目仅供学习和个人使用。

---

**开发者**: Claude Code
**最后更新**: 2025-11-17
