const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

// 1. Rename tab
c = c.replace('สาขา (Branches)', 'Location Settings');

// 2. Change fetchData for SETTINGS
const oldFetchSettings = `        } else if (activeTab === "SETTINGS") {
          if (branches.length === 0) {
            const bData = await getAdminBranches();
            setBranches(bData);
          }
        }`;

const newFetchSettings = `        } else if (activeTab === "SETTINGS") {
          const sData = await getCompanySettings();
          if (sData) {
            setSettingsData({ lat: sData.companyLat, lng: sData.companyLng, radius: sData.allowedRadius });
          }
        }`;
c = c.replace(oldFetchSettings, newFetchSettings);

// 3. Rewrite SETTINGS UI block
const oldSettingsUI = `{activeTab === "SETTINGS" && (
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            {branches.map(b => (
              <div key={b.id} className="neu-flat p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full neu-pressed flex items-center justify-center text-neu-blue text-xl">🏢</div>
                    <h2 className="text-xl font-bold text-gray-700">{b.name}</h2>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">📍 Timezone: {b.timezone}</p>
                  
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
                      alert("อัพเดต " + b.name + " สำเร็จ!");
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
                      <label className="block text-xs font-bold text-gray-500 mb-1 px-1">ระยะที่อนุญาต (เมตร)</label>
                      <input name="radius" required type="number" defaultValue={b.allowedRadius} className="w-full neu-input rounded-xl px-4 py-3 text-sm" />
                    </div>
                    <button type="submit" className="w-full neu-btn rounded-xl py-3 text-neu-blue font-bold text-sm mt-4">บันทึกพิกัดสาขา</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}`;

const newSettingsUI = `{activeTab === "SETTINGS" && (
          <div className="max-w-2xl w-full mx-auto">
            <div className="neu-flat p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full neu-pressed flex items-center justify-center text-neu-blue text-xl">📍</div>
                  <h2 className="text-2xl font-bold text-gray-700">Global Location Settings</h2>
                </div>
                <p className="text-sm text-gray-500 mb-8">Set the central coordinate and allowed radius for the check-in zone.</p>
                
                {settingMsg && (
                  <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 text-sm font-bold text-center border border-green-200">
                    {settingMsg}
                  </div>
                )}
                
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2 px-1">Latitude</label>
                      <input 
                        required 
                        type="number" 
                        step="any" 
                        value={settingsData.lat} 
                        onChange={e => setSettingsData({...settingsData, lat: parseFloat(e.target.value)})} 
                        className="w-full neu-input rounded-xl px-4 py-3" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2 px-1">Longitude</label>
                      <input 
                        required 
                        type="number" 
                        step="any" 
                        value={settingsData.lng} 
                        onChange={e => setSettingsData({...settingsData, lng: parseFloat(e.target.value)})} 
                        className="w-full neu-input rounded-xl px-4 py-3" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2 px-1">Allowed Radius (Meters)</label>
                    <input 
                      required 
                      type="number" 
                      value={settingsData.radius} 
                      onChange={e => setSettingsData({...settingsData, radius: parseInt(e.target.value)})} 
                      className="w-full neu-input rounded-xl px-4 py-3" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full neu-btn rounded-xl py-4 text-neu-blue font-bold mt-4"
                  >
                    {isSubmitting ? "Saving..." : "Save Location Settings"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}`;

c = c.replace(oldSettingsUI, newSettingsUI);

fs.writeFileSync('src/app/admin/page.tsx', c);
console.log("Replaced successfully!");
