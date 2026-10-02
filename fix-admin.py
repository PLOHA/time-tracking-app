with open("src/app/admin/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

start = -1
end = -1
for i, line in enumerate(lines):
    if '{activeTab === "SETTINGS" && (' in line:
        start = i
for i in range(start, len(lines)):
    if '  {/* User Calendar Modal */}' in lines[i]:
        end = i - 2
        break

branches_ui = '''      {activeTab === "SETTINGS" && (
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

new_lines = lines[:start] + [branches_ui] + lines[end+1:]

with open("src/app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
