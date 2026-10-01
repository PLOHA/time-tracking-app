"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCompanySettings, clockIn, clockOut, getTodayLog, clearMyLogs, getMyHistory } from "@/actions/time-tracking";
import { calculateLateness } from "@/lib/time-utils";

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d);
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Tabs
  const [activeTab, setActiveTab] = useState<"TODAY" | "HISTORY">("TODAY");

  // Today State
  const [locationState, setLocationState] = useState<"IDLE" | "LOCATING" | "READY" | "ERROR">("IDLE");
  const [distance, setDistance] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const [todayLog, setTodayLog] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History State
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Theme Toggle Logic
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "seagate") {
      setTheme("seagate");
      document.documentElement.setAttribute("data-theme", "seagate");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "default") {
      setTheme("seagate");
      localStorage.setItem("theme", "seagate");
      document.documentElement.setAttribute("data-theme", "seagate");
    } else {
      setTheme("default");
      localStorage.setItem("theme", "default");
      document.documentElement.removeAttribute("data-theme");
    }
  };

  useEffect(() => {
    if (status === "authenticated" && activeTab === "HISTORY") {
      loadHistoryData(currentYear, currentMonth);
    }
  }, [status, activeTab, currentYear, currentMonth]);

  const loadHistoryData = async (y: number, m: number) => {
    setIsHistoryLoading(true);
    try {
      const logs = await getMyHistory(y, m);
      setHistoryLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const loadInitialData = async () => {
    const [sett, log] = await Promise.all([getCompanySettings(), getTodayLog()]);
    setSettings(sett);
    setTodayLog(log);
  };

  useEffect(() => {
    if (status === "authenticated") loadInitialData();
  }, [status]);

  const handleGetLocation = () => {
    if (!settings) return;
    setLocationState("LOCATING");
    setMessage("กำลังค้นหาพิกัด GPS...");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const dist = getDistanceFromLatLonInM(userLat, userLng, settings.companyLat, settings.companyLng);
          
          setDistance(dist);
          setLocationState("READY");
          
          if (dist > settings.allowedRadius) {
            setMessage(`คุณอยู่นอกพื้นที่บริษัท (${dist} เมตร) ระบบจะบันทึกประวัติ "ตัวแดง" หากกดลงเวลา`);
          } else {
            setMessage(`พิกัดถูกต้อง คุณอยู่ในระยะที่กำหนด (${dist} เมตร)`);
          }
        },
        (error) => {
          setLocationState("ERROR");
          if (error.code === 1) setMessage("กรุณาอนุญาตการเข้าถึง GPS");
          else setMessage("ไม่สามารถดึงพิกัด GPS ได้");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationState("ERROR");
      setMessage("เบราว์เซอร์ของคุณไม่รองรับ GPS");
    }
  };

  const handleClockAction = async () => {
    if (distance === null || !settings) return;
    setIsSubmitting(true);
    
    try {
       navigator.geolocation.getCurrentPosition(async (pos) => {
          const actionFn = todayLog && !todayLog.clockOutTime ? clockOut : clockIn;
          const res = await actionFn(pos.coords.latitude, pos.coords.longitude, distance, settings.allowedRadius);
          
          if (res.success) {
            setMessage(res.flagged ? `ลงเวลาสำเร็จ (สถานะตัวแดงนอกพื้นที่)` : `ลงเวลาสำเร็จ!`);
            setLocationState("IDLE");
            await loadInitialData(); // Reload log
          } else {
            setMessage(res.message);
          }
          setIsSubmitting(false);
       });
    } catch(e) {
       setMessage("เกิดข้อผิดพลาดในการลงเวลา");
       setIsSubmitting(false);
    }
  };

  if (status === "loading" || !settings) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">กำลังโหลด...</div>;
  }

  // Determine State
  const hasClockedIn = todayLog !== null;
  const hasClockedOut = hasClockedIn && todayLog.clockOutTime !== null;
  const isDoneForToday = hasClockedOut;

  // Calendar Helpers
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0-6
  
  const getLogForDate = (dateNum: number) => {
    return historyLogs.find(log => {
      const d = new Date(log.recordDate);
      return d.getDate() === dateNum;
    });
  };

  const selectedDateNum = selectedDate.getMonth() + 1 === currentMonth && selectedDate.getFullYear() === currentYear ? selectedDate.getDate() : null;
  const selectedLog = selectedDateNum ? getLogForDate(selectedDateNum) : null;

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-md w-full neu-flat p-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-700">ระบบลงเวลาทำงาน</h1>
          <p className="text-sm text-neu-blue font-medium mt-1">ยินดีต้อนรับ, {session?.user?.name}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={toggleTheme}
            className="w-12 h-12 neu-btn text-gray-500 flex items-center justify-center"
            title="เปลี่ยนธีม"
          >
            {theme === "default" ? (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
               <svg className="w-5 h-5 text-neu-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>
          <button
            onClick={async () => {
              await clearMyLogs();
              await loadInitialData();
              setLocationState("IDLE");
              setDistance(null);
              setMessage("รีเซ็ตข้อมูลเรียบร้อยแล้ว");
            }}
            className="w-12 h-12 neu-btn text-neu-blue flex items-center justify-center"
            title="ลบข้อมูลวันนี้ (สำหรับทดสอบ)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-12 h-12 neu-btn text-neu-red flex items-center justify-center"
            title="ออกจากระบบ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>

      <div className="max-w-md w-full flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab("TODAY")}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === "TODAY" ? "neu-pressed text-neu-blue" : "neu-flat text-gray-500 hover:text-gray-700"}`}
        >
          ลงเวลาวันนี้
        </button>
        <button 
          onClick={() => setActiveTab("HISTORY")}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === "HISTORY" ? "neu-pressed text-neu-blue" : "neu-flat text-gray-500 hover:text-gray-700"}`}
        >
          ประวัติย้อนหลัง
        </button>
      </div>

      {activeTab === "TODAY" && (
        <>
          <div className="max-w-md w-full neu-flat p-8 flex flex-col items-center">
        
        {isDoneForToday ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto neu-flat rounded-full flex items-center justify-center mb-6 text-neu-green">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-700">เสร็จสิ้นภารกิจวันนี้!</h2>
            <p className="text-sm text-gray-500 mt-2">คุณได้ลงเวลาเข้าและออกงานครบถ้วนแล้ว</p>
          </div>
        ) : (
          <>
            <div className={`w-40 h-40 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${locationState === 'READY' ? (distance && distance <= settings.allowedRadius ? 'text-neu-green shadow-neu-pressed' : 'text-neu-red shadow-neu-pressed') : 'text-gray-400 neu-flat'}`}>
              <div className="text-center">
                  {locationState === 'IDLE' && <div className="text-sm font-semibold">รอการดึงพิกัด</div>}
                  {locationState === 'LOCATING' && <div className="text-sm font-semibold animate-pulse">กำลังคำนวณ...</div>}
                  {locationState === 'READY' && (
                    <>
                      <div className="text-3xl font-bold">{distance}</div>
                      <div className="text-xs mt-1">เมตร</div>
                    </>
                  )}
              </div>
            </div>

            {message && (
              <div className="w-full text-center mb-8 px-4 py-3 text-sm font-medium text-gray-600 bg-neu-bg shadow-neu-pressed rounded-xl">
                {message}
              </div>
            )}

            <div className="w-full space-y-4">
              {locationState !== "READY" ? (
                <button 
                  onClick={handleGetLocation}
                  disabled={locationState === "LOCATING"}
                  className="w-full neu-btn text-neu-blue font-bold py-4 px-4 text-lg"
                >
                  {locationState === "LOCATING" ? "กำลังค้นหาพิกัด..." : (hasClockedIn ? "เช็คพิกัด เพื่อลงเวลาออก" : "เช็คพิกัด เพื่อลงเวลาเข้า")}
                </button>
              ) : (
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setLocationState("IDLE"); setMessage(""); setDistance(null); }}
                    className="w-1/3 neu-btn text-gray-600 font-semibold py-4"
                  >
                    เช็คใหม่
                  </button>
                  <button 
                    onClick={handleClockAction}
                    disabled={isSubmitting}
                    className={`w-2/3 neu-btn font-bold py-4 text-lg ${distance && distance <= settings.allowedRadius ? 'text-neu-green' : 'text-neu-red'}`}
                  >
                    {isSubmitting ? "กำลังบันทึก..." : (hasClockedIn ? "ลงเวลาออกงาน" : "ลงเวลาเข้างาน")}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Close TODAY block */}
      {activeTab === "TODAY" && hasClockedIn && (
        <div className="max-w-md w-full neu-flat p-6 mt-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">ประวัติการลงเวลาวันนี้</h2>
          <div className="space-y-4">
            
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-sm font-semibold text-gray-500">เวลาเข้างาน:</span>
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${todayLog.clockInFlagged ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {todayLog.clockInFlagged ? 'นอกเขต' : 'ในเขต'}
                  </span>
                  <span className={`font-bold text-lg ${todayLog.clockInFlagged ? 'text-neu-red' : 'text-gray-700'}`}>
                    {new Date(todayLog.clockInTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {(() => {
                  const { isLate, text } = calculateLateness(todayLog.clockInTime, todayLog?.user?.shiftType || (session?.user as any)?.shiftType || "OFFICE");
                  return (
                    <p className={`text-xs font-bold ${isLate ? 'text-neu-red' : 'text-neu-green'}`}>
                      {text}
                    </p>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-semibold text-gray-500">เวลาออกงาน:</span>
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-2">
                  {todayLog.clockOutTime && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${todayLog.clockOutFlagged ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {todayLog.clockOutFlagged ? 'นอกเขต' : 'ในเขต'}
                    </span>
                  )}
                  <span className={`font-bold text-lg ${todayLog.clockOutTime ? (todayLog.clockOutFlagged ? 'text-neu-red' : 'text-gray-700') : 'text-gray-400'}`}>
                    {todayLog.clockOutTime ? new Date(todayLog.clockOutTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : "-"}
                  </span>
                </div>
                {todayLog.clockOutTime && (
                  <p className="text-xs font-medium text-gray-500">บันทึกเวลาออกสำเร็จ</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
      </>
      )}

      {/* HISTORY TAB */}
      {activeTab === "HISTORY" && (
        <div className="max-w-md w-full flex flex-col gap-6">
          <div className="neu-flat p-6 rounded-2xl">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={handlePrevMonth} className="w-10 h-10 neu-btn text-gray-500 flex items-center justify-center">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-lg font-bold text-gray-700">{monthNames[currentMonth - 1]} {currentYear}</h2>
              <button onClick={handleNextMonth} className="w-10 h-10 neu-btn text-gray-500 flex items-center justify-center">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-400">
              <div>อา.</div><div>จ.</div><div>อ.</div><div>พ.</div><div>พฤ.</div><div>ศ.</div><div>ส.</div>
            </div>
            
            <div className="grid grid-cols-7 gap-y-4 gap-x-2">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateObj = new Date(currentYear, currentMonth - 1, day);
                const isSelected = selectedDateNum === day;
                const log = getLogForDate(day);
                
                let dotClass = "";
                if (log) {
                   const { isLate } = calculateLateness(log.clockInTime, log.user.shiftType);
                   if (isLate || log.clockInFlagged || log.clockOutFlagged) {
                     dotClass = "bg-neu-red"; // Late or out of bounds
                   } else {
                     dotClass = "bg-neu-green"; // Perfect
                   }
                }

                return (
                  <button 
                    key={day}
                    onClick={() => setSelectedDate(dateObj)}
                    className={`relative w-10 h-10 mx-auto rounded-full flex flex-col items-center justify-center transition-all 
                      ${isSelected ? 'neu-pressed text-neu-blue font-bold' : 'hover:neu-flat text-gray-600 font-medium'}`}
                  >
                    <span className="text-sm">{day}</span>
                    {log && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Card */}
          <div className="neu-flat p-6 rounded-2xl">
             <h3 className="text-md font-bold text-gray-700 mb-4 text-center">
               รายละเอียด {selectedDateNum ? `${selectedDateNum} ${monthNames[currentMonth - 1]} ${currentYear}` : ''}
             </h3>
             
             {isHistoryLoading ? (
               <p className="text-center text-sm text-gray-500 py-4">กำลังโหลด...</p>
             ) : selectedLog ? (
               <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-sm font-semibold text-gray-500">เวลาเข้างาน:</span>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${selectedLog.clockInFlagged ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {selectedLog.clockInFlagged ? 'นอกเขต' : 'ในเขต'}
                        </span>
                        <span className={`font-bold text-lg ${selectedLog.clockInFlagged ? 'text-neu-red' : 'text-gray-700'}`}>
                          {new Date(selectedLog.clockInTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {(() => {
                        const { isLate, text } = calculateLateness(selectedLog.clockInTime, selectedLog.user.shiftType);
                        return (
                          <p className={`text-xs font-bold ${isLate ? 'text-neu-red' : 'text-neu-green'}`}>
                            {text}
                          </p>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-semibold text-gray-500">เวลาออกงาน:</span>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        {selectedLog.clockOutTime && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${selectedLog.clockOutFlagged ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {selectedLog.clockOutFlagged ? 'นอกเขต' : 'ในเขต'}
                          </span>
                        )}
                        <span className={`font-bold text-lg ${selectedLog.clockOutTime ? (selectedLog.clockOutFlagged ? 'text-neu-red' : 'text-gray-700') : 'text-gray-400'}`}>
                          {selectedLog.clockOutTime ? new Date(selectedLog.clockOutTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
               </div>
             ) : (
               <p className="text-center text-sm text-gray-400 py-4">ไม่มีประวัติการลงเวลาในวันนี้</p>
             )}
          </div>
        </div>
      )}

    </div>
  );
}
