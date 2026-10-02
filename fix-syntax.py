import os

with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

bad_block = '''} else if (activeTab === "SETTINGS") {
          const sData = await getCompanySettings();
          if (sData) {
            setSettingsData({ lat: sData.companyLat, lng: sData.companyLng, radius: sData.allowedRadius });
          }
        }
      }
    } catch (error) {'''

good_block = '''} else if (activeTab === "SETTINGS") {
          const sData = await getCompanySettings();
          if (sData) {
            setSettingsData({ lat: sData.companyLat, lng: sData.companyLng, radius: sData.allowedRadius });
          }
        }
      } catch (error) {'''

c = c.replace(bad_block, good_block)

with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
