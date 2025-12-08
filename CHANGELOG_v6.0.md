# 版本更新日志 v6.0

> 发布日期：2025-12-09  
> 版本：6.0  
> 重大更新：完整CSV模板 + 报价页字段补全

---

## 🎉 主要更新

### 1. 完整CSV模板（78个字段）

✅ **新增完整模板：** `wanzhengbiaodan.csv`
- 包含所有Amazon页面的78个字段
- 第1行：英文字段名（程序读取）
- 第2行：详细中文注释（用户参考）
- 第3行开始：商品数据

✅ **中文注释说明：**
```csv
item_name,brand_name,sku,...
商品名称(必填|最多200字),品牌名(必填),SKU编号(必填|唯一识别码),...
测试商品,TestBrand,SKU-001,...
```

### 2. 报价页字段补全

新增报价页缺失字段映射：
- ✅ `map_price` - 最低广告价格
- ✅ `min_seller_price` - 最低销售价
- ✅ `max_seller_price` - 最高销售价
- ✅ `merchant_release_date` - 商家发布日期
- ✅ `launch_date` - 发布日期
- ✅ `max_order_quantity` - 最大订单数量
- ✅ `gift_message` - 礼品留言
- ✅ `gift_wrap` - 礼品包装
- ✅ `ships_globally` - 全球配送

### 3. CSV读取增强

✅ **智能跳过注释行：**
- 自动识别并过滤第2行中文注释
- 检测包含"必填/选填"等关键词的行
- 只读取实际商品数据

✅ **多格式支持：**
```javascript
// 同时支持两种要点格式
bullet_point1 → bulletPoint1 ✅
bullet_point_1 → bulletPoint1 ✅

// 同时支持两种关键词格式
generic_keyword → searchKeywords ✅
generic_keywords → searchKeywords ✅
```

### 4. Bug修复

🐛 **修复"Assignment to constant variable"错误**
- 问题：CSV分组时尝试修改const变量
- 修复：将`const products`改为`let products`

🐛 **修复fillTextbox函数**
- 恢复完整的值设置逻辑
- 修复Shadow DOM同步
- 完善事件触发机制

🐛 **修复变体页矩阵填写**
- 改进ID后缀匹配逻辑
- 排除creation inputs
- 只匹配实际矩阵行

---

## 📋 字段覆盖情况

### 产品详情页：40个字段 ✅
- 基础信息、要点、尺寸、重量等全覆盖

### 安全合规页：11个字段 ✅
- 原产国、保修、危险品、GPSR认证等

### 报价页：18个字段 ✅
- SKU、价格、库存、礼品选项等全覆盖

### 图片：9个字段 ✅
- 主图 + 8张附加图

**总计：78个字段，覆盖Amazon所有主要页面！**

---

## 🔧 技术改进

### 代码优化

1. **CSV解析优化**
```javascript
// 智能过滤注释行
jsonData = jsonData.filter(row => {
    const firstValue = Object.values(row)[0] || '';
    const isAnnotationRow = 
        (typeof firstValue === 'string') &&
        (firstValue.includes('(') || firstValue.includes('（')) &&
        (firstValue.includes('必填') || firstValue.includes('选填'));
    return !isAnnotationRow;
});
```

2. **字段映射完善**
- 兼容多种命名格式
- 支持下划线和驼峰命名
- 智能fallback机制

3. **暂停/停止功能**
- 变体页添加workflow检查
- 支持随时中断填写

---

## 📚 新增文档

### 用户文档
- ✅ `csv_usage_guide.md` - CSV使用说明
- ✅ `complete_csv_reference.md` - 完整字段参考
- ✅ `csv_field_check.md` - 字段映射检查

### 模板文件
- ✅ `wanzhengbiaodan.csv` - 完整模板（78字段）
- ✅ 包含详细中文注释
- ✅ 示例数据完整

---

## ⚠️ 已知问题

### 需要手动处理的情况

1. **日期字段**
   - 某些日期选择器可能报错
   - 建议：暂时留空或使用标准格式 `YYYY-MM-DD`

2. **图片防盗链**
   - 某些图床返回HTTP 403
   - 建议：使用本地图片或稳定图床

3. **页面元素定位**
   - Amazon页面结构可能变化
   - 建议：使用学习模式重新定位

---

## 🚀 升级步骤

### 方法1：重新安装
1. 删除旧版插件
2. 下载 `amazon-upload-assistant-v6.0.zip`
3. 解压并加载到Chrome

### 方法2：直接更新
1. 下载新版文件
2. 覆盖旧文件
3. 在 `chrome://extensions/` 点击"重新加载"

---

## 📞 技术支持

### 反馈渠道
- GitHub Issues
- 项目主页

### 常见问题
请查看 `csv_usage_guide.md`

---

## 🎯 下一步计划

### v6.1 候选功能
- [ ] 完善日期字段处理
- [ ] 本地图片上传支持
- [ ] 批量商品自动导航
- [ ] 填写进度详细显示

---

**感谢使用亚马逊商品快速上传助手！** 🎉

> 如有问题，请在GitHub提issue或联系开发者。
