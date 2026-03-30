import sys

def get_lines(file_path, query):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                if query in line:
                    print(f"Line {i+1}: {line.strip()}")
    except Exception as e:
        print("Error utf-8", e)
        try:
            with open(file_path, 'r', encoding='utf-16') as f:
                for i, line in enumerate(f):
                    if query in line:
                        print(f"Line {i+1}: {line.strip()}")
        except Exception as e:
            print("Error utf-16", e)

get_lines(r'e:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\fixed_encoding.html', 'id="total-processes"')
