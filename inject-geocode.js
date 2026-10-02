const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf-8');

const oldLocating = `            if (dist > settings.allowedRadius) {
              setMessage(language === "th" ? \`คุณอยู่นอกระยะที่กำหนด (\${dist} เมตร) การลงเวลาจะถูกตั้งสถานะ "มาสาย" หรือผิดปกติ\` : \`You are out of bounds (\${dist}m). Clocking in will be flagged.\`);
            } else {
              setMessage(language === "th" ? "คุณอยู่ในระยะที่กำหนด (พร้อมลงเวลา)" : "You are within the allowed radius. Ready to clock in.");
            }`;

const newLocating = `            if (dist > settings.allowedRadius) {
              if (dist > 100000) { 
                // > 100km away
                fetch(\`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=\${userLat}&longitude=\${userLng}&localityLanguage=en\`)
                  .then(r => r.json())
                  .then(data => {
                    const place = data.countryName || data.locality || "unknown location";
                    const distKm = Math.round(dist / 1000);
                    setMessage(\`You are as far as \${distKm} Km from Seagate SG Woodlands. You must be in \${place}, have a nice day!\`);
                  })
                  .catch(() => {
                    setMessage(\`You are out of bounds (\${dist}m). Clocking in will be flagged.\`);
                  });
              } else {
                setMessage(\`You are out of bounds (\${dist}m). Clocking in will be flagged.\`);
              }
            } else {
              setMessage(language === "th" ? "คุณอยู่ในระยะที่กำหนด (พร้อมลงเวลา)" : "You are within the allowed radius. Ready to clock in.");
            }`;

c = c.replace(oldLocating, newLocating);

fs.writeFileSync('src/app/dashboard/page.tsx', c);
console.log("Updated locating logic with reverse geocoding");
