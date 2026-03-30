import os

def search_files(directory, query):
    for root, dirs, files in os.walk(directory):
        if "node_modules" in root or ".git" in root or ".gemini" in root:
            continue
        for file in files:
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if query in content:
                        print(f"Found in {path}")
            except UnicodeDecodeError:
                try:
                    with open(path, 'r', encoding='utf-16') as f:
                        content = f.read()
                        if query in content:
                            print(f"Found in {path}")
                except Exception:
                    pass
            except Exception:
                pass

search_files(r'e:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN', 'SCRIPT INITIALIZING')
