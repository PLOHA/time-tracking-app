import os, re

def strip_language(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()

    # Generic language === "th" ? "THAI" : "ENGLISH"
    c = re.sub(r'language === [\'"]th[\'"] \? [\'"][^\'"]+[\'"] : ([\'"][^\'"]+[\'"])', r'\1', c)
    c = re.sub(r'language === [\'"]th[\'"] \? `[^`]+` : (`[^`]+`)', r'\1', c)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)

strip_language("src/app/admin/page.tsx")
strip_language("src/app/dashboard/page.tsx")
