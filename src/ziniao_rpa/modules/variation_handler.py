"""
变体商品处理模块
支持读取和处理亚马逊商品变体数据
"""

from typing import List, Dict, Optional
import pandas as pd


class VariationHandler:
    """商品变体处理器"""

    def __init__(self, products_df: pd.DataFrame):
        """
        初始化变体处理器

        Args:
            products_df: 商品数据DataFrame
        """
        self.products_df = products_df

    def group_by_parent(self) -> Dict[str, List[Dict]]:
        """
        按父SKU分组商品

        Returns:
            Dict: {parent_sku: [child_products]}
        """
        groups = {}

        for idx, row in self.products_df.iterrows():
            product = row.to_dict()
            parent_sku = product.get('parent_sku', '')

            if parent_sku:
                # 有parent_sku,说明是子变体
                if parent_sku not in groups:
                    groups[parent_sku] = []
                groups[parent_sku].append(product)
            else:
                # 没有parent_sku,说明是独立商品或父商品
                sku = product.get('sku', '')
                if sku and sku not in groups:
                    groups[sku] = [product]

        return groups

    def is_variation_product(self, product: Dict) -> bool:
        """
        判断是否为变体商品

        Args:
            product: 商品数据

        Returns:
            bool: 是否为变体商品
        """
        return bool(product.get('parent_sku') or product.get('variation_theme'))

    def get_parent_product(self, parent_sku: str) -> Optional[Dict]:
        """
        获取父商品信息

        Args:
            parent_sku: 父商品SKU

        Returns:
            Optional[Dict]: 父商品数据,不存在返回None
        """
        parent_rows = self.products_df[
            (self.products_df['sku'] == parent_sku) &
            (self.products_df['parent_sku'].isna() | (self.products_df['parent_sku'] == ''))
        ]

        if len(parent_rows) > 0:
            return parent_rows.iloc[0].to_dict()
        return None

    def get_child_variations(self, parent_sku: str) -> List[Dict]:
        """
        获取某个父商品的所有子变体

        Args:
            parent_sku: 父商品SKU

        Returns:
            List[Dict]: 子变体列表
        """
        child_rows = self.products_df[self.products_df['parent_sku'] == parent_sku]
        return child_rows.to_dict('records')

    def validate_variation_data(self, parent_sku: str) -> tuple[bool, List[str]]:
        """
        验证变体数据完整性

        Args:
            parent_sku: 父商品SKU

        Returns:
            tuple: (是否有效, 错误信息列表)
        """
        errors = []

        # 检查父商品是否存在
        parent = self.get_parent_product(parent_sku)
        if not parent:
            errors.append(f"找不到父商品: {parent_sku}")
            return False, errors

        # 检查变体主题
        variation_theme = parent.get('variation_theme', '')
        if not variation_theme:
            errors.append(f"父商品缺少variation_theme: {parent_sku}")

        # 检查子变体
        children = self.get_child_variations(parent_sku)
        if not children:
            errors.append(f"父商品没有子变体: {parent_sku}")
            return False, errors

        # 验证每个子变体
        for idx, child in enumerate(children):
            child_sku = child.get('sku', '')
            if not child_sku:
                errors.append(f"子变体 #{idx+1} 缺少SKU")

            if not child.get('price'):
                errors.append(f"子变体 {child_sku} 缺少价格")

        return len(errors) == 0, errors

    def print_variation_structure(self):
        """打印变体结构预览"""
        groups = self.group_by_parent()

        print("\n" + "="*70)
        print("变体商品结构:")
        print("="*70)

        for parent_sku, products in groups.items():
            if len(products) == 1 and not products[0].get('parent_sku'):
                # 独立商品
                print(f"\n独立商品: {parent_sku}")
                print(f"  标题: {products[0].get('title', 'N/A')[:50]}")
            else:
                # 变体商品
                parent = self.get_parent_product(parent_sku)
                children = [p for p in products if p.get('parent_sku') == parent_sku]

                print(f"\n父商品: {parent_sku}")
                if parent:
                    print(f"  标题: {parent.get('title', 'N/A')[:50]}")
                    print(f"  变体主题: {parent.get('variation_theme', 'N/A')}")

                print(f"  子变体数量: {len(children)}")
                for idx, child in enumerate(children, 1):
                    color = child.get('color', '')
                    size = child.get('size', '')
                    variation_info = f"{color} {size}".strip() or 'N/A'
                    print(f"    {idx}. {child.get('sku', 'N/A')}: {variation_info}")

        print("="*70 + "\n")


def create_variation_example():
    """
    创建变体商品示例数据

    Returns:
        pd.DataFrame: 包含变体商品的示例数据
    """
    data = {
        # 父商品
        'sku': ['PARENT-TEE-001', 'CHILD-TEE-001-RED-S', 'CHILD-TEE-001-RED-M', 'CHILD-TEE-001-BLUE-S', 'CHILD-TEE-001-BLUE-M'],
        'parent_sku': ['', 'PARENT-TEE-001', 'PARENT-TEE-001', 'PARENT-TEE-001', 'PARENT-TEE-001'],
        'title': ['时尚T恤', '时尚T恤 红色 S码', '时尚T恤 红色 M码', '时尚T恤 蓝色 S码', '时尚T恤 蓝色 M码'],
        'brand': ['MyBrand', 'MyBrand', 'MyBrand', 'MyBrand', 'MyBrand'],
        'variation_theme': ['ColorSize', '', '', '', ''],
        'color': ['', '红色', '红色', '蓝色', '蓝色'],
        'size': ['', 'S', 'M', 'S', 'M'],
        'price': [0, 29.99, 29.99, 29.99, 29.99],
        'quantity': [0, 100, 100, 100, 100],
        'description': ['高品质纯棉T恤', '', '', '', ''],
        'main_image': ['C:/images/tee_main.jpg', 'C:/images/tee_red.jpg', 'C:/images/tee_red.jpg', 'C:/images/tee_blue.jpg', 'C:/images/tee_blue.jpg'],
    }

    return pd.DataFrame(data)


if __name__ == '__main__':
    # 测试示例
    df = create_variation_example()
    handler = VariationHandler(df)

    handler.print_variation_structure()

    # 验证变体数据
    valid, errors = handler.validate_variation_data('PARENT-TEE-001')
    if valid:
        print("[OK] 变体数据验证通过")
    else:
        print("[ERROR] 变体数据验证失败:")
        for error in errors:
            print(f"  - {error}")
