# v7.0 更新日志

## 核心修复与改进

### 1. 配送渠道选择修复 (Fulfillment Channel)
- **修复重复定义**: 发现并删除了 `amazon-form-filler.js` 中第 2111 行的旧版 `selectFulfillmentChannel` 函数，解决了新逻辑被覆盖的问题。
- **支持嵌套结构**: 针对 Amazon 最新的 `kat-radiobutton` 组件结构进行适配，正确识别 `slot="radio"` 的子元素 Input。
- **多重点击策略**: 实现了"点击组件"、"点击内部Input"、"Trigger Events"等多种选择策略，确保在不同页面结构下都能生效。
- **精确匹配**: 使用 `name="offerFulfillment"` 和 `value="MFN"/"AFN"` 进行精确查找，解决了语言不匹配问题。

### 2. "所有属性"视图切换升级
- **覆盖全流程**: 现在进入产品详情页、报价页、安全性页、变体页、图片页时，都会强制优先尝试切换到"所有属性"视图。
- **精确选择器**: 新增支持通过 `value="ALL_ATTRIBUTES_VIEW_MODE"` 这一底层属性进行查找，不再依赖 UI 显示的语言（中文/日文/英文）。
- **组件兼容**: 同样适配了 `kat-radiobutton` 的 Shadow DOM 和 Slot 结构。

### 3. 代码健壮性
- 在关键步骤添加了详细的调试日志，方便排查问题。
- 增加了容错机制，如果主要选择器失败，会自动回退到模糊匹配。

## 发布信息
- **版本**: 7.0
- **发布时间**: 2025-12-17
- **适用平台**: Amazon Seller Central (Japan/Global)
