"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminLogs, getAdminMonthlyLogs, updateCompanySettings } from "@/actions/admin";
import { getUsers, createUser } from "@/actions/users";
import { getCompanySettings } from "@/actions/time-tracking";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"LOGS" | "USERS" | "SETTINGS">("LOGS");
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State for Logs
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0); // stable tz
    return d.toISOString().split('T')[0];
  });
  const [shiftFilter, setShiftFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Form State - Users
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: "", isError: false });
  const [formData, setFormData] = useState({
    name: "", email: "", passwordRaw: "", shiftType: "OFFICE" as any, cycleStartDate: ""
  });

  // Form State - Settings
  const [settingsData, setSettingsData] = useState({ lat: 13.7563, lng: 100.5018, radius: 500 });
  const [settingMsg, setSettingMsg] = useState("");

  const [theme, setTheme] = useState("default");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, router, session]);

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
    if (status === "authenticated") fetchData();
  }, [status, activeTab, targetDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "LOGS") {
        const data = await getAdminLogs(targetDate);
        setLogs(data);
      } else if (activeTab === "USERS") {
        const data = await getUsers();
        setUsers(data);
      } else if (activeTab === "SETTINGS") {
        const data = await getCompanySettings();
        if (data) {
          setSettingsData({ lat: data.companyLat, lng: data.companyLng, radius: data.allowedRadius });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (exportLogs: any[], filename: string) => {
    if (exportLogs.length === 0) {
      alert("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }
    const headers = ["วันที่", "ชื่อพนักงาน", "กะทำงาน", "เวลาเข้า", "สถานะเข้า", "ระยะห่างตอนเข้า (เมตร)", "เวลาออก", "สถานะออก", "สาย (นาที)"];
    
    const rows = exportLogs.map(log => {
       const dateStr = new Date(log.recordDate).toLocaleDateString('th-TH');
       const inTime = log.clockInTime ? new Date(log.clockInTime).toLocaleTimeString('th-TH') : '-';
       const outTime = log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString('th-TH') : '-';
       const inStatus = log.clockInFlagged ? "นอกเขต" : "ในเขต";
       const outStatus = log.clockOutTime ? (log.clockOutFlagged ? "นอกเขต" : "ในเขต") : "-";
       
       return [
         dateStr, 
         log.user.name, 
         log.user.shiftType,
         inTime,
         inStatus,
         log.clockInDistance || 0,
         outTime,
         outStatus,
         log.lateMinutes || 0
       ].map(v => `"${v}"`).join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDailyCSV = () => {
    generateCSV(filteredLogs, `timelogs_${targetDate}.csv`);
    setShowExportMenu(false);
  };

  const exportMonthlyCSV = async () => {
    try {
      const d = new Date(targetDate);
      const data = await getAdminMonthlyLogs(d.getFullYear(), d.getMonth() + 1);
      generateCSV(data, `timelogs_${d.getFullYear()}_${d.getMonth() + 1}.csv`);
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูลรายเดือน");
    }
    setShowExportMenu(false);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSettingMsg("");
    try {
      const res = await updateCompanySettings(settingsData);
      setSettingMsg(res.message);
    } catch (error) {
      setSettingMsg("เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSettingMsg(""), 3000);
    }
  };

  const formatTime = (dateObj: Date | null | string) => {
    if (!dateObj) return "-";
    const d = new Date(dateObj);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateObj: Date | null | string) => {
    if (!dateObj) return "-";
    const d = new Date(dateObj);
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMsg({ text: "", isError: false });

    try {
      const res = await createUser({
        ...formData,
        cycleStartDate: formData.shiftType !== "OFFICE" ? formData.cycleStartDate : null
      });

      if (res.success) {
        setFormMsg({ text: res.message, isError: false });
        setFormData({ name: "", email: "", passwordRaw: "", shiftType: "OFFICE", cycleStartDate: "" });
        fetchData(); // reload users
      } else {
        setFormMsg({ text: res.message, isError: true });
      }
    } catch (error) {
      setFormMsg({ text: "เกิดข้อผิดพลาดในการสร้างพนักงาน", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (shiftFilter !== "ALL" && log.user.shiftType !== shiftFilter) return false;
    if (searchQuery && !log.user.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      
      {/* Header Card */}
      <div className="max-w-6xl w-full neu-flat p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">แดชบอร์ดฝ่ายบุคคล (HR)</h1>
          <div className="flex gap-4 mt-4">
            <button 
              onClick={() => setActiveTab("LOGS")}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === "LOGS" ? "neu-pressed text-neu-blue" : "text-gray-500 hover:text-gray-700"}`}
            >
              สรุปการลงเวลา
            </button>
            <button 
              onClick={() => setActiveTab("USERS")}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === "USERS" ? "neu-pressed text-neu-blue" : "text-gray-500 hover:text-gray-700"}`}
            >
              จัดการพนักงาน
            </button>
            <button 
              onClick={() => setActiveTab("SETTINGS")}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === "SETTINGS" ? "neu-pressed text-neu-blue" : "text-gray-500 hover:text-gray-700"}`}
            >
              ตั้งค่าพิกัด
            </button>
          </div>
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
          <button onClick={() => router.push("/dashboard")} className="neu-btn text-gray-600 px-6 py-2 font-medium">กลับหน้าลงเวลา</button>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-12 h-12 neu-btn text-neu-red flex items-center justify-center" title="ออกจากระบบ">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "LOGS" && (
        <div className="max-w-6xl w-full neu-flat p-8">
          <div className="flex flex-col gap-4 mb-6 border-b border-gray-100 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-lg font-bold text-gray-700">บันทึกการลงเวลา</h2>
              
              {/* Export Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="neu-btn px-4 py-2 font-bold text-neu-blue flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export Excel (CSV)
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 neu-flat rounded-xl z-10 overflow-hidden flex flex-col">
                    <button onClick={exportDailyCSV} className="text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100/50">
                      โหลดเฉพาะวันนี้
                    </button>
                    <button onClick={exportMonthlyCSV} className="text-left px-4 py-3 text-sm font-bold text-neu-blue hover:bg-gray-100/50">
                      โหลดทั้งเดือนนี้
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 px-1">เลือกวันที่</label>
                <input 
                  type="date" 
                  value={targetDate} 
                  onChange={(e) => setTargetDate(e.target.value)} 
                  className="w-full px-4 py-2 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 px-1">กะการทำงาน</label>
                <select 
                  value={shiftFilter} 
                  onChange={(e) => setShiftFilter(e.target.value)} 
                  className="w-full px-4 py-2 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 text-sm font-medium appearance-none"
                >
                  <option value="ALL">ทั้งหมด</option>
                  <option value="OFFICE">ออฟฟิศ</option>
                  <option value="SHIFT_MORNING">กะเช้า</option>
                  <option value="SHIFT_NIGHT">กะดึก</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 px-1">ค้นหาพนักงาน</label>
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full px-4 py-2 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 text-sm font-medium"
                />
              </div>
            </div>
          </div>
          {loading ? (
             <p className="text-center py-8 text-gray-500">กำลังโหลด...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLogs.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-400">ยังไม่มีข้อมูลการลงเวลาในวันนี้</div>
              ) : (
                filteredLogs.map((log) => {
                  const hasRedFlag = log.clockInFlagged || log.clockOutFlagged;
                  return (
                    <div key={log.id} className="neu-pressed rounded-2xl p-6 flex flex-col relative">
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        {hasRedFlag ? (
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">นอกพื้นที่</span>
                        ) : (
                          <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">ปกติ</span>
                        )}
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-700">{log.user.name}</h3>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {log.user.shiftType === 'OFFICE' ? 'ออฟฟิศ' : log.user.shiftType === 'SHIFT_MORNING' ? 'กะเช้า' : 'กะดึก'}
                          </span>
                          {log.lateness && (
                            <span className={`text-xs font-bold ${log.lateness.isLate ? 'text-neu-red' : 'text-neu-green'}`}>
                              {log.lateness.text}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-auto">
                        <div className="neu-flat p-4 rounded-xl text-center">
                          <p className="text-xs text-gray-500 font-semibold mb-1">เข้างาน</p>
                          <p className={`text-xl font-bold ${log.clockInFlagged ? 'text-neu-red' : 'text-gray-700'}`}>
                            {formatTime(log.clockInTime)}
                          </p>
                          {log.distanceIn !== null && (
                             <p className="text-xs text-gray-400 mt-1">ห่าง {log.distanceIn} ม.</p>
                          )}
                        </div>
                        <div className="neu-flat p-4 rounded-xl text-center">
                          <p className="text-xs text-gray-500 font-semibold mb-1">ออกงาน</p>
                          <p className={`text-xl font-bold ${log.clockOutTime ? (log.clockOutFlagged ? 'text-neu-red' : 'text-gray-700') : 'text-gray-400'}`}>
                            {formatTime(log.clockOutTime)}
                          </p>
                          {log.distanceOut !== null && (
                             <p className="text-xs text-gray-400 mt-1">ห่าง {log.distanceOut} ม.</p>
                          )}
                        </div>
                      </div>
                      
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "USERS" && (
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add User Form */}
          <div className="neu-flat p-8 lg:col-span-1 h-fit">
             <h2 className="text-lg font-bold text-gray-700 mb-6">เพิ่มพนักงานใหม่</h2>
             <form onSubmit={handleCreateUser} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">ชื่อ-นามสกุล</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" placeholder="ชื่อพนักงาน" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">อีเมลสำหรับเข้าสู่ระบบ</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" placeholder="email@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">ตั้งรหัสผ่านชั่วคราว</label>
                  <input type="text" required value={formData.passwordRaw} onChange={e => setFormData({...formData, passwordRaw: e.target.value})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" placeholder="123456" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">ประเภทกะการทำงาน</label>
                  <select value={formData.shiftType} onChange={e => setFormData({...formData, shiftType: e.target.value as any})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 appearance-none">
                    <option value="OFFICE">พนักงานออฟฟิศ (จันทร์-ศุกร์)</option>
                    <option value="SHIFT_MORNING">กะเช้า (ทำ 4 หยุด 2)</option>
                    <option value="SHIFT_NIGHT">กะดึก (ทำ 4 หยุด 2)</option>
                  </select>
                </div>

                {formData.shiftType !== "OFFICE" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">วันที่เริ่มกะแรก (Cycle Start)</label>
                    <input type="date" required value={formData.cycleStartDate} onChange={e => setFormData({...formData, cycleStartDate: e.target.value})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" />
                    <p className="text-xs text-gray-500 mt-2 px-1">ระบบจะใช้วันนี้เป็นวันที่ 1 ในการรันลูป 4 หยุด 2</p>
                  </div>
                )}

                {formMsg.text && (
                  <div className={`text-sm font-medium px-4 py-2 neu-flat ${formMsg.isError ? "text-neu-red" : "text-neu-green"} text-center`}>
                    {formMsg.text}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full neu-btn text-neu-blue font-bold py-4 mt-4">
                  {isSubmitting ? "กำลังบันทึก..." : "เพิ่มพนักงาน"}
                </button>
             </form>
          </div>

          {/* User List Table */}
          <div className="neu-flat p-8 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-700 mb-6">รายชื่อพนักงานทั้งหมด</h2>
            {loading ? (
               <p className="text-center py-8 text-gray-500">กำลังโหลด...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.map((u) => (
                  <div key={u.id} className="neu-pressed rounded-2xl p-6 relative flex flex-col">
                    {u.role === "ADMIN" && (
                      <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        ADMIN
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-700 mb-1">{u.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{u.email}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-auto">
                      <div className="neu-flat p-4 rounded-xl text-center flex flex-col justify-center">
                        <p className="text-xs text-gray-500 font-semibold mb-1">กะการทำงาน</p>
                        <p className="text-sm font-bold text-neu-blue">
                          {u.shiftType === "OFFICE" ? "ออฟฟิศ" : u.shiftType === "SHIFT_MORNING" ? "กะเช้า" : "กะดึก"}
                        </p>
                      </div>
                      <div className="neu-flat p-4 rounded-xl text-center flex flex-col justify-center">
                        <p className="text-xs text-gray-500 font-semibold mb-1">รอบกะแรก</p>
                        <p className="text-sm font-bold text-gray-700">
                          {u.shiftType === "OFFICE" ? "-" : formatDate(u.cycleStartDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === "SETTINGS" && (
        <div className="max-w-2xl w-full neu-flat p-8">
          <h2 className="text-lg font-bold text-gray-700 mb-6">ตั้งค่าพิกัดบริษัท (GPS)</h2>
          {loading ? (
             <p className="text-center py-8 text-gray-500">กำลังโหลด...</p>
          ) : (
             <form onSubmit={handleUpdateSettings} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">ละติจูด (Latitude)</label>
                  <input type="number" step="any" required value={Number.isNaN(settingsData.lat) ? '' : settingsData.lat} onChange={e => setSettingsData({...settingsData, lat: e.target.value === '' ? NaN : parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" placeholder="13.7563" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">ลองจิจูด (Longitude)</label>
                  <input type="number" step="any" required value={Number.isNaN(settingsData.lng) ? '' : settingsData.lng} onChange={e => setSettingsData({...settingsData, lng: e.target.value === '' ? NaN : parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" placeholder="100.5018" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">ระยะทางที่อนุญาต (เมตร)</label>
                  <input type="number" required value={Number.isNaN(settingsData.radius) ? '' : settingsData.radius} onChange={e => setSettingsData({...settingsData, radius: e.target.value === '' ? NaN : parseInt(e.target.value, 10)})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" placeholder="500" />
                  <p className="text-xs text-gray-500 mt-2 px-1">พนักงานที่กดลงเวลานอกรัศมีนี้ ระบบจะบันทึกสถานะ "ตัวแดง" (นอกพื้นที่)</p>
                </div>

                {settingMsg && (
                  <div className="text-sm font-medium px-4 py-2 neu-flat text-neu-green text-center">
                    {settingMsg}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full neu-btn text-neu-blue font-bold py-4 mt-4">
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                </button>
             </form>
          )}
        </div>
      )}

    </div>
  );
}
