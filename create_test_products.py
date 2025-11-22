"""
创建测试用的商品Excel数据表格
包含独立商品和变体商品的虚假测试数据
"""
import pandas as pd
import os

# 创建测试商品数据
products = [
    {
        # 商品1: 无线蓝牙耳机
        'title': 'ワイヤレスイヤホン Bluetooth5.3 ノイズキャンセリング 高音質 防水IPX7',
        'brand': 'SoundPro',
        'manufacturer': 'SoundPro Electronics',
        'category': 'エレクトロニクス > イヤホン・ヘッドホン > イヤホン',
        'keywords': 'ワイヤレスイヤホン,Bluetooth,ノイズキャンセリング,防水,高音質',
        'description': '''
【最新Bluetooth5.3技術】最新のBluetooth5.3チップを搭載し、より安定した接続と低遅延を実現。音楽、通話、ゲームなど様々なシーンで快適にご使用いただけます。

【アクティブノイズキャンセリング】高性能なノイズキャンセリング機能により、周囲の騒音を効果的にカット。通勤・通学中でも音楽に集中できます。

【IPX7防水性能】IPX7防水規格により、雨や汗を気にせず使用可能。ランニングやジムでのトレーニングにも最適です。

【長時間再生】1回の充電で最大8時間の連続再生が可能。充電ケース併用で最大32時間使用できます。

【快適な装着感】人間工学に基づいたデザインで、長時間装着しても疲れにくい。S/M/Lの3サイズのイヤーピースを付属。
        '''.strip(),
        'bullet_points': '''
• Bluetooth5.3搭載で安定した接続
• アクティブノイズキャンセリング機能
• IPX7防水で運動時も安心
• 最大32時間の長時間再生
• 人間工学デザインで快適な装着感
        '''.strip(),
        'price': '4980',
        'quantity': '100',
        'condition': 'New',
        'item_weight': '50',
        'main_image': 'test_images/earphone_main.jpg',
        'image_1': 'test_images/earphone_1.jpg',
        'image_2': 'test_images/earphone_2.jpg',
        'sku': 'TEST-EARPHONE-001',
        'upc': '123456789012',
        'parent_sku': '',
        'variation_theme': '',
        'color': '',
        'size': ''
    },
    {
        # 商品2: 保温水筒
        'title': 'ステンレス水筒 真空断熱 保温保冷 1リットル 直飲み スポーツボトル',
        'brand': 'ThermoMax',
        'manufacturer': 'ThermoMax Japan',
        'category': 'ホーム&キッチン > キッチン用品 > 水筒・マグボトル',
        'keywords': '水筒,保温,保冷,ステンレス,スポーツボトル,1リットル',
        'description': '''
【優れた保温・保冷性能】真空二重構造により、保温効果は最大12時間、保冷効果は最大24時間持続。一年中快適な温度で飲み物をお楽しみいただけます。

【大容量1リットル】たっぷり1リットルサイズで、スポーツ、アウトドア、オフィスでの使用に最適。水分補給を忘れがちな方にもおすすめです。

【304ステンレス鋼使用】食品グレードの304ステンレス鋼を使用し、錆びにくく衛生的。金属臭がなく、飲み物の味を損ないません。

【広口設計】広口タイプで氷が入れやすく、お手入れも簡単。食器洗い機にも対応しています。

【漏れ防止設計】シリコンパッキンとロック機構により、バッグの中でも安心。持ち運びに便利なハンドル付き。
        '''.strip(),
        'bullet_points': '''
• 真空断熱で保温12時間・保冷24時間
• たっぷり使える1リットルサイズ
• 304ステンレス鋼で衛生的
• 広口設計でお手入れ簡単
• 完全漏れ防止のロック機構
        '''.strip(),
        'price': '2980',
        'quantity': '150',
        'condition': 'New',
        'item_weight': '380',
        'main_image': 'test_images/bottle_main.jpg',
        'image_1': 'test_images/bottle_1.jpg',
        'image_2': 'test_images/bottle_2.jpg',
        'sku': 'TEST-BOTTLE-001',
        'upc': '123456789013',
        'parent_sku': '',
        'variation_theme': '',
        'color': '',
        'size': ''
    },
    {
        # 商品3: USB充电线
        'title': 'USB-C ケーブル 【3本セット】急速充電 データ転送 高耐久ナイロン編み 1m/2m/3m',
        'brand': 'ChargeFast',
        'manufacturer': 'ChargeFast Technology',
        'category': 'エレクトロニクス > 携帯電話・スマートフォンアクセサリ > ケーブル',
        'keywords': 'USB-Cケーブル,急速充電,データ転送,ナイロン編み,耐久性',
        'description': '''
【3本セット・3つの長さ】1m、2m、3mの3本セットで、様々な使用シーンに対応。ベッドサイド、デスク、リビングなど、場所に応じて最適な長さを選べます。

【超高速充電】最大3A出力に対応し、従来のケーブルより約40%高速充電が可能。PD対応デバイスなら最短時間で満充電できます。

【高速データ転送】USB3.0規格対応で、最大480Mbpsのデータ転送速度を実現。大容量の写真や動画も素早く転送できます。

【高耐久性ナイロン編み】軍用級のナイロン素材で編み込み、断線に強い設計。10000回以上の折り曲げテストに合格しています。

【幅広い互換性】USB-C対応のスマートフォン、タブレット、ノートPC、ゲーム機など、ほぼ全てのUSB-Cデバイスに対応。
        '''.strip(),
        'bullet_points': '''
• 便利な3本セット(1m/2m/3m)
• 最大3A急速充電対応
• USB3.0高速データ転送
• 軍用級ナイロン編みで超耐久
• 幅広いUSB-Cデバイスに対応
        '''.strip(),
        'price': '1580',
        'quantity': '200',
        'condition': 'New',
        'item_weight': '120',
        'main_image': 'test_images/cable_main.jpg',
        'image_1': 'test_images/cable_1.jpg',
        'image_2': 'test_images/cable_2.jpg',
        'sku': 'TEST-CABLE-001',
        'upc': '123456789014',
        'parent_sku': '',
        'variation_theme': '',
        'color': '',
        'size': ''
    },

    # ========== 变体商品: T恤 - 父商品 ==========
    {
        'title': 'コットン Tシャツ 無地 半袖 メンズ レディース ユニセックス カジュアル',
        'brand': 'BasicWear',
        'manufacturer': 'BasicWear Japan',
        'category': 'ファッション > メンズ > トップス > Tシャツ',
        'keywords': 'Tシャツ,コットン,無地,半袖,ユニセックス',
        'description': '''
【100%コットン素材】柔らかく肌触りの良い100%コットン生地を使用。通気性に優れ、一年中快適に着用できます。

【シンプルなデザイン】無地のベーシックデザインで、どんなスタイルにも合わせやすい。カジュアルからきれいめまで幅広く対応します。

【ユニセックス仕様】男女兼用デザインで、カップルやお揃いコーデにもおすすめ。豊富なカラーとサイズ展開でお気に入りが見つかります。

【丈夫な縫製】二重縫いの丈夫な作りで、洗濯を繰り返しても型崩れしにくい。長くご愛用いただけます。

【豊富なカラー】定番の黒・白・グレーから、トレンドカラーまで多彩なバリエーション。コーディネートの幅が広がります。
        '''.strip(),
        'bullet_points': '''
• 100%コットンで柔らかな着心地
• シンプルで合わせやすいデザイン
• 男女兼用のユニセックス仕様
• 丈夫な縫製で長持ち
• 豊富なカラー・サイズ展開
        '''.strip(),
        'price': '',  # 父商品は価格なし
        'quantity': '',  # 父商品は在庫なし
        'condition': 'New',
        'item_weight': '180',
        'main_image': 'test_images/tshirt_main.jpg',
        'image_1': 'test_images/tshirt_1.jpg',
        'image_2': 'test_images/tshirt_2.jpg',
        'sku': 'PARENT-TSHIRT-001',
        'upc': '',
        'parent_sku': '',
        'variation_theme': 'ColorSize',  # 变体主题: 颜色和尺寸
        'color': '',
        'size': ''
    },

    # ========== 变体商品: T恤 - 子变体 (黑色 S码) ==========
    {
        'title': 'コットン Tシャツ ブラック Sサイズ',
        'brand': 'BasicWear',
        'manufacturer': 'BasicWear Japan',
        'category': 'ファッション > メンズ > トップス > Tシャツ',
        'keywords': '',
        'description': '',
        'bullet_points': '',
        'price': '1980',
        'quantity': '50',
        'condition': 'New',
        'item_weight': '180',
        'main_image': 'test_images/tshirt_black_s.jpg',
        'image_1': '',
        'image_2': '',
        'sku': 'CHILD-TSHIRT-001-BLACK-S',
        'upc': '',
        'parent_sku': 'PARENT-TSHIRT-001',
        'variation_theme': '',
        'color': 'ブラック',
        'size': 'S'
    },

    # ========== 变体商品: T恤 - 子变体 (黑色 M码) ==========
    {
        'title': 'コットン Tシャツ ブラック Mサイズ',
        'brand': 'BasicWear',
        'manufacturer': 'BasicWear Japan',
        'category': 'ファッション > メンズ > トップス > Tシャツ',
        'keywords': '',
        'description': '',
        'bullet_points': '',
        'price': '1980',
        'quantity': '50',
        'condition': 'New',
        'item_weight': '180',
        'main_image': 'test_images/tshirt_black_m.jpg',
        'image_1': '',
        'image_2': '',
        'sku': 'CHILD-TSHIRT-001-BLACK-M',
        'upc': '',
        'parent_sku': 'PARENT-TSHIRT-001',
        'variation_theme': '',
        'color': 'ブラック',
        'size': 'M'
    },

    # ========== 变体商品: T恤 - 子变体 (白色 S码) ==========
    {
        'title': 'コットン Tシャツ ホワイト Sサイズ',
        'brand': 'BasicWear',
        'manufacturer': 'BasicWear Japan',
        'category': 'ファッション > メンズ > トップス > Tシャツ',
        'keywords': '',
        'description': '',
        'bullet_points': '',
        'price': '1980',
        'quantity': '50',
        'condition': 'New',
        'item_weight': '180',
        'main_image': 'test_images/tshirt_white_s.jpg',
        'image_1': '',
        'image_2': '',
        'sku': 'CHILD-TSHIRT-001-WHITE-S',
        'upc': '',
        'parent_sku': 'PARENT-TSHIRT-001',
        'variation_theme': '',
        'color': 'ホワイト',
        'size': 'S'
    },

    # ========== 变体商品: T恤 - 子变体 (白色 M码) ==========
    {
        'title': 'コットン Tシャツ ホワイト Mサイズ',
        'brand': 'BasicWear',
        'manufacturer': 'BasicWear Japan',
        'category': 'ファッション > メンズ > トップス > Tシャツ',
        'keywords': '',
        'description': '',
        'bullet_points': '',
        'price': '1980',
        'quantity': '50',
        'condition': 'New',
        'item_weight': '180',
        'main_image': 'test_images/tshirt_white_m.jpg',
        'image_1': '',
        'image_2': '',
        'sku': 'CHILD-TSHIRT-001-WHITE-M',
        'upc': '',
        'parent_sku': 'PARENT-TSHIRT-001',
        'variation_theme': '',
        'color': 'ホワイト',
        'size': 'M'
    }
]

# 创建DataFrame
df = pd.DataFrame(products)

# 确保输出目录存在
output_dir = 'data/input'
os.makedirs(output_dir, exist_ok=True)

# 保存为Excel文件
output_path = os.path.join(output_dir, 'test_products.xlsx')
df.to_excel(output_path, index=False, engine='openpyxl')

print("="*60)
print("测试商品Excel表格创建成功!")
print("="*60)
print(f"\n文件路径: {output_path}")
print(f"总数据条数: {len(products)}")

# 统计商品类型
independent_count = sum(1 for p in products if p['parent_sku'] == '' and p['variation_theme'] == '')
parent_count = sum(1 for p in products if p['variation_theme'] != '')
child_count = sum(1 for p in products if p['parent_sku'] != '')

print(f"\n商品统计:")
print(f"  独立商品: {independent_count} 个")
print(f"  变体父商品: {parent_count} 个")
print(f"  变体子商品: {child_count} 个")

print(f"\n商品列表:")
for i, product in enumerate(products, 1):
    # 判断商品类型
    if product['parent_sku'] == '' and product['variation_theme'] == '':
        # 独立商品
        print(f"\n{i}. [独立] {product['title'][:40]}...")
        print(f"   品牌: {product['brand']}")
        print(f"   价格: ¥{product['price']}")
        print(f"   库存: {product['quantity']}")
        print(f"   SKU: {product['sku']}")
    elif product['variation_theme'] != '':
        # 变体父商品
        print(f"\n{i}. [变体父] {product['title'][:40]}...")
        print(f"   品牌: {product['brand']}")
        print(f"   变体主题: {product['variation_theme']}")
        print(f"   SKU: {product['sku']}")
    elif product['parent_sku'] != '':
        # 变体子商品
        print(f"   └─ [子变体] {product['color']} {product['size']}")
        print(f"      价格: ¥{product['price']} | 库存: {product['quantity']}")
        print(f"      SKU: {product['sku']}")

print("\n" + "="*60)
print("列信息:")
print("="*60)
for col in df.columns:
    print(f"  - {col}")

print("\n" + "="*60)
print("注意事项:")
print("="*60)
print("1. 这些是虚假的测试数据,仅用于测试自动化流程")
print("2. 图片路径是占位符,实际使用时需要替换为真实图片路径")
print("3. 商品描述使用日语,适合日本亚马逊站点测试")
print("4. UPC码是随机生成的,实际使用需要真实的条形码")
print("5. SKU可以根据你的实际需求修改")

print("\n下一步:")
print("1. 查看生成的Excel文件: data/input/test_products.xlsx")
print("2. 根据需要修改商品信息")
print("3. 准备测试图片(或暂时跳过图片上传)")
print("4. 运行自动化测试: python main.py upload")
print("="*60)
