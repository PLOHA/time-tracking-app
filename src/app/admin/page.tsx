"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { getAdminLogs, getAdminMonthlyLogs, updateCompanySettings } from "@/actions/admin";
import { getUsers, createUser } from "@/actions/users";
import { getCompanySettings } from "@/actions/time-tracking";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import AnimatedBackground from "@/components/AnimatedBackground";

export default function AdminDashboardPage() {
  const { t, language, setLanguage } = useLanguage();
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

  // Modal State for User Calendar
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userMonthlyLogs, setUserMonthlyLogs] = useState<any[]>([]);
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calSelectedDate, setCalSelectedDate] = useState<Date | null>(null);
  const [isCalLoading, setIsCalLoading] = useState(false);

  const [monthlyLogsData, setMonthlyLogsData] = useState<any[]>([]);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(false);

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
  const [effects, setEffects] = useState(true);

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

    const savedEffects = localStorage.getItem("ui-effects");
    if (savedEffects === "disabled") {
      setEffects(false);
      document.documentElement.setAttribute("data-effects", "false");
    } else {
      setEffects(true);
      document.documentElement.setAttribute("data-effects", "true");
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

  const toggleEffects = () => {
    const newVal = !effects;
    setEffects(newVal);
    if (newVal) {
      localStorage.setItem("ui-effects", "enabled");
      document.documentElement.setAttribute("data-effects", "true");
    } else {
      localStorage.setItem("ui-effects", "disabled");
      document.documentElement.setAttribute("data-effects", "false");
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, activeTab, targetDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "LOGS") {
        const [data, usersData] = await Promise.all([
          getAdminLogs(targetDate),
          users.length === 0 ? getUsers() : Promise.resolve(users)
        ]);
        setLogs(data);
        if (users.length === 0) setUsers(usersData);
        
        setIsMonthlyLoading(true);
        try {
          const d = new Date(targetDate);
          const mLogs = await getAdminMonthlyLogs(d.getFullYear(), d.getMonth() + 1);
          setMonthlyLogsData(mLogs);
        } catch (e) {
          console.error(e);
        }
        setIsMonthlyLoading(false);
      } else if (activeTab === "USERS") {
        if (users.length === 0) {
          const data = await getUsers();
          setUsers(data);
        }
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
      alert(language === "th" ? "ไม่มีข้อมูลสำหรับส่งออก" : "No data to export");
      return;
    }
    const headers = [language === "th" ? "วันที่" : "Date", t("admin_name_placeholder"), language === "th" ? "กะทำงาน" : "Shift Type", language === "th" ? "เวลาเข้า" : "Clock In", language === "th" ? "สถานะเข้า" : "In Status", language === "th" ? "ระยะห่างตอนเข้า (เมตร)" : "In Distance (m)", language === "th" ? "เวลาออก" : "Clock Out", language === "th" ? "สถานะออก" : "Out Status", language === "th" ? "สาย (นาที)" : "Late (min)"];
    
    const rows = exportLogs.map(log => {
       const dateStr = new Date(log.recordDate).toLocaleDateString('th-TH');
       const inTime = log.clockInTime ? new Date(log.clockInTime).toLocaleTimeString('th-TH') : '-';
       const outTime = log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString('th-TH') : '-';
       const inStatus = log.clockInFlagged ? t("dash_out_bounds") : t("dash_in_bounds");
       const outStatus = log.clockOutTime ? (log.clockOutFlagged ? t("dash_out_bounds") : t("dash_in_bounds")) : "-";
       
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
      alert(language === "th" ? "เกิดข้อผิดพลาดในการโหลดข้อมูลรายเดือน" : "Failed to load monthly data");
    }
    setShowExportMenu(false);
  };

  const openUserCalendar = async (user: any) => {
    setSelectedUser(user);
    const d = new Date(targetDate);
    setCalMonth(d.getMonth() + 1);
    setCalYear(d.getFullYear());
    setCalSelectedDate(d);
    await fetchUserCalendar(user.id, d.getFullYear(), d.getMonth() + 1);
  };

  const fetchUserCalendar = async (userId: string, year: number, month: number) => {
    setIsCalLoading(true);
    try {
      const data = await getAdminMonthlyLogs(year, month, userId);
      setUserMonthlyLogs(data);
    } catch (e) {
      console.error(e);
    }
    setIsCalLoading(false);
  };

  const handlePrevCalMonth = async () => {
    if (!selectedUser) return;
    let m = calMonth - 1;
    let y = calYear;
    if (m < 1) { m = 12; y -= 1; }
    setCalMonth(m);
    setCalYear(y);
    await fetchUserCalendar(selectedUser.id, y, m);
  };

  const handleNextCalMonth = async () => {
    if (!selectedUser) return;
    let m = calMonth + 1;
    let y = calYear;
    if (m > 12) { m = 1; y += 1; }
    setCalMonth(m);
    setCalYear(y);
    await fetchUserCalendar(selectedUser.id, y, m);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSettingMsg("");
    try {
      const res = await updateCompanySettings(settingsData);
      setSettingMsg(res.message);
    } catch (error) {
      setSettingMsg(language === "th" ? "เกิดข้อผิดพลาด" : "Error saving settings");
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
      setFormMsg({ text: language === "th" ? "เกิดข้อผิดพลาดในการสร้างพนักงาน" : "Failed to create user", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (shiftFilter !== "ALL" && log.user.shiftType !== shiftFilter) return false;
    if (searchQuery && !log.user.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Calendar Helpers
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth - 1, 1).getDay();
  const calendarGrid = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarGrid.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarGrid.push(i);

  const getLogForDay = (day: number) => {
    return userMonthlyLogs.find(log => new Date(log.recordDate).getDate() === day);
  };
  
  const getSelectedDayDetails = () => {
    if (!calSelectedDate) return null;
    return getLogForDay(calSelectedDate.getDate());
  };

  const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  // --- Chart Data Computation ---
  const PIE_COLORS = { [t("admin_normal")]: '#10B981', [t("admin_late")]: '#F59E0B', [t("dash_out_bounds")]: '#EF4444', [t("admin_missing")]: '#9CA3AF' };

  let todayNormal = 0;
  let todayLate = 0;
  let todayOutOfBounds = 0;
  let todayMissing = 0;

  if (filteredLogs.length > 0) {
    if (users.length > 0) {
      const activeUsers = users.filter(u => {
        if (shiftFilter !== "ALL" && u.shiftType !== shiftFilter) return false;
        if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      });
      todayMissing = Math.max(0, activeUsers.length - filteredLogs.length);
    }
    
    filteredLogs.forEach(log => {
      if (log.clockInFlagged || log.clockOutFlagged) todayOutOfBounds++;
      else if (log.lateness?.isLate) todayLate++;
      else todayNormal++;
    });
  }

  const pieData = [
    { name: t("admin_normal"), value: todayNormal },
    { name: t("admin_late"), value: todayLate },
    { name: t("dash_out_bounds"), value: todayOutOfBounds },
    ...(todayMissing > 0 ? [{ name: t("admin_missing"), value: todayMissing }] : [])
  ].filter(d => d.value > 0);

  // Bar Chart Data (Monthly)
  const filteredMonthlyLogs = monthlyLogsData.filter(log => {
    if (shiftFilter !== "ALL" && log.user.shiftType !== shiftFilter) return false;
    if (searchQuery && !log.user.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const barDataMap: Record<number, any> = {};
  for (let i = 1; i <= daysInMonth; i++) {
    barDataMap[i] = { date: `${i}`, [t("admin_normal")]: 0, [t("admin_late")]: 0, [t("dash_out_bounds")]: 0 };
  }

  filteredMonthlyLogs.forEach(log => {
    const d = new Date(log.recordDate).getDate();
    if (barDataMap[d]) {
      if (log.clockInFlagged || log.clockOutFlagged) barDataMap[d][t("dash_out_bounds")]++;
      else if (log.lateness?.isLate) barDataMap[d][t("admin_late")]++;
      else barDataMap[d][t("admin_normal")]++;
    }
  });
  const barData = Object.values(barDataMap);

  if (status === "loading") {
    return (
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center animate-pulse">
        <div className="max-w-6xl w-full neu-flat p-6 mb-8 flex justify-between items-center">
          <div className="space-y-2">
             <div className="h-6 w-48 bg-gray-200/60 rounded"></div>
             <div className="h-4 w-32 bg-gray-200/60 rounded"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {effects && <AnimatedBackground />}
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      
      {/* Header Card */}
      <div className="max-w-6xl w-full neu-flat p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">{t("admin_title")}</h1>
          <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
            <button 
              onClick={() => setActiveTab("LOGS")}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === "LOGS" ? "neu-pressed text-neu-blue" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t("admin_time_logs")}
            </button>
            <button 
              onClick={() => setActiveTab("USERS")}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === "USERS" ? "neu-pressed text-neu-blue" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t("admin_tab_users")}
            </button>
            <button 
              onClick={() => setActiveTab("SETTINGS")}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === "SETTINGS" ? "neu-pressed text-neu-blue" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t("admin_tab_settings")}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 justify-center md:justify-end w-full md:w-auto mt-4 md:mt-0">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
            className="w-12 h-12 neu-btn text-gray-500 flex items-center justify-center font-bold text-sm"
            title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
          >
            {language === 'th' ? 'TH' : 'EN'}
          </button>

          {/* Effects Toggle */}
          <button
            onClick={toggleEffects}
            className={`w-12 h-12 neu-btn flex items-center justify-center ${effects ? 'text-neu-blue' : 'text-gray-400'}`}
            title={effects ? (language === 'th' ? 'ปิดเอฟเฟกต์พื้นหลัง' : 'Disable background effects') : (language === 'th' ? 'เปิดเอฟเฟกต์พื้นหลัง' : 'Enable background effects')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          </button>
          
          <button
            onClick={toggleTheme}
            className="w-12 h-12 neu-btn text-gray-500 flex items-center justify-center"
            title={t("dash_theme")}
          >
            {theme === "default" ? (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
               <svg className="w-5 h-5 text-neu-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>
          <button onClick={() => router.push("/dashboard")} className="neu-btn text-gray-600 px-6 py-2 font-medium">{language === "th" ? "กลับหน้าลงเวลา" : "Back to Tracking"}</button>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-12 h-12 neu-btn text-neu-red flex items-center justify-center" title={t("dash_logout")}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "LOGS" && (
        <div className="max-w-6xl w-full flex flex-col gap-8">
          
          {/* Charts Container */}
          <div className="neu-flat p-8 flex flex-col xl:flex-row gap-8">
             {/* Doughnut Chart */}
             <div className="w-full xl:w-1/3 flex flex-col">
               <h2 className="text-lg font-bold text-gray-700 mb-4 border-b border-gray-100 pb-2">{t("admin_overview_today")} ({formatDate(targetDate)})</h2>
               <div className="h-64 relative flex justify-center items-center">
                 {loading ? (
                    <div className="w-48 h-48 rounded-full border-8 border-gray-200/60 animate-pulse"></div>
                 ) : pieData.length === 0 ? (
                    <p className="text-gray-400">{t("dash_no_history_calendar")}</p>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                         {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]} />
                         ))}
                       </Pie>
                       <RechartsTooltip 
                         content={({ active, payload }) => {
                           if (active && payload && payload.length) {
                             return (
                               <div className="neu-flat p-3 rounded-xl bg-neu-bg border-none">
                                 {payload.map((entry: any, index: number) => (
                                   <div key={`item-${index}`} className="flex items-center gap-2 text-sm font-bold">
                                     <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.payload.fill || entry.color }}></span>
                                     <span className="text-gray-700">{entry.name}:</span>
                                     <span className="text-gray-900">{entry.value} {t("admin_people")}</span>
                                   </div>
                                 ))}
                               </div>
                             );
                           }
                           return null;
                         }} 
                       />
                       <Legend verticalAlign="bottom" height={36}/>
                     </PieChart>
                   </ResponsiveContainer>
                 )}
               </div>
             </div>

             {/* Bar Chart */}
             <div className="w-full xl:w-2/3 flex flex-col">
               <h2 className="text-lg font-bold text-gray-700 mb-4 border-b border-gray-100 pb-2">{t("admin_monthly_stats")} ({new Date(targetDate).toLocaleString(language === "th" ? "th-TH" : "en-US", { month: "long" })})</h2>
               <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                 <div className="h-64" style={{ minWidth: '700px' }}>
                   {isMonthlyLoading ? (
                      <div className="w-full h-full bg-gray-200/60 rounded-xl animate-pulse"></div>
                   ) : (
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                         <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} interval={0} />
                         <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                         <RechartsTooltip 
                           cursor={{fill: 'rgba(0,0,0,0.05)'}} 
                           content={({ active, payload, label }) => {
                             if (active && payload && payload.length) {
                               return (
                                 <div className="neu-flat p-3 rounded-xl bg-neu-bg border-none">
                                   <p className="text-xs font-bold text-gray-500 mb-2">{language === "th" ? language === "th" ? "วันที่" : "Date" : "Date"} {label}</p>
                                   {payload.map((entry: any, index: number) => (
                                     <div key={`item-${index}`} className="flex items-center gap-2 text-sm font-bold">
                                       <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                       <span className="text-gray-700">{entry.name}:</span>
                                       <span className="text-gray-900">{entry.value}</span>
                                     </div>
                                   ))}
                                 </div>
                               );
                             }
                             return null;
                           }}
                         />
                         <Legend verticalAlign="top" height={36}/>
                         <Bar dataKey={t("admin_normal")} stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                         <Bar dataKey={t("admin_late")} stackId="a" fill="#F59E0B" />
                         <Bar dataKey={t("dash_out_bounds")} stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                       </BarChart>
                     </ResponsiveContainer>
                   )}
                 </div>
               </div>
             </div>
          </div>

          <div className="neu-flat p-8">
          <div className="flex flex-col gap-4 mb-6 border-b border-gray-100 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-lg font-bold text-gray-700">{t("admin_time_logs")}</h2>
              
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
                      {t("admin_export_daily")}
                    </button>
                    <button onClick={exportMonthlyCSV} className="text-left px-4 py-3 text-sm font-bold text-neu-blue hover:bg-gray-100/50">
                      {t("admin_export_monthly")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1 px-1">
                  <label className="text-xs font-semibold text-gray-500">{t("admin_filter_date")}</label>
                  <button 
                    onClick={() => {
                      const today = new Date();
                      const yyyy = today.getFullYear();
                      const mm = String(today.getMonth() + 1).padStart(2, '0');
                      const dd = String(today.getDate()).padStart(2, '0');
                      setTargetDate(`${yyyy}-${mm}-${dd}`);
                    }}
                    className="text-[10px] font-bold text-neu-blue hover:underline"
                  >
                    {language === "th" ? "วันนี้" : "Today"}
                  </button>
                </div>
                <input 
                  type="date" 
                  value={targetDate} 
                  onChange={(e) => {
                    if (!e.target.value) {
                      const today = new Date();
                      const yyyy = today.getFullYear();
                      const mm = String(today.getMonth() + 1).padStart(2, '0');
                      const dd = String(today.getDate()).padStart(2, '0');
                      setTargetDate(`${yyyy}-${mm}-${dd}`);
                    } else {
                      setTargetDate(e.target.value);
                    }
                  }} 
                  className="w-full px-4 py-2 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 px-1">{t("admin_filter_shift")}</label>
                <select 
                  value={shiftFilter} 
                  onChange={(e) => setShiftFilter(e.target.value)} 
                  className="w-full px-4 py-2 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 text-sm font-medium appearance-none"
                >
                  <option value="ALL">{t("admin_filter_all")}</option>
                  <option value="OFFICE">{t("admin_filter_office")}</option>
                  <option value="SHIFT_MORNING">{t("admin_filter_morning")}</option>
                  <option value="SHIFT_NIGHT">{t("admin_filter_night")}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 px-1">{t("admin_search")}</label>
                <input 
                  type="text" 
                  placeholder={t("admin_search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full px-4 py-2 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 text-sm font-medium"
                />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="neu-pressed rounded-2xl p-6 flex flex-col h-[200px]">
                  <div className="h-6 w-3/4 bg-gray-200/60 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-200/60 rounded mb-6"></div>
                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="h-20 bg-gray-200/60 rounded-xl"></div>
                    <div className="h-20 bg-gray-200/60 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLogs.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-400">{t("admin_no_logs_today")}</div>
              ) : (
                filteredLogs.map((log) => {
                  const hasRedFlag = log.clockInFlagged || log.clockOutFlagged;
                  return (
                    <div 
                      key={log.id} 
                      onClick={() => openUserCalendar(log.user)}
                      className="neu-pressed rounded-2xl p-6 flex flex-col relative cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        {hasRedFlag ? (
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">{t("dash_out_bounds")}</span>
                        ) : (
                          <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">{t("admin_normal")}</span>
                        )}
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-700">{log.user.name}</h3>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {log.user.shiftType === 'OFFICE' ? t("admin_filter_office") : log.user.shiftType === 'SHIFT_MORNING' ? t("admin_filter_morning") : t("admin_filter_night")}
                          </span>
                          {log.lateness && (
                            <span className={`text-xs font-bold ${log.lateness.isLate ? 'text-neu-red' : 'text-neu-green'}`}>
                              {language === "th" ? log.lateness.text : (log.lateness.minutesLate === 0 ? "On time" : (log.lateness.isLate ? `Late ${log.lateness.minutesLate} min` : `Early ${log.lateness.minutesLate} min`))}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-auto">
                        <div className="neu-flat p-4 rounded-xl text-center">
                          <p className="text-xs text-gray-500 font-semibold mb-1">{t("admin_clock_in")}</p>
                          <p className={`text-xl font-bold ${log.clockInFlagged ? 'text-neu-red' : 'text-gray-700'}`}>
                            {formatTime(log.clockInTime)}
                          </p>
                          {log.distanceIn !== null && (
                             <p className="text-xs text-gray-400 mt-1">{t("admin_dist_in")} {log.distanceIn} {t("admin_meters")}</p>
                          )}
                        </div>
                        <div className="neu-flat p-4 rounded-xl text-center">
                          <p className="text-xs text-gray-500 font-semibold mb-1">{t("admin_clock_out")}</p>
                          <p className={`text-xl font-bold ${log.clockOutTime ? (log.clockOutFlagged ? 'text-neu-red' : 'text-gray-700') : 'text-gray-400'}`}>
                            {formatTime(log.clockOutTime)}
                          </p>
                          {log.distanceOut !== null && (
                             <p className="text-xs text-gray-400 mt-1">{t("admin_dist_out")} {log.distanceOut} {t("admin_meters")}</p>
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
      </div>
      )}

      {activeTab === "USERS" && (
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add User Form */}
          <div className="neu-flat p-8 lg:col-span-1 h-fit">
             <h2 className="text-lg font-bold text-gray-700 mb-6">{t("admin_add_user")}</h2>
             <form onSubmit={handleCreateUser} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">{t("admin_name")}</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" placeholder={t("admin_name_placeholder")} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">{t("admin_email")}</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" placeholder="email@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">{t("admin_password")}</label>
                  <input type="text" required value={formData.passwordRaw} onChange={e => setFormData({...formData, passwordRaw: e.target.value})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" placeholder="123456" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">{t("admin_shift_type")}</label>
                  <select value={formData.shiftType} onChange={e => setFormData({...formData, shiftType: e.target.value as any})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 appearance-none">
                    <option value="OFFICE">{t("admin_office_desc")}</option>
                    <option value="SHIFT_MORNING">{t("admin_morning_desc")}</option>
                    <option value="SHIFT_NIGHT">{t("admin_night_desc")}</option>
                  </select>
                </div>

                {formData.shiftType !== "OFFICE" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">{t("admin_cycle_start")}</label>
                    <input type="date" required value={formData.cycleStartDate} onChange={e => setFormData({...formData, cycleStartDate: e.target.value})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" />
                    <p className="text-xs text-gray-500 mt-2 px-1">{t("admin_cycle_desc")}</p>
                  </div>
                )}

                {formMsg.text && (
                  <div className={`text-sm font-medium px-4 py-2 neu-flat ${formMsg.isError ? "text-neu-red" : "text-neu-green"} text-center`}>
                    {formMsg.text}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full neu-btn text-neu-blue font-bold py-4 mt-4">
                  {isSubmitting ? (language === "th" ? "กำลังบันทึก..." : "Saving...") : t("admin_btn_add_user")}
                </button>
             </form>
          </div>

          {/* User List Table */}
          <div className="neu-flat p-8 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-700 mb-6">{t("admin_all_users")}</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="neu-pressed rounded-2xl p-6 flex flex-col h-[200px]">
                    <div className="h-6 w-1/2 bg-gray-200/60 rounded mb-2"></div>
                    <div className="h-4 w-2/3 bg-gray-200/60 rounded mb-6"></div>
                    <div className="grid grid-cols-2 gap-4 mt-auto">
                      <div className="h-16 bg-gray-200/60 rounded-xl"></div>
                      <div className="h-16 bg-gray-200/60 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
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
                        <p className="text-xs text-gray-500 font-semibold mb-1">{t("admin_filter_shift")}</p>
                        <p className="text-sm font-bold text-neu-blue">
                          {u.shiftType === "OFFICE" ? t("admin_filter_office") : u.shiftType === "SHIFT_MORNING" ? t("admin_filter_morning") : t("admin_filter_night")}
                        </p>
                      </div>
                      <div className="neu-flat p-4 rounded-xl text-center flex flex-col justify-center">
                        <p className="text-xs text-gray-500 font-semibold mb-1">{t("admin_first_cycle")}</p>
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
          <h2 className="text-lg font-bold text-gray-700 mb-6">{t("admin_settings_title")}</h2>
          {loading ? (
             <div className="space-y-6 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200/60 rounded"></div>
                  <div className="h-12 w-full bg-gray-200/60 rounded-xl"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200/60 rounded"></div>
                  <div className="h-12 w-full bg-gray-200/60 rounded-xl"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200/60 rounded"></div>
                  <div className="h-12 w-full bg-gray-200/60 rounded-xl"></div>
                </div>
                <div className="h-14 w-full bg-gray-200/60 rounded-xl mt-4"></div>
             </div>
          ) : (
             <form onSubmit={handleUpdateSettings} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">{t("admin_lat")}</label>
                  <input type="number" step="any" required value={Number.isNaN(settingsData.lat) ? '' : settingsData.lat} onChange={e => setSettingsData({...settingsData, lat: e.target.value === '' ? NaN : parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" placeholder="13.7563" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">{t("admin_lng")}</label>
                  <input type="number" step="any" required value={Number.isNaN(settingsData.lng) ? '' : settingsData.lng} onChange={e => setSettingsData({...settingsData, lng: e.target.value === '' ? NaN : parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" placeholder="100.5018" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">{t("admin_radius")}</label>
                  <input type="number" required value={Number.isNaN(settingsData.radius) ? '' : settingsData.radius} onChange={e => setSettingsData({...settingsData, radius: e.target.value === '' ? NaN : parseInt(e.target.value, 10)})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" placeholder="500" />
                  <p className="text-xs text-gray-500 mt-2 px-1">{t("admin_radius_desc")}</p>
                </div>

                {settingMsg && (
                  <div className="text-sm font-medium px-4 py-2 neu-flat text-neu-green text-center">
                    {settingMsg}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full neu-btn text-neu-blue font-bold py-4 mt-4">
                  {isSubmitting ? (language === "th" ? "กำลังบันทึก..." : "Saving...") : t("admin_btn_save_settings")}
                </button>
             </form>
          )}
        </div>
      )}

          {/* User Calendar Modal */}
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-neu-bg max-w-md w-full rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-neu-bg">
                  <div>
                    <h3 className="text-lg font-bold text-gray-700">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500">{t("admin_personal_history")}</p>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="w-10 h-10 neu-btn text-gray-500 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="p-6 overflow-y-auto">
                  <div className="neu-flat rounded-3xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                      <button onClick={handlePrevCalMonth} className="w-10 h-10 neu-btn flex justify-center items-center rounded-full text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <h2 className="text-xl font-bold text-gray-700">{new Date(calYear, calMonth - 1).toLocaleString(language === "th" ? "th-TH" : "en-US", { month: "long" })} {calYear}</h2>
                      <button onClick={handleNextCalMonth} className="w-10 h-10 neu-btn flex justify-center items-center rounded-full text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-y-4 text-center">
                      {language === 'th' ? ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map(d => (
                        <div key={d} className="text-xs font-bold text-gray-400">{d}</div>
                      )) : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-xs font-bold text-gray-400">{d}</div>
                      ))}
                      
                      {isCalLoading ? (
                        <>
                          {Array.from({ length: 35 }).map((_, i) => (
                            <div key={`skel-${i}`} className="flex justify-center items-center">
                              <div className="w-10 h-10 rounded-xl bg-gray-200/60 animate-pulse"></div>
                            </div>
                          ))}
                        </>
                      ) : (
                        calendarGrid.map((day, idx) => {
                          if (!day) return <div key={`empty-${idx}`} />;
                          
                          const d = new Date(calYear, calMonth - 1, day);
                          const isSelected = calSelectedDate && d.getTime() === calSelectedDate.getTime();
                          const log = getLogForDay(day);
                          const hasRedFlag = log && (log.clockInFlagged || log.clockOutFlagged);
                          
                          return (
                            <div key={`day-${day}`} className="flex justify-center items-center">
                              <button 
                                onClick={() => setCalSelectedDate(d)}
                                className={`relative w-10 h-10 flex justify-center items-center rounded-xl font-bold transition-all ${
                                  isSelected ? "neu-pressed text-neu-blue" : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                {day}
                                {log && (
                                  <span className={`absolute bottom-1 w-1 h-1 rounded-full ${hasRedFlag ? 'bg-neu-red' : 'bg-neu-green'}`} />
                                )}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Day Details */}
                  <div className="neu-flat rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 border-b border-gray-100 pb-2">{t("dash_calendar_details")}</h3>
                    {!calSelectedDate ? (
                       <p className="text-sm text-gray-500 text-center py-4">{t("admin_please_select_date")}</p>
                    ) : (() => {
                       const log = getSelectedDayDetails();
                       if (!log) return <p className="text-sm text-gray-500 text-center py-4">{t("admin_no_logs_today")}</p>;
                       return (
                         <div className="flex flex-col gap-4">
                           <div className="flex justify-between items-center">
                             <div className="flex flex-col">
                               <span className="text-xs text-gray-500 font-semibold mb-1">{t("admin_clock_in")}</span>
                               <span className={`text-lg font-bold ${log.clockInFlagged ? 'text-neu-red' : 'text-gray-700'}`}>
                                 {formatTime(log.clockInTime)}
                               </span>
                               {log.clockInFlagged && <span className="text-[10px] text-neu-red font-bold">{t("dash_out_bounds")}</span>}
                             </div>
                             <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
                             <div className="flex flex-col items-end">
                               <span className="text-xs text-gray-500 font-semibold mb-1">{t("admin_clock_out")}</span>
                               <span className={`text-lg font-bold ${log.clockOutTime ? (log.clockOutFlagged ? 'text-neu-red' : 'text-gray-700') : 'text-gray-400'}`}>
                                 {formatTime(log.clockOutTime)}
                               </span>
                               {log.clockOutFlagged && <span className="text-[10px] text-neu-red font-bold">{t("dash_out_bounds")}</span>}
                             </div>
                           </div>
                           
                           <div className="mt-2 pt-4 border-t border-gray-100 flex justify-between items-center">
                              <span className="text-xs font-bold text-gray-500">
                                {t("admin_dist_in")} {log.distanceIn !== null ? `${log.distanceIn} ${t("admin_meters")}` : "-"} | {t("admin_dist_out")} {log.distanceOut !== null ? `${log.distanceOut} ${t("admin_meters")}` : "-"}
                              </span>
                              {log.lateness?.isLate && (
                                <span className="text-xs font-bold text-neu-red bg-red-100 px-2 py-1 rounded-md">
                                  {language === "th" ? log.lateness.text : (log.lateness.minutesLate === 0 ? "On time" : (log.lateness.isLate ? `Late ${log.lateness.minutesLate} min` : `Early ${log.lateness.minutesLate} min`))}
                                </span>
                              )}
                           </div>
                         </div>
                       );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
    </div>
    </>
  );
}
