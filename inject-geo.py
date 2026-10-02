import os

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

start_idx = c.find('if (dist > settings.allowedRadius) {')
end_idx = c.find('}', c.find('} else {', start_idx)) + 1

new_code = '''if (dist > settings.allowedRadius) {
              if (dist > 100000) { 
                fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLat}&longitude=${userLng}&localityLanguage=en`)
                  .then(r => r.json())
                  .then(data => {
                    const place = data.countryName || data.locality || "unknown location";
                    const distKm = Math.round(dist / 1000).toLocaleString();
                    setMessage(`You are as far as ${distKm} Km from Seagate SG Woodlands. You must be in ${place}, have a nice day!`);
                  })
                  .catch(() => {
                    setMessage(`You are out of bounds (${dist}m). Clocking in will be flagged.`);
                  });
              } else {
                setMessage(`You are out of bounds (${dist}m). Clocking in will be flagged.`);
              }
            } else {
              setMessage(language === "th" ? `ยืนยันพิกัดสำเร็จ คุณอยู่ในระยะที่กำหนด (${dist} เมตร)` : `Location valid. You are within bounds (${dist}m).`);
            }'''

c = c[:start_idx] + new_code + c[end_idx:]

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
