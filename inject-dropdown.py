import os

with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add state
c = c.replace('const [targetDate, setTargetDate] = useState(() => {', 'const [timeRange, setTimeRange] = useState<"DAY" | "MONTH" | "YEAR">("DAY");\n  const [targetDate, setTargetDate] = useState(() => {')

# 2. Update useEffect dependencies
c = c.replace('}, [status, activeTab, targetDate]);', '}, [status, activeTab, targetDate, timeRange]);')

# 3. Update fetchData
c = c.replace('getAdminLogs(targetDate),', 'getAdminLogs(targetDate, timeRange),')

# 4. Inject Time Range UI above the Date picker
time_range_ui = '''
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500 px-1">{language === "th" ? "ช่วงเวลา" : "Time Range"}</label>
                  <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value as "DAY" | "MONTH" | "YEAR")} 
                    className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 appearance-none font-bold"
                  >
                    <option value="DAY">{language === "th" ? "รายวัน (ตามวันที่เลือก)" : "Daily (Selected Date)"}</option>
                    <option value="MONTH">{language === "th" ? "รายเดือน (ทั้งเดือน)" : "Monthly (Entire Month)"}</option>
                    <option value="YEAR">{language === "th" ? "รายปี (ทั้งปี)" : "Yearly (Entire Year)"}</option>
                  </select>
                </div>

'''

# Find the label "Date" to inject right before its container
target = '<div className="flex justify-between items-center mb-1">\n                    <label className="text-sm font-semibold text-gray-500 px-1">{language === "th" ? "วันที่" : "Date"}</label>'

if target in c:
    c = c.replace(target, time_range_ui + target)
else:
    # Use regex
    import re
    c = re.sub(r'<div className="flex justify-between items-center mb-1">\s*<label className="text-sm font-semibold text-gray-500 px-1">\{language === "th" \? "วันที่" : "Date"\}</label>', time_range_ui + r'<div className="flex justify-between items-center mb-1">\n                    <label className="text-sm font-semibold text-gray-500 px-1">{language === "th" ? "วันที่" : "Date"}</label>', c)


with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
