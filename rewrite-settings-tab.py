import os

with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('สาขา (Branches)', 'Location Settings')
c = c.replace('???? (Branches)', 'Location Settings')

# Replace the fetchData logic
start_fetch = c.find('} else if (activeTab === "SETTINGS") {')
end_fetch = c.find('}', c.find('setBranches(bData);', start_fetch)) + 1
new_fetch = '''} else if (activeTab === "SETTINGS") {
          const sData = await getCompanySettings();
          if (sData) {
            setSettingsData({ lat: sData.companyLat, lng: sData.companyLng, radius: sData.allowedRadius });
          }
        }'''
c = c[:start_fetch] + new_fetch + c[end_fetch:]

# Replace the UI block
start_ui = c.find('{activeTab === "SETTINGS" && (')
end_ui = c.find(')}', c.find('</form>', start_ui)) + 2

new_ui = '''{activeTab === "SETTINGS" && (
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
        )}'''

c = c[:start_ui] + new_ui + c[end_ui:]

with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
