import os

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. REMOVE THE TOP BUTTON
start_idx = c.find('<div className="relative flex flex-col items-center">\n              {/* Tooltip Banner */}')
if start_idx != -1:
    end_idx = c.find('</button>\n            </div>', start_idx) + len('</button>\n            </div>')
    c = c[:start_idx] + c[end_idx:]

# 2. UPDATE THE BOTTOM BUTTON TO ADD THE TOOLTIP
bot_start = c.find('{/* Reset For Testing Area */}')
if bot_start != -1:
    bot_end = c.find('</button>\n      </div>', bot_start) + len('</button>\n      </div>')
    
    new_bot = '''{/* Reset For Testing Area */}
      <div className="mt-8 mb-12 flex flex-col items-center justify-center w-full max-w-md">
         {!hasClickedReset && (
            <div className="text-center text-xs md:text-sm text-gray-500 mb-8 px-4 font-medium animate-pulse">
               {language === 'th' 
                  ? "กดปุ่มเมื่อคุณอยากทดสอบลงเวลาใหม่ เมื่อกดเวลาล่าสุดที่คุณทำจะหายไป!!" 
                  : "Press this when you want to test clocking in again. Your latest log will disappear!!"}
            </div>
         )}
         <div className="relative flex flex-col items-center">
            {!hasClickedReset && (
               <div className="absolute -top-10 whitespace-nowrap bg-blue-500 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg z-10 animate-bounce">
                  {language === 'th' ? 'ล้างข้อมูลเพื่อเทสต์ใหม่' : 'Reset to test again'}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45"></div>
               </div>
            )}
            <button
              onClick={async () => {
                 setHasClickedReset(true);
                 const confirmed = window.confirm(language === 'th' ? "แน่ใจใช่ไหม?" : "Are you sure?");
                 if (!confirmed) return;
                 
                 await clearMyLogs();
                 setTodayLog(null);
                 setDistance(null);
                 setLocationState("IDLE");
                 setMessage(language === "th" ? "รีเซ็ตข้อมูลสำเร็จ" : "Logs cleared!");
              }}
              className={`px-6 py-3 rounded-xl neu-flat flex items-center justify-center gap-2 text-blue-500 transition-all font-bold ${effects ? 'active:neu-pressed hover:scale-105' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              {language === 'th' ? 'ล้างข้อมูลเพื่อเทสต์ใหม่' : 'Reset to test again'}
            </button>
         </div>
      </div>'''
    c = c[:bot_start] + new_bot + c[bot_end:]

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
