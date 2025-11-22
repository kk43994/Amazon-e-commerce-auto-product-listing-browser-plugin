"""
配置文件加载器
"""

import yaml
import os
from typing import Dict, Any


class ConfigLoader:
    """配置加载器"""

    def __init__(self, config_path: str = "config/config.yaml"):
        """
        初始化配置加载器

        Args:
            config_path: 配置文件路径
        """
        self.config_path = config_path
        self.config = {}

    def load(self) -> Dict[str, Any]:
        """
        加载配置文件

        Returns:
            Dict: 配置字典
        """
        try:
            if not os.path.exists(self.config_path):
                print(f"[ERROR] 配置文件不存在: {self.config_path}")
                print("[INFO] 请从 config.yaml.example 复制并修改配置文件")
                return {}

            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = yaml.safe_load(f) or {}

            print(f"[OK] 配置文件加载成功: {self.config_path}")
            return self.config

        except yaml.YAMLError as e:
            print(f"[ERROR] 配置文件格式错误: {e}")
            return {}
        except Exception as e:
            print(f"[ERROR] 加载配置失败: {e}")
            return {}

    def get(self, key_path: str, default=None):
        """
        获取配置值(支持点号分隔的路径)

        Args:
            key_path: 配置键路径,如 "ziniao.account.company"
            default: 默认值

        Returns:
            配置值
        """
        keys = key_path.split('.')
        value = self.config

        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default

        return value

    def validate(self) -> bool:
        """
        验证配置文件完整性

        Returns:
            bool: 是否有效
        """
        if not self.config:
            print("[ERROR] 配置为空")
            return False

        # 必需的配置项
        required_keys = [
            'ziniao.client_path',
            'ziniao.account.company',
            'ziniao.account.username',
            'ziniao.account.password',
            'data.input_excel',
        ]

        missing_keys = []
        for key_path in required_keys:
            if self.get(key_path) is None:
                missing_keys.append(key_path)

        if missing_keys:
            print(f"[ERROR] 缺少必需配置项: {missing_keys}")
            return False

        print("[OK] 配置验证通过")
        return True

    def print_config(self, hide_sensitive: bool = True):
        """
        打印配置信息

        Args:
            hide_sensitive: 是否隐藏敏感信息
        """
        print(f"\n{'='*60}")
        print("当前配置:")
        print(f"{'='*60}")

        def print_dict(d, indent=0):
            for key, value in d.items():
                if isinstance(value, dict):
                    print(f"{'  ' * indent}{key}:")
                    print_dict(value, indent + 1)
                else:
                    # 隐藏密码
                    if hide_sensitive and key == 'password':
                        print(f"{'  ' * indent}{key}: {'*' * 8}")
                    else:
                        print(f"{'  ' * indent}{key}: {value}")

        print_dict(self.config)
        print(f"{'='*60}\n")
