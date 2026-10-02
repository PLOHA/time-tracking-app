import re

with open("src/app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
if 'getAdminBranches' not in content:
    content = content.replace('import { getCompanySettings } from "@/actions/time-tracking";',
'''import { getCompanySettings } from "@/actions/time-tracking";
import { getAdminBranches, updateAdminBranch } from "@/actions/admin";''')

# 2. Add branches state
if 'const [branches, setBranches]' not in content:
    content = content.replace('const [users, setUsers] = useState<any[]>([]);',
'''const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);''')

# 3. Add to loadInitialData
content = content.replace('''          getAdminLogs(targetDate),
          users.length === 0 ? getUsers() : Promise.resolve(users)
        ]);
        setLogs(data);
        setUsers(usersData);''', 
'''          getAdminLogs(targetDate),
          users.length === 0 ? getUsers() : Promise.resolve(users),
          branches.length === 0 ? getAdminBranches() : Promise.resolve(branches)
        ]);
        setLogs(data);
        setUsers(usersData);
        setBranches(bData);''')

# 4. Fetch in SETTINGS tab
content = content.replace('''      } else if (activeTab === "SETTINGS") {
        const data = await getCompanySettings();
        if (data) {
          setSettingsData({ lat: data.companyLat, lng: data.companyLng, radius: data.allowedRadius });
        }
      }''',
'''      } else if (activeTab === "SETTINGS") {
        if (branches.length === 0) {
          const bData = await getAdminBranches();
          setBranches(bData);
        }
      }''')

# 5. Fetch in USERS tab
content = content.replace('''      } else if (activeTab === "USERS") {
        if (users.length === 0) {
          const data = await getUsers();
          setUsers(data);
        }
      }''',
'''      } else if (activeTab === "USERS") {
        if (users.length === 0) {
          const data = await getUsers();
          setUsers(data);
        }
        if (branches.length === 0) {
          const bData = await getAdminBranches();
          setBranches(bData);
        }
      }''')

# 5. Tab text change
content = content.replace('{t("admin_tab_settings")}', 'สาขา (Branches)')

# 6. UI for SETTINGS tab (Branches)
branches_ui = '''
      {activeTab === "SETTINGS" && (
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {branches.map(b => (
            <div key={b.id} className="neu-flat p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full neu-pressed flex items-center justify-center text-neu-blue text-xl">🏢</div>
                  <h2 className="text-xl font-bold text-gray-700">{b.name}</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6">🕒 Timezone: {b.timezone}</p>
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  try {
                    await updateAdminBranch(b.id, {
                      name: b.name,
                      timezone: b.timezone,
                      lat: parseFloat(target.lat.value),
                      lng: parseFloat(target.lng.value),
                      allowedRadius: parseInt(target.radius.value)
                    });
                    alert("บันทึก " + b.name + " สำเร็จ!");
                  } catch (err: any) {
                    alert("Error: " + err.message);
                  }
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 px-1">ละติจูด (Lat)</label>
                      <input name="lat" required type="number" step="any" defaultValue={b.lat} className="w-full neu-input rounded-xl px-4 py-3 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 px-1">ลองจิจูด (Lng)</label>
                      <input name="lng" required type="number" step="any" defaultValue={b.lng} className="w-full neu-input rounded-xl px-4 py-3 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 px-1">รัศมีที่อนุญาต (เมตร)</label>
                    <input name="radius" required type="number" defaultValue={b.allowedRadius} className="w-full neu-input rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <button type="submit" className="w-full neu-btn rounded-xl py-3 text-neu-blue font-bold text-sm mt-4">บันทึกพิกัด</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
'''

content = re.sub(r'\{activeTab === "SETTINGS" && \(\s*<div className="max-w-2xl w-full neu-flat p-8">.*?\}\)\s*\}\s*</div>\s*\)\}', branches_ui.strip(), content, flags=re.DOTALL)


# 7. Add Dropdown to Add User Form
content = content.replace('const [newUser, setNewUser] = useState({ name: "", email: "", password: "", shiftType: "OFFICE", cycleStartDate: "" });',
'const [newUser, setNewUser] = useState({ name: "", email: "", password: "", shiftType: "OFFICE", cycleStartDate: "", branchId: "" });')

user_dropdown = '''               <div className="mt-4">
                 <label className="block text-xs font-bold text-gray-500 mb-2 px-1">สาขา (Branch)</label>
                 <select className="w-full neu-input rounded-xl px-4 py-3 text-sm text-gray-700 bg-transparent appearance-none" value={newUser.branchId} onChange={e => setNewUser({...newUser, branchId: e.target.value})}>
                   <option value="">-- ไม่ระบุ (ใช้สำนักงานใหญ่) --</option>
                   {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                 </select>
               </div>
               <button type="submit"'''
# Carefully replace ONLY the <button type="submit" inside the Add User form!
content = content.replace('''              <button type="submit" className="w-full neu-btn rounded-xl py-3 text-neu-blue font-bold text-sm mt-8">
                {t("admin_add_user")}
              </button>''', 
user_dropdown + ''' className="w-full neu-btn rounded-xl py-3 text-neu-blue font-bold text-sm mt-8">
                {t("admin_add_user")}
              </button>''')

content = content.replace('shiftType: newUser.shiftType as any,\n                 cycleStartDate: newUser.cycleStartDate || null,',
'shiftType: newUser.shiftType as any,\n                 cycleStartDate: newUser.cycleStartDate || null,\n                 branchId: newUser.branchId || null,')


with open("src/app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
