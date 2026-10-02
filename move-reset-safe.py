import os, re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add state
c = c.replace('const [effects, setEffects] = useState(true);', 'const [effects, setEffects] = useState(true);\n    const [hasClickedReset, setHasClickedReset] = useState(false);')

# 2. Remove old button
old_btn = r'<div className="relative flex flex-col items-center">\s*\{\/\* Tooltip Banner \*\/\}[\s\S]*?<\/div>'
c = re.sub(old_btn, '', c)

# 3. Inject new button at the very end just before the last </div>
new_btn = '''
        {/* Reset For Testing Area */}
        <div className="mt-8 mb-12 flex flex-col items-center justify-center w-full max-w-md">
           {!hasClickedReset && (
              <div className="text-center text-xs md:text-sm text-gray-500 mb-4 px-4 font-medium animate-pulse">
                 {language === 'th' 
                    ? "กดปุ่มเมื่อคุณอยากทดสอบลงเวลาใหม่ เมื่อกดเวลาล่าสุดที่คุณทำจะหายไป!!" 
                    : "Press this when you want to test clocking in again. Your latest log will disappear!!"}
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
      </div>
'''
c = c.rsplit('</div>', 1)[0] + new_btn + '\n    </div>\n  );\n}'

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
