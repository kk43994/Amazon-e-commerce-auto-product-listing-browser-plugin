# 亚马逊商品自动上架 - 完整自动化需求文档

> 生成日期: 2025-11-21
> 项目: 紫鸟浏览器RPA自动化上架工具

---

## 目录
1. [自动化流程概览](#自动化流程概览)
2. [导航流程](#导航流程)
3. [表单字段清单](#表单字段清单)
4. [Excel字段映射](#excel字段映射)
5. [技术要点](#技术要点)
6. [实现建议](#实现建议)

---

## 自动化流程概览

### 整体流程
1. 用户手动登录 Amazon Seller Central
2. 点击"添加商品" → "搜索"
3. 输入ASIN搜索商品
4. 点击搜索结果
5. 点击"复制商品信息"
6. 自动填写4个页面的表单：
   - 产品详情
   - 安全与合规
   - 报价
   - 图片
7. 提交商品

---

## 导航流程

### 步骤1: 进入添加商品页面
```
URL: https://sellercentral-japan.amazon.com
↓
点击: "添加商品" (uid=4_17)
```

### 步骤2: 搜索商品
```
点击: "搜索" 标签 (需用JavaScript点击)
↓
输入ASIN: uid=8_28
↓
点击: 搜索按钮 (uid=9_30)
```

### 步骤3: 选择商品
```
点击: 第一个搜索结果 (uid=12_256)
↓
点击: "复制商品信息" (uid=14_50)
```

### 步骤4: 填写表单
新页面在tab[1]打开，需切换到该tab：
```javascript
driver.switch_to.window(driver.window_handles[1])
```

---

## 表单字段清单

### 页面1: 产品详情 (Product Details)

**前置条件**: 需点击"所有属性"单选按钮 (`uid=22_24`) 才能显示所有字段

| # | 字段名 | UID | 类型 | Excel列 | 备注 |
|---|--------|-----|------|---------|------|
| 1 | 商品名称 | `uid=22_40` | textbox (multiline) | `title` | |
| 2 | 品牌名 | `uid=22_44` | textbox | `brand` | |
| 3 | 外部产品ID | `uid=22_50` | textbox | `product_id` | |
| 4 | 型号 | `uid=22_68` | textbox | `model` | |
| 5 | 制造商 | `uid=22_72` | textbox | `manufacturer` | |
| 6 | 产品描述 | `uid=22_76` | textbox (multiline) | `description` | |
| 7 | 要点1 | `uid=22_80` | textbox (multiline) | `bullet_point_1` | |
| 8 | 要点2 | `uid=22_81` | textbox (multiline) | `bullet_point_2` | |
| 9 | 要点3 | `uid=22_82` | textbox (multiline) | `bullet_point_3` | |
| 10 | 要点4 | `uid=22_83` | textbox (multiline) | `bullet_point_4` | |
| 11 | 要点5 | `uid=22_84` | textbox (multiline) | `bullet_point_5` | 需点击"添加更多" |
| 12 | 搜索关键字 | `uid=22_92` | textbox | `search_keywords` | |
| 13 | 发布日期 | `uid=22_213` | textbox (date) | `release_date` | 可选 |
| 14 | 产品网站发布日期 | `uid=22_217` | textbox (date) | `website_release_date` | 必填 |

**日期格式**: `2024/8/21` (年/月/日)

---

### 页面2: 安全与合规 (Safety and Compliance)

导航: 点击"安全与合规" tab

| # | 字段名 | UID | 类型 | Excel列 | 备注 |
|---|--------|-----|------|---------|------|
| 15 | 原产国/原产地 | `uid=24_32` | dropdown | `country_of_origin` | |
| 16 | 保修说明 | `uid=24_36` | textbox | `warranty` | |
| 17 | 危险商品规管 | `uid=24_48` | dropdown | `dangerous_goods` | 见下方选项 |

**危险商品规管选项**:
- `uid=24_55`: 危険物ラベル(GHS)
- `uid=24_56`: 保管
- `uid=24_57`: 廃棄物廃棄
- `uid=24_58`: 輸送
- `uid=24_59`: その他
- `uid=24_60`: **該当なし** (默认/推荐)
- `uid=24_61`: 不明

---

### 页面3: 报价 (Offer)

导航: 点击"报价" tab

| # | 字段名 | UID | 类型 | Excel列 | 备注 |
|---|--------|-----|------|---------|------|
| 18 | 数量 | `uid=25_35` | textbox | `quantity` | |
| 19 | 处理时间 | `uid=25_38` | textbox | `handling_time` | 天数 |
| 20 | 您的价格 | `uid=25_53` | textbox | `your_price` | JPY |
| 21 | 价格表（含税） | `uid=25_95` | textbox | `list_price` | JPY |
| 22 | 配送渠道 | `uid=25_163` | radio | `fulfillment_channel` | 选择自配送 |

**配送渠道选项**:
- `uid=25_163`: 我将自行配送此商品 ✓ (默认选择)
- `uid=25_168`: 亚马逊配送 (FBA)

---

### 页面4: 图片 (Images)

导航: 点击"图片" tab

| # | 字段名 | Element ID | 类型 | Excel列 | 备注 |
|---|--------|------------|------|---------|------|
| 23 | 主图片 | `ProductImage_MAIN-input_input` | file input | `main_image` | 必填 |
| 24 | 附加图片1 | `ProductImage_PT01-input_input` | file input | `image_1` | 可选 |
| 25 | 附加图片2 | `ProductImage_PT02-input_input` | file input | `image_2` | 可选 |
| 26 | 附加图片3 | `ProductImage_PT03-input_input` | file input | `image_3` | 可选 |
| 27 | 附加图片4 | `ProductImage_PT04-input_input` | file input | `image_4` | 可选 |
| 28 | 附加图片5 | `ProductImage_PT05-input_input` | file input | `image_5` | 可选 |
| 29 | 附加图片6 | `ProductImage_PT06-input_input` | file input | `image_6` | 可选 |
| 30 | 附加图片7 | `ProductImage_PT07-input_input` | file input | `image_7` | 可选 |
| 31 | 附加图片8 | `ProductImage_PT08-input_input` | file input | `image_8` | 可选 |

**支持格式**: `.JPEG, .jpeg, .JPG, .PNG, .png, .gif, .tif, .tiff, .photostudio`

**上传方式**:
```python
# 方式1: 批量上传（推荐）
batch_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"][multiple]')
batch_input.send_keys("path1.jpg\npath2.jpg\npath3.jpg")

# 方式2: 逐个上传
main_input = driver.find_element(By.ID, 'ProductImage_MAIN-input_input')
main_input.send_keys("C:\\images\\main.jpg")
```

---

## Excel字段映射

### Excel表格结构

| 列名 | 数据类型 | 示例值 | 对应表单字段 |
|------|----------|--------|-------------|
| `asin` | 文本 | B0D9XYDYBJ | 搜索用 |
| `title` | 文本 | サーモス 取っ手のとれる... | 商品名称 |
| `brand` | 文本 | THERMOS | 品牌名 |
| `product_id` | 文本 | 4562344368711 | 外部产品ID |
| `model` | 文本 | KHB-001 | 型号 |
| `manufacturer` | 文本 | サーモス(THERMOS) | 制造商 |
| `description` | 长文本 | この商品は... | 产品描述 |
| `bullet_point_1` | 文本 | 専用取っ手 | 要点1 |
| `bullet_point_2` | 文本 | 本体サイズ... | 要点2 |
| `bullet_point_3` | 文本 | 原産国:中国 | 要点3 |
| `bullet_point_4` | 文本 | 素材:フェノール樹脂 | 要点4 |
| `bullet_point_5` | 文本 | (可选) | 要点5 |
| `search_keywords` | 文本 | 取っ手,THERMOS | 搜索关键字 |
| `release_date` | 日期 | 2024/8/21 | 发布日期 |
| `website_release_date` | 日期 | 2024/8/21 | 网站发布日期 |
| `country_of_origin` | 文本 | 中国 | 原产国 |
| `warranty` | 文本 | 1年メーカー保証 | 保修说明 |
| `dangerous_goods` | 文本 | 該当なし | 危险商品规管 |
| `quantity` | 数字 | 100 | 数量 |
| `handling_time` | 数字 | 2 | 处理时间(天) |
| `your_price` | 数字 | 1980 | 您的价格 |
| `list_price` | 数字 | 2280 | 价格表 |
| `fulfillment_channel` | 文本 | FBM | 配送渠道 |
| `main_image` | 路径 | images/abc001/main.jpg | 主图片 |
| `image_1` | 路径 | images/abc001/1.jpg | 附加图1 |
| `image_2` | 路径 | images/abc001/2.jpg | 附加图2 |
| ... | ... | ... | ... |

### Excel模板示例

```
asin         | title              | brand   | quantity | your_price | main_image
-------------|--------------------|---------|---------|-----------|-----------------
B0D9XYDYBJ   | サーモス 取っ手    | THERMOS | 100     | 1980      | images/main.jpg
```

---

## 技术要点

### 1. Shadow DOM处理

Amazon页面使用Shadow DOM封装元素，需要特殊处理：

```javascript
// 查找Shadow DOM中的元素
const allElements = document.querySelectorAll('*');
for (const el of allElements) {
  if (el.shadowRoot) {
    const target = el.shadowRoot.querySelector('.link__inner');
    if (target && target.textContent === '添加更多') {
      target.parentElement.click();
    }
  }
}
```

### 2. 动态元素定位

某些链接和按钮通过CSS类名定位：
- "添加更多" 链接: `span.link__inner`
- 需要通过文本内容匹配

### 3. 页面切换

复制商品后会在新tab打开：
```python
# 等待新窗口打开
time.sleep(2)
# 切换到新tab
driver.switch_to.window(driver.window_handles[1])
```

### 4. 属性视图切换

某些字段仅在"所有属性"视图可见：
```python
# 点击"所有属性"单选按钮
all_attrs_radio = driver.find_element(By.XPATH, "//span[text()='所有属性']")
all_attrs_radio.click()
time.sleep(1)
```

### 5. 日期格式

统一使用格式: `YYYY/M/D`
示例: `2024/8/21`

### 6. 图片路径处理

```python
import os

def get_absolute_path(relative_path, base_dir='C:\\Users\\zhouk\\Desktop\\ziniao'):
    """转换相对路径为绝对路径"""
    if os.path.isabs(relative_path):
        return relative_path
    return os.path.join(base_dir, relative_path)

# 使用
image_path = get_absolute_path(product['main_image'])
if os.path.exists(image_path):
    input_elem.send_keys(image_path)
```

---

## 实现建议

### 模块化设计

```python
class AmazonProductUploader:
    def __init__(self, driver):
        self.driver = driver

    def fill_product_details(self, data):
        """填写产品详情页"""
        pass

    def fill_safety_compliance(self, data):
        """填写安全与合规页"""
        pass

    def fill_offer(self, data):
        """填写报价页"""
        pass

    def upload_images(self, data):
        """上传图片"""
        pass

    def submit(self):
        """提交表单"""
        pass
```

### 错误处理

```python
def safe_fill(element_locator, value, timeout=10):
    """安全填写字段，带重试机制"""
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located(element_locator)
        )
        element.clear()
        element.send_keys(value)
        return True
    except TimeoutException:
        print(f"元素未找到: {element_locator}")
        return False
    except Exception as e:
        print(f"填写失败: {e}")
        return False
```

### 安全机制

```python
from ziniao_rpa.core.safety_manager import SafetyManager

safety = SafetyManager(driver)

# 每次上传前检查
safety.check_ip_safety()
safety.check_account_health()

# 模拟真人行为
safety.random_scroll()
safety.random_pause(2, 5)
safety.human_like_type(element, text)

# 上传间隔
safety.safe_delay_between_uploads()
```

---

## 附录: UID对照表

### 产品详情页UID（所有属性视图）

```
商品名称: uid=22_40
品牌名: uid=22_44
外部产品ID: uid=22_50
型号: uid=22_68
制造商: uid=22_72
产品描述: uid=22_76
要点1-5: uid=22_80, 22_81, 22_82, 22_83, 22_84
搜索关键字: uid=22_92
发布日期: uid=22_213
产品网站发布日期: uid=22_217
```

### 安全与合规页UID

```
原产国: uid=24_32
保修说明: uid=24_36
危险商品规管: uid=24_48 (dropdown)
  选项: uid=24_55-61
```

### 报价页UID

```
数量: uid=25_35
处理时间: uid=25_38
您的价格: uid=25_53
价格表: uid=25_95
配送渠道-自配送: uid=25_163
配送渠道-FBA: uid=25_168
```

### 图片页Element ID

```
主图: ProductImage_MAIN-input_input
附加1-8: ProductImage_PT01-08-input_input
```

---

## 更新历史

| 日期 | 版本 | 说明 |
|------|------|------|
| 2025-11-21 | 1.0 | 初始版本 - 完整需求文档 |

---

**文档结束**
