import os, re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

pattern = r'\{\!hasClickedReset && \(\s*<div className="absolute -top-10 whitespace-nowrap bg-blue-500 text-white text-\[10px\] md:text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg z-10 animate-bounce">\s*\{language === \'th\' \? \'[^\']+\' : \'Reset to test again\'\}\s*<div className="absolute -bottom-1 left-1\/2 transform -translate-x-1\/2 w-2 h-2 bg-blue-500 rotate-45"><\/div>\s*<\/div>\s*\)\}'

c = re.sub(pattern, '', c)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
