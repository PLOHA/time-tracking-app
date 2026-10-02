import os

with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

kpi_cards = '''
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="neu-flat p-6 flex flex-col items-center justify-center text-center">
                <div className="text-sm font-bold text-gray-400 mb-1">{language === 'th' ? "มาทำงาน (ปกติ)" : "Present (Normal)"}</div>
                <div className="text-3xl md:text-4xl font-black text-green-500">{todayNormal}</div>
              </div>
              <div className="neu-flat p-6 flex flex-col items-center justify-center text-center">
                <div className="text-sm font-bold text-gray-400 mb-1">{language === 'th' ? "มาสาย" : "Late"}</div>
                <div className="text-3xl md:text-4xl font-black text-yellow-500">{todayLate}</div>
              </div>
              <div className="neu-flat p-6 flex flex-col items-center justify-center text-center">
                <div className="text-sm font-bold text-gray-400 mb-1">{language === 'th' ? "ผิดสถานที่" : "Out of Bounds"}</div>
                <div className="text-3xl md:text-4xl font-black text-red-500">{todayOutOfBounds}</div>
              </div>
              <div className="neu-flat p-6 flex flex-col items-center justify-center text-center">
                <div className="text-sm font-bold text-gray-400 mb-1">{language === 'th' ? "ขาด/ลางาน" : "Missing / Leave"}</div>
                <div className="text-3xl md:text-4xl font-black text-gray-400">{todayMissing}</div>
              </div>
            </div>
'''

target = '{activeTab === "LOGS" && (\n          <div className="max-w-6xl w-full flex flex-col gap-8">'

if target in c:
    c = c.replace(target, target + '\n' + kpi_cards)
else:
    # Try with regex in case formatting differs
    import re
    c = re.sub(r'\{activeTab === "LOGS" && \(\s*<div className="max-w-6xl w-full flex flex-col gap-8">', target + '\n' + kpi_cards, c)

with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
