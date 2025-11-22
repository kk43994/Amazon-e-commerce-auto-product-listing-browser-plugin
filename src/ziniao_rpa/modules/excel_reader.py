"""
Excel数据读取模块
负责读取商品数据表格
"""

import pandas as pd
from typing import List, Dict, Optional
import os


class ExcelReader:
    """Excel数据读取器"""

    def __init__(self, file_path: str):
        """
        初始化Excel读取器

        Args:
            file_path: Excel文件路径
        """
        self.file_path = file_path
        self.data = None

    def load(self, sheet_name: str = 0) -> bool:
        """
        加载Excel文件

        Args:
            sheet_name: 工作表名称或索引,默认第一个

        Returns:
            bool: 加载是否成功
        """
        try:
            if not os.path.exists(self.file_path):
                print(f"[ERROR] 文件不存在: {self.file_path}")
                return False

            print(f"[INFO] 正在加载: {self.file_path}")

            # 读取Excel
            self.data = pd.read_excel(self.file_path, sheet_name=sheet_name)

            # 数据清洗
            self.data = self.data.fillna('')  # 空值填充为空字符串

            print(f"[OK] 成功加载 {len(self.data)} 条商品数据")
            print(f"[INFO] 列名: {list(self.data.columns)}")

            return True

        except Exception as e:
            print(f"[ERROR] 加载失败: {e}")
            return False

    def get_products(self) -> List[Dict]:
        """
        获取所有商品数据

        Returns:
            List[Dict]: 商品数据列表
        """
        if self.data is None:
            print("[ERROR] 数据未加载")
            return []

        # 转换为字典列表
        products = self.data.to_dict('records')
        return products

    def get_product_by_index(self, index: int) -> Optional[Dict]:
        """
        根据索引获取单个商品

        Args:
            index: 商品索引(从0开始)

        Returns:
            Optional[Dict]: 商品数据,不存在返回None
        """
        if self.data is None:
            print("[ERROR] 数据未加载")
            return None

        if index < 0 or index >= len(self.data):
            print(f"[ERROR] 索引超出范围: {index}")
            return None

        return self.data.iloc[index].to_dict()

    def get_product_count(self) -> int:
        """
        获取商品数量

        Returns:
            int: 商品数量
        """
        if self.data is None:
            return 0
        return len(self.data)

    def validate_columns(self, required_columns: List[str]) -> bool:
        """
        验证必需的列是否存在

        Args:
            required_columns: 必需列名列表

        Returns:
            bool: 是否包含所有必需列
        """
        if self.data is None:
            print("[ERROR] 数据未加载")
            return False

        missing_columns = []
        for col in required_columns:
            if col not in self.data.columns:
                missing_columns.append(col)

        if missing_columns:
            print(f"[ERROR] 缺少必需列: {missing_columns}")
            return False

        print("[OK] 数据格式验证通过")
        return True

    def print_sample(self, n: int = 3):
        """
        打印样本数据

        Args:
            n: 打印前n条数据
        """
        if self.data is None:
            print("[ERROR] 数据未加载")
            return

        print(f"\n{'='*60}")
        print(f"数据样本 (前 {min(n, len(self.data))} 条):")
        print(f"{'='*60}")
        print(self.data.head(n).to_string())
        print(f"{'='*60}\n")


# 商品数据字段定义
PRODUCT_FIELDS = {
    # 基本信息
    'title': '商品标题',
    'brand': '品牌',
    'manufacturer': '制造商',

    # 分类和属性
    'category': '类目',
    'keywords': '关键词',
    'description': '商品描述',
    'bullet_points': '要点说明',

    # 价格和库存
    'price': '价格',
    'quantity': '库存数量',
    'condition': '商品状况',

    # 物流信息
    'item_weight': '重量',
    'package_dimensions': '包装尺寸',

    # 图片
    'main_image': '主图路径',
    'image_1': '副图1路径',
    'image_2': '副图2路径',
    'image_3': '副图3路径',
    'image_4': '副图4路径',
    'image_5': '副图5路径',
    'image_6': '副图6路径',
    'image_7': '副图7路径',

    # 变体相关
    'variation_theme': '变体主题',
    'sku': 'SKU',
    'parent_sku': '父SKU',

    # 其他
    'upc': 'UPC码',
    'asin': 'ASIN',
}


def create_template_excel(output_path: str):
    """
    创建商品数据模板Excel文件

    Args:
        output_path: 输出文件路径
    """
    try:
        # 创建示例数据
        template_data = {
            'title': ['商品标题示例'],
            'brand': ['品牌示例'],
            'manufacturer': ['制造商示例'],
            'category': ['类目示例'],
            'keywords': ['关键词1 关键词2'],
            'description': ['这是商品详细描述'],
            'bullet_points': ['要点1\n要点2\n要点3'],
            'price': [29.99],
            'quantity': [100],
            'condition': ['New'],
            'item_weight': ['1.5'],
            'main_image': ['C:/path/to/main_image.jpg'],
            'image_1': ['C:/path/to/image1.jpg'],
            'sku': ['SKU-001'],
            'upc': ['123456789012'],
        }

        df = pd.DataFrame(template_data)
        df.to_excel(output_path, index=False)

        print(f"[OK] 模板文件已创建: {output_path}")

    except Exception as e:
        print(f"[ERROR] 创建模板失败: {e}")
