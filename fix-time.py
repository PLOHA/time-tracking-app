import os

with open('src/actions/time-tracking.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace bkkTime.toISOString() with new Date().toISOString() to fix the double-conversion bug
c = c.replace('serverTime: bkkTime.toISOString()', 'serverTime: new Date().toISOString()')

with open('src/actions/time-tracking.ts', 'w', encoding='utf-8') as f:
    f.write(c)
