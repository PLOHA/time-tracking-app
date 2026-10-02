const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf-8');

// 1. Add coords state
c = c.replace('const [distance, setDistance] = useState<number | null>(null);', 
              'const [distance, setDistance] = useState<number | null>(null);\n  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);');

// 2. Update setLocationState to also save coords
c = c.replace('setDistance(dist);\n          setLocationState("READY");', 
              'setDistance(dist);\n          setCoords({ lat: userLat, lng: userLng });\n          setLocationState("READY");');

// 3. Rewrite handleClockAction
const old_handle = `  const handleClockAction = async () => {
    if (distance === null || !settings) return;
    setIsSubmitting(true);
    
    try {
       navigator.geolocation.getCurrentPosition(async (pos) => {
          const actionFn = todayLog && !todayLog.clockOutTime ? clockOut : clockIn;
          const res = await actionFn(pos.coords.latitude, pos.coords.longitude, distance, settings.allowedRadius);
          
          if (res.success) {
            setMessage(res.flagged ? t("dash_success_red") : t("dash_success"));
            setLocationState("IDLE");
            await loadInitialData(); // Reload log
          } else {
            setMessage(language === "th" ? res.message : (res.message.includes("อยู่นอกเวลา") ? "Out of allowed time window" : res.message.includes("วันนี้คุณลงเวลาไปแล้ว") ? "Not allowed to clock in today" : res.message));
          }
          setIsSubmitting(false);
       });
    } catch(e) {
       setMessage(t("dash_error_submit") || (language === "th" ? "เกิดข้อผิดพลาด" : "Error occurred"));
       setIsSubmitting(false);
    }
  };`;

const new_handle = `  const handleClockAction = async () => {
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
          setMessage(language === "th" ? res.message : (res.message.includes("อยู่นอกเวลา") ? "Out of allowed time window" : res.message.includes("วันนี้คุณลงเวลาไปแล้ว") ? "Not allowed to clock in today" : res.message));
        }
    } catch(e: any) {
        console.error(e);
        setMessage(e.message || t("dash_error_submit") || (language === "th" ? "เกิดข้อผิดพลาด" : "Error occurred"));
    } finally {
        setIsSubmitting(false);
    }
  };`;

c = c.replace(old_handle, new_handle);

fs.writeFileSync('src/app/dashboard/page.tsx', c);
