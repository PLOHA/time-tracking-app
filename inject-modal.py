import os

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add state for outOfHoursData
c = c.replace('const [settings, setSettings] = useState<any>(null);', 'const [settings, setSettings] = useState<any>(null);\n  const [outOfHoursData, setOutOfHoursData] = useState<any>(null);')

# 2. Modify handleClockAction
old_action_logic = '''          const actionFn = todayLog && !todayLog.clockOutTime ? clockOut : clockIn;
          const res = await actionFn(pos.coords.latitude, pos.coords.longitude, distance, settings.allowedRadius);
          
          if (res.success) {
            setMessage(res.flagged ? t("dash_success_red") : t("dash_success"));
            setLocationState("IDLE");
            await loadInitialData(); // Reload log
          } else {
            setMessage(language === "th" ? res.message : (res.message.includes("???????????????") ? "Out of allowed time window" : res.message.includes("??????????????????") ? "Not allowed to clock in today" : res.message));
          }
          setIsSubmitting(false);'''

new_action_logic = '''          const actionFn = todayLog && !todayLog.clockOutTime ? clockOut : clockIn;
          const res = await actionFn(pos.coords.latitude, pos.coords.longitude, distance, settings.allowedRadius);
          
          if (res.success) {
            setMessage(res.flagged ? t("dash_success_red") : t("dash_success"));
            setLocationState("IDLE");
            await loadInitialData(); // Reload log
          } else {
            if (res.errorType === "OUT_OF_HOURS") {
              setOutOfHoursData(res);
            } else {
              setMessage(res.message);
            }
          }
          setIsSubmitting(false);'''

# Note: The old action logic might have spaces/CRLFs, we use string matching cautiously.
# Let's write a targeted replace for handleClockAction body.
# Better to do it via python string finding
start_idx = c.find('const actionFn = todayLog && !todayLog.clockOutTime ? clockOut : clockIn;')
end_idx = c.find('setIsSubmitting(false);\n       });', start_idx) + len('setIsSubmitting(false);')

c = c[:start_idx] + new_action_logic + c[end_idx:]

# 3. Add the modal JSX at the very end before the last closing tags
modal_jsx = '''
      {/* Out of Hours Modal */}
      {outOfHoursData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOutOfHoursData(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 rounded-full w-24 h-24 flex items-center justify-center border-8 border-white dark:border-gray-800 shadow-xl">
              <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            
            <div className="mt-10 text-center">
              <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">
                {language === 'th' ? "ยังไม่ถึงเวลาทำงานของคุณ!" : "Not Your Working Hours!"}
              </h3>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 px-2">
                {language === 'th' ? "ดูเหมือนคุณจะพยายามลงเวลาผิดช่วงเวลาครับ พักผ่อนก่อนน้า 🛌" : "Looks like you're trying to clock in outside your shift. Go get some rest! 🛌"}
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6 text-left border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{language === 'th' ? "เวลาเซิร์ฟเวอร์ตอนนี้" : "Current Server Time"}</span>
                  <span className="text-sm font-bold text-red-500">
                    {new Date(outOfHoursData.serverTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Singapore', hour12: false, hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{language === 'th' ? "กะและเวลาทำงานของคุณ" : "Your Assigned Shift"}</span>
                  <span className="text-sm font-bold text-blue-500">{outOfHoursData.shiftDetails}</span>
                </div>
              </div>

              <button
                onClick={() => setOutOfHoursData(null)}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all active:scale-95"
              >
                {language === 'th' ? "รับทราบ" : "Got it"}
              </button>
            </div>
          </div>
        </div>
      )}
'''

c = c.replace('    </div>\n    </>', modal_jsx + '\n    </div>\n    </>')

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
