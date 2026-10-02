const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf-8');
const lines = c.split('\n');
const out = [];
let inHandle = false;

for (let line of lines) {
    if (line.trim().startsWith('const handleClockAction = async () => {')) {
        inHandle = true;
        const newHandle = `  const handleClockAction = async () => {
    if (distance === null || !settings || !coords) return;
    setIsSubmitting(true);
    
    try {
        const actionFn = todayLog && !todayLog.clockOutTime ? clockOut : clockIn;
        const res = await actionFn(coords.lat, coords.lng, distance, settings.allowedRadius);
        
        if (res.success) {
          setMessage(res.flagged ? t("dash_success_red") : t("dash_success"));
          setLocationState("IDLE");
          await loadInitialData(); // Reload log
        } else {
          setMessage(res.message);
        }
    } catch(e: any) {
        console.error(e);
        setMessage(e.message || t("dash_error_submit") || "Error occurred");
    } finally {
        setIsSubmitting(false);
    }
  };`;
        out.push(newHandle);
        continue;
    }
    
    if (inHandle) {
        if (line.trim() === '};') {
            inHandle = false;
        }
        continue;
    }
    
    out.push(line);
}

let result = out.join('\n');

if (!result.includes('const [coords')) {
    result = result.replace('const [distance, setDistance] = useState<number | null>(null);', 
                  'const [distance, setDistance] = useState<number | null>(null);\n  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);');

    result = result.replace('setDistance(dist);\n            setLocationState("READY");', 
                  'setDistance(dist);\n            setCoords({ lat: userLat, lng: userLng });\n            setLocationState("READY");');
}

fs.writeFileSync('src/app/dashboard/page.tsx', result);
console.log("Rewrote dashboard successfully.");
