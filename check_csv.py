import csv

filename = 'wanzhengbiaodan.csv'

try:
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader, 1):
            print(f"Row {i}: {len(row)} columns")
except Exception as e:
    print(f"Error: {e}")
