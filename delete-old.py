import os, re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Remove the specific block containing dash_reset_success
# We will use regex to find the div that contains it.
# It starts with <div className="relative flex flex-col items-center">
# And ends with </button>\s*</div> right after dash_reset_success.

pattern = r'<div className="relative flex flex-col items-center">\s*\{\/\* Tooltip Banner \*\/\}[\s\S]*?setMessage\(t\("dash_reset_success"\)\);[\s\S]*?<\/button>\s*<\/div>'

c = re.sub(pattern, '', c)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
