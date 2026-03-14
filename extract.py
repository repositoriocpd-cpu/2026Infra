import re, sys

def extract_and_check(filepath, outpath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception:
        with open(filepath, "r", encoding="utf-16") as f:
            content = f.read()

    scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL | re.IGNORECASE)
    
    with open(outpath, "w", encoding="utf-8") as f:
        # Define window and document mocks to avoid reference errors if we were to run it, but node -c only checks syntax.
        for i, script in enumerate(scripts):
            f.write(f"// Script {i}\n")
            f.write(script + "\n")
    print(f"Extracted {len(scripts)} scripts to {outpath}")

extract_and_check("fixed_encoding.html", "fixed_script.js")
extract_and_check("2026 Infra Sistemas.html", "2026_script.js")
