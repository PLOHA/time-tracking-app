import os, re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix the duplicate else blocks
c = re.sub(
    r'\} else \{\s*setMessage\(language === "th" \? `ยืนยันพิกัดสำเร็จ คุณอยู่ในระยะที่กำหนด \(\$\{dist\} เมตร\)` : `Location valid\. You are within bounds \(\$\{dist\}m\)\.`\);\s*\} else \{\s*setMessage\(language === "th" \? `พิกัดถูกต้อง คุณอยู่ในระยะที่กำหนด \(\$\{dist\} เมตร\)` : `Location valid\. You are within bounds \(\$\{dist\}m\)\.`\);\s*\}',
    r'} else {\n              setMessage(language === "th" ? `ยืนยันพิกัดสำเร็จ คุณอยู่ในระยะที่กำหนด (${dist} เมตร)` : `Location valid. You are within bounds (${dist}m).`);\n            }',
    c
)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
