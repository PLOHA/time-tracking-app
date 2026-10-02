import os

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('const res = await actionFn(pos.coords.latitude, pos.coords.longitude, distance, settings.allowedRadius);', 'const res: any = await actionFn(pos.coords.latitude, pos.coords.longitude, distance, settings.allowedRadius);')

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
