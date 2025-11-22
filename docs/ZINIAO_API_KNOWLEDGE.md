# 紫鸟浏览器 API 知识库

记录时间: 2025-11-12

## 📚 目录
1. [核心API接口](#核心api接口)
2. [WebDriver模式](#webdriver模式)
3. [RPA插件集成](#rpa插件集成)
4. [元素定位方法](#元素定位方法)
5. [最佳实践](#最佳实践)

---

## 核心API接口

### Socket通讯接口 (共6个)

| 接口名称 | 功能说明 | 应用场景 |
|---------|---------|---------|
| `getBrowserList` | 获取店铺列表 | 查询可用的店铺配置 |
| `startBrowser` | 启动店铺窗口 | 打开指定店铺的浏览器实例 |
| `stopBrowser` | 关闭店铺窗口 | 停止浏览器进程 |
| `getBrowserEnvInfo` | 获取浏览器环境信息 | 获取调试端口等信息 |
| `heartbeat` | 保活连接 | 维持Socket连接不断开 |
| `exit` | 退出主进程 | 完全关闭紫鸟进程 |

### 关键参数说明

```python
# 启动命令格式
cmd = "{path} --run_type=web_driver --ipc_type=http --port={port}"

# 参数详解
--run_type=web_driver  # WebDriver模式(无界面)
--ipc_type=http        # 通讯类型(HTTP/Socket)
--port=8848           # 通讯端口号
```

### 重要概念

**browserOauth**:
- 店铺的唯一标识ID
- 从 `getBrowserList` 接口获取
- 用于 `startBrowser` 时指定要启动的店铺

**debuggingPort**:
- Chrome调试端口
- 从 `startBrowser` 响应中获取
- Selenium连接时使用

---

## WebDriver模式

### 1. 启动流程

```python
# Step 1: 启动紫鸟主进程
import subprocess
cmd = "D:\\ziniao\\ziniao.exe --run_type=web_driver --ipc_type=http --port=8848"
subprocess.Popen(cmd)

# Step 2: 连接并登录
# (通过HTTP API发送请求)

# Step 3: 获取店铺列表
response = requests.post('http://127.0.0.1:8848', json={
    'requestId': uuid.uuid4(),
    'cmd': 'getBrowserList'
})

# Step 4: 启动浏览器
browser_oauth = browsers[0]['browserOauth']
response = requests.post('http://127.0.0.1:8848', json={
    'requestId': uuid.uuid4(),
    'cmd': 'startBrowser',
    'browserOauth': browser_oauth,
    'cookieTypeLoad': 1  # 加载GUI环境配置
})

# Step 5: 获取调试端口
debugging_port = response['data']['debuggingPort']
```

### 2. Selenium连接方式

```python
from selenium import webdriver

# 配置Chrome选项
options = webdriver.ChromeOptions()
options.add_experimental_option("debuggerAddress",
                               f"127.0.0.1:{debugging_port}")

# 连接到浏览器
driver = webdriver.Chrome(
    service=Service("chromedriver.exe"),
    options=options
)

# 现在可以使用Selenium进行自动化操作
driver.get("https://example.com")
```

### 3. Socket通讯规范

```python
from socket import socket, AF_INET, SOCK_STREAM

# 建立连接
sock = socket(AF_INET, SOCK_STREAM)
sock.connect(('127.0.0.1', 8848))

# 发送请求(必须以\r\n结尾,UTF-8编码)
params = {'cmd': 'getBrowserList', 'requestId': '12345'}
message = (str(params) + '\r\n').encode('utf-8')
sock.send(message)

# 接收响应
response = sock.recv(4096)
```

---

## RPA插件集成

### 支持的浏览器插件

紫鸟浏览器支持多种RPA工具的插件集成:
- ✅ 八爪鱼RPA
- ✅ 虎步RPA
- ✅ 实在智能RPA

### 八爪鱼RPA核心命令

| 命令 | 功能 | 用途 |
|-----|------|-----|
| 获取已打开的网页对象 | 获取当前浏览器页面对象 | 作为后续操作的基础 |
| XPath获取元素对象 | 通过XPath定位元素 | 精确定位目标元素 |
| 点击网页元素 | 模拟鼠标点击 | 点击按钮/链接 |
| 填写输入框 | 输入文本内容 | 填写表单 |
| 设置下拉框 | 选择下拉选项 | 表单填写 |
| 获取网页/元素信息 | 提取文本/属性值 | 数据采集 |
| 鼠标悬停 | Hover操作 | 触发悬停菜单 |

### XPath元素定位参数

```python
# 参数结构
{
    "网页对象": page_object,        # 目标网页对象
    "XPath选择器": "//div[@id='content']",  # XPath表达式
    "元素在Iframe里": False,        # 是否在iframe中
    "Iframe XPath": ""             # iframe的XPath(如需要)
}
```

---

## 元素定位方法

### 1. Selenium原生方法

```python
from selenium.webdriver.common.by import By

# ID定位
element = driver.find_element(By.ID, "username")

# Name定位
element = driver.find_element(By.NAME, "email")

# XPath定位
element = driver.find_element(By.XPATH, "//input[@type='text']")

# CSS Selector定位
element = driver.find_element(By.CSS_SELECTOR, "div.content > input")

# Class Name定位
element = driver.find_element(By.CLASS_NAME, "btn-primary")

# Tag Name定位
elements = driver.find_elements(By.TAG_NAME, "button")

# Link Text定位
link = driver.find_element(By.LINK_TEXT, "登录")

# Partial Link Text定位
link = driver.find_element(By.PARTIAL_LINK_TEXT, "登")
```

### 2. XPath最佳实践

```xpath
# 通过ID定位(最稳定)
//*[@id="product-title"]

# 通过属性定位
//input[@type="text"][@name="sku"]

# 通过文本内容定位
//button[text()="提交"]

# 层级定位
//div[@class="form-group"]/input[@type="text"]

# 多条件组合
//input[@type="text" and contains(@class, "required")]

# 索引定位(不推荐,易变)
(//input[@type="text"])[1]
```

### 3. 获取XPath的方法

**Chrome开发者工具**:
1. 按F12打开开发者工具
2. 点击"Elements"标签
3. 右键目标元素
4. Copy → Copy XPath / Copy full XPath

**注意**:
- "Copy XPath"生成简短路径(推荐)
- "Copy full XPath"生成完整路径(脆弱,不推荐)

---

## 最佳实践

### 1. 安全操作建议

```python
# ✅ 正确: 每次启动都重新获取环境信息
browser_info = manager.start_browser(oauth, load_cookie=True)
debugging_port = browser_info['debuggingPort']

# ❌ 错误: 复用之前的debuggingPort
# debugging_port = 9222  # 固定端口会导致连接失败
```

### 2. 异常处理

```python
try:
    element = driver.find_element(By.ID, "submit-btn")
    element.click()
except NoSuchElementException:
    # 元素不存在,使用备用定位方式
    element = driver.find_element(By.XPATH, "//button[@type='submit']")
    element.click()
except ElementNotInteractableException:
    # 元素不可交互,等待加载
    time.sleep(2)
    element.click()
```

### 3. 显式等待(推荐)

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 等待元素可见
element = WebDriverWait(driver, 10).until(
    EC.visibility_of_element_located((By.ID, "product-title"))
)

# 等待元素可点击
element = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.ID, "submit-btn"))
)

# 等待元素消失
WebDriverWait(driver, 10).until(
    EC.invisibility_of_element_located((By.ID, "loading"))
)
```

### 4. 浏览器窗口管理

```python
# 获取当前窗口句柄
original_window = driver.current_window_handle

# 打开新标签页
driver.execute_script("window.open('');")

# 获取所有窗口
all_windows = driver.window_handles

# 切换到新窗口
for window in all_windows:
    if window != original_window:
        driver.switch_to.window(window)
        break

# 操作完成后切换回原窗口
driver.switch_to.window(original_window)
```

### 5. 性能优化

```python
# 控制并发数量
MAX_CONCURRENT_BROWSERS = 3  # 根据设备性能调整

# 设置页面加载超时
driver.set_page_load_timeout(30)

# 设置脚本执行超时
driver.set_script_timeout(30)

# 隐式等待(不推荐,优先使用显式等待)
# driver.implicitly_wait(10)
```

### 6. Cookie和Session管理

```python
# cookieTypeLoad参数说明
# 0: 不加载Cookie,干净环境
# 1: 加载GUI配置的Cookie和环境

# 获取所有Cookie
cookies = driver.get_cookies()

# 添加Cookie
driver.add_cookie({
    'name': 'session_id',
    'value': 'abc123',
    'domain': 'amazon.com'
})

# 删除Cookie
driver.delete_cookie('session_id')
driver.delete_all_cookies()
```

---

## 常见问题

### Q1: getBrowserEnvInfo返回的数据能复用吗?
**A**: 不能!每次启动浏览器都必须重新调用获取最新的端口信息。

### Q2: 手动启动的紫鸟GUI会影响WebDriver吗?
**A**: 会!手动启动会杀死WebDriver模式的进程,导致自动化脚本失败。

### Q3: 如何处理iframe中的元素?
**A**:
```python
# 切换到iframe
iframe = driver.find_element(By.ID, "my-iframe")
driver.switch_to.frame(iframe)

# 操作iframe内的元素
element = driver.find_element(By.ID, "inner-element")

# 切换回主页面
driver.switch_to.default_content()
```

### Q4: XPath定位不到元素怎么办?
**A**:
1. 检查元素是否在iframe中
2. 添加显式等待
3. 使用更简洁的XPath表达式
4. 尝试CSS Selector作为替代

---

## 参考资料

- [紫鸟开放平台](https://open.ziniao.com/)
- [紫鸟WebDriver示例代码](https://github.com/ziniao-open/ziniao_webdriver_demo)
- [八爪鱼RPA帮助文档](https://rpa.bazhuayu.com/helpcenter)
- [Selenium官方文档](https://www.selenium.dev/documentation/)

---

**最后更新**: 2025-11-12
**维护者**: Claude Code
