import os

with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

dropdown_ui = '''
            {/* Time Range Selector */}
            <div className="neu-flat p-4 flex items-center justify-between gap-4">
               <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Time Range Filter</div>
               <select 
                 value={timeRange} 
                 onChange={(e) => setTimeRange(e.target.value as "DAY" | "MONTH" | "YEAR")} 
                 className="px-4 py-2 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 font-bold appearance-none cursor-pointer"
               >
                 <option value="DAY">Daily (Selected Date)</option>
                 <option value="MONTH">Monthly (Entire Month)</option>
                 <option value="YEAR">Yearly (Entire Year)</option>
               </select>
            </div>
'''

target = '{/* KPI Cards */}'

c = c.replace(target, dropdown_ui + '\n            ' + target)

with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
