import os, re

thai_pattern = re.compile(r'[\u0E00-\u0E7F]+')

def find_thai(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root or '.next' in root or '.git' in root:
            continue
        for file in files:
            if not file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                continue
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines):
                        if thai_pattern.search(line):
                            print(f"{filepath}:{i+1}: {line.strip()}")
            except:
                pass

find_thai('.')
