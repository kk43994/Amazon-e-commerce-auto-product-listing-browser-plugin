
import sys
import time
sys.path.insert(0, "src")

from ziniao_rpa.core.ziniao_manager import ZiniaoManager

# 配置
ZINIAO_PATH = r"D:\ziniao\ziniao.exe"
USERNAME = "banbantt"
PASSWORD = "Zjk15161671594"
SECURITY_PASSWORD = "Zjk15161671594"
PORT = 8848

print("启动紫鸟并分析页面...")

manager = ZiniaoManager(ZINIAO_PATH, PORT)

# 启动
if not manager.start_client():
    print("启动失败")
    exit(1)

# 登录
if not manager.login(USERNAME, PASSWORD, SECURITY_PASSWORD):
    print("登录失败")
    exit(1)

# 获取浏览器
browsers = manager.get_browser_list()
if not browsers:
    print("获取店铺失败")
    exit(1)

browser_oauth = browsers[0].get("browserOauth")
browser_info = manager.start_browser(browser_oauth, load_cookie=True)

time.sleep(3)

driver = manager.create_webdriver(browser_info, "chromedriver.exe")

# 导航到首页
driver.get("https://sellercentral-japan.amazon.com/home")
time.sleep(5)

print(f"当前URL: {driver.current_url}")
print(f"页面标题: {driver.title}")

# 保存页面源码和截图
with open("logs/home_page.html", "w", encoding="utf-8") as f:
    f.write(driver.page_source)

driver.save_screenshot("logs/home_page.png")

print("
已保存:")
print("- logs/home_page.html")
print("- logs/home_page.png")

print("
浏览器保持打开,请手动操作并告诉我:"  )
print("1. 如何进入添加商品页面(点击哪个按钮/链接)")
print("2. 添加商品页面的URL")

input("
按Enter键关闭...")
