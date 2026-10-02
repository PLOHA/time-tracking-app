"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "th" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  th: {
    // Login
    login_title: "เข้าสู่ระบบ",
    login_subtitle: "ระบบลงเวลาทำงาน Time Tracking",
    login_email: "อีเมล",
    login_password: "รหัสผ่าน",
    login_remember: "จำรหัสผ่านในเครื่องนี้",
    login_invalid: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    login_checking: "กำลังตรวจสอบ...",
    login_btn: "เข้าสู่ระบบ",

    // Dashboard
    dash_title: "ระบบลงเวลาทำงาน",
    dash_welcome: "ยินดีต้อนรับ,",
    dash_theme: "เปลี่ยนธีม",
    dash_reset: "ลบข้อมูลวันนี้ (สำหรับทดสอบ)",
    dash_admin: "แดชบอร์ดผู้ดูแลระบบ",
    dash_logout: "ออกจากระบบ",
    dash_tab_today: "ลงเวลาวันนี้",
    dash_tab_history: "ประวัติย้อนหลัง",
    dash_mission_complete: "เสร็จสิ้นภารกิจวันนี้!",
    dash_mission_desc: "คุณได้ลงเวลาเข้าและออกงานครบถ้วนแล้ว",
    dash_loc_waiting: "รอการดึงพิกัด",
    dash_loc_calculating: "กำลังคำนวณ...",
    dash_meters: "เมตร",
    dash_btn_locate_in: "เช็คพิกัด เพื่อลงเวลาเข้า",
    dash_btn_locate_out: "เช็คพิกัด เพื่อลงเวลาออก",
    dash_btn_recheck: "เช็คใหม่",
    dash_btn_clock_in: "ลงเวลาเข้างาน",
    dash_btn_clock_out: "ลงเวลาออกงาน",
    dash_btn_submitting: "กำลังบันทึก...",
    dash_history_today: "ประวัติการลงเวลาวันนี้",
    dash_time_in: "เวลาเข้างาน:",
    dash_time_out: "เวลาออกงาน:",
    dash_in_bounds: "ในเขต",
    dash_out_bounds: "นอกเขต",
    dash_clock_out_success: "บันทึกเวลาออกสำเร็จ",
    dash_calendar_details: "รายละเอียด",
    dash_no_history_today: "ไม่มีประวัติการลงเวลาในวันนี้",
    dash_no_history_calendar: "ไม่มีบันทึกการลงเวลาในวันนี้",
    dash_select_calendar: "โปรดเลือกวันที่บนปฏิทิน",
    dash_locating: "กำลังค้นหาพิกัด...",
    
    // Admin
    admin_title: "จัดการการลงเวลา (HR)",
    admin_overview_today: "ภาพรวมวันนี้",
    admin_monthly_stats: "สถิติทั้งเดือน",
    admin_time_logs: "บันทึกการลงเวลา",
    admin_export_daily: "โหลดเฉพาะวันนี้",
    admin_export_monthly: "โหลดทั้งเดือนนี้",
    admin_filter_date: "เลือกวันที่",
    admin_filter_shift: "กะการทำงาน",
    admin_filter_branch: "สาขา",
    admin_filter_branch_th: "ไทย (TH)",
    admin_filter_branch_sg: "สิงคโปร์ (SG)",
    admin_filter_all: "ทั้งหมด",
    admin_filter_office: "ออฟฟิศ",
    admin_filter_morning: "กะเช้า",
    admin_filter_night: "กะดึก",
    admin_search: "ค้นหาพนักงาน",
    admin_search_placeholder: "ค้นหาชื่อ...",
    admin_no_logs_today: "ยังไม่มีข้อมูลการลงเวลาในวันนี้",
    admin_clock_in: "เข้างาน",
    admin_clock_out: "ออกงาน",
    admin_personal_history: "ประวัติการลงเวลาส่วนตัว",
    admin_please_select_date: "โปรดเลือกวันที่บนปฏิทิน",
    admin_dist_in: "ตอนเข้าห่าง:",
    admin_dist_out: "ตอนออกห่าง:",
    admin_meters: "ม.",
    admin_add_user: "เพิ่มพนักงานใหม่",
    admin_name: "ชื่อ-นามสกุล",
    admin_name_placeholder: "ชื่อพนักงาน",
    admin_email: "อีเมลสำหรับเข้าสู่ระบบ",
    admin_password: "ตั้งรหัสผ่านชั่วคราว",
    admin_shift_type: "ประเภทกะการทำงาน",
    admin_office_desc: "พนักงานออฟฟิศ (จันทร์-ศุกร์)",
    admin_morning_desc: "กะเช้า (ทำ 4 หยุด 2)",
    admin_night_desc: "กะดึก (ทำ 4 หยุด 2)",
    admin_cycle_start: "วันที่เริ่มกะแรก (Cycle Start)",
    admin_cycle_desc: "ระบบจะใช้วันนี้เป็นวันที่ 1 ในการรันลูป 4 หยุด 2",
    admin_btn_add_user: "เพิ่มพนักงาน",
    admin_all_users: "รายชื่อพนักงานทั้งหมด",
    admin_first_cycle: "รอบกะแรก",
    admin_settings_title: "ตั้งค่าพิกัดบริษัท (GPS)",
    admin_lat: "ละติจูด (Latitude)",
    admin_lng: "ลองจิจูด (Longitude)",
    admin_radius: "ระยะทางที่อนุญาต (เมตร)",
    admin_radius_desc: "พนักงานที่กดลงเวลานอกรัศมีนี้ ระบบจะบันทึกสถานะ 'ตัวแดง' (นอกพื้นที่)",
    admin_btn_save_settings: "บันทึกการตั้งค่า",
    admin_tab_users: "จัดการพนักงาน",
    admin_tab_settings: "ตั้งค่า GPS",
    admin_missing: "ขาด/ยังไม่ลงเวลา",
    admin_normal: "ปกติ",
    admin_late: "สาย",
    admin_people: "คน",

    // Switcher
    lang_th: "TH",
    lang_en: "EN"
  },
  en: {
    // Login
    login_title: "Login",
    login_subtitle: "Time Tracking System",
    login_email: "Email",
    login_password: "Password",
    login_remember: "Remember me on this device",
    login_invalid: "Invalid email or password",
    login_checking: "Checking...",
    login_btn: "Login",

    // Dashboard
    dash_title: "Time Tracking",
    dash_welcome: "Welcome,",
    dash_theme: "Toggle Theme",
    dash_reset: "Reset today's logs (Test)",
    dash_admin: "Admin Dashboard",
    dash_logout: "Logout",
    dash_tab_today: "Today",
    dash_tab_history: "History",
    dash_mission_complete: "Mission Complete!",
    dash_mission_desc: "You have completed your clock in and clock out for today.",
    dash_loc_waiting: "Waiting for GPS",
    dash_loc_calculating: "Calculating...",
    dash_meters: "meters",
    dash_btn_locate_in: "Check Location to Clock In",
    dash_btn_locate_out: "Check Location to Clock Out",
    dash_btn_recheck: "Re-check",
    dash_btn_clock_in: "Clock In",
    dash_btn_clock_out: "Clock Out",
    dash_btn_submitting: "Submitting...",
    dash_history_today: "Today's Logs",
    dash_time_in: "Clock In:",
    dash_time_out: "Clock Out:",
    dash_in_bounds: "In Bounds",
    dash_out_bounds: "Out Bounds",
    dash_clock_out_success: "Clock out recorded",
    dash_calendar_details: "Details",
    dash_no_history_today: "No logs recorded today",
    dash_no_history_calendar: "No logs recorded on this date",
    dash_select_calendar: "Please select a date",
    dash_locating: "Locating...",

    // Admin
    admin_title: "Time Tracking Management (HR)",
    admin_overview_today: "Today's Overview",
    admin_monthly_stats: "Monthly Statistics",
    admin_time_logs: "Time Logs",
    admin_export_daily: "Export Today",
    admin_export_monthly: "Export Month",
    admin_filter_date: "Date",
    admin_filter_shift: "Shift Type",
    admin_filter_branch: "Branch",
    admin_filter_branch_th: "Thailand (TH)",
    admin_filter_branch_sg: "Singapore (SG)",
    admin_filter_all: "All",
    admin_filter_office: "Office",
    admin_filter_morning: "Morning Shift",
    admin_filter_night: "Night Shift",
    admin_search: "Search Employee",
    admin_search_placeholder: "Search name...",
    admin_no_logs_today: "No time logs recorded today",
    admin_clock_in: "Clock In",
    admin_clock_out: "Clock Out",
    admin_personal_history: "Personal History",
    admin_please_select_date: "Please select a date on the calendar",
    admin_dist_in: "In Dist:",
    admin_dist_out: "Out Dist:",
    admin_meters: "m",
    admin_add_user: "Add New Employee",
    admin_name: "Full Name",
    admin_name_placeholder: "Employee Name",
    admin_email: "Login Email",
    admin_password: "Temporary Password",
    admin_shift_type: "Shift Type",
    admin_office_desc: "Office (Mon-Fri)",
    admin_morning_desc: "Morning (4 On, 2 Off)",
    admin_night_desc: "Night (4 On, 2 Off)",
    admin_cycle_start: "Cycle Start Date",
    admin_cycle_desc: "System uses this as Day 1 for the 4-on 2-off cycle",
    admin_btn_add_user: "Add Employee",
    admin_all_users: "All Employees",
    admin_first_cycle: "First Cycle",
    admin_settings_title: "Company GPS Settings",
    admin_lat: "Latitude",
    admin_lng: "Longitude",
    admin_radius: "Allowed Radius (meters)",
    admin_radius_desc: "Employees clocking out of this radius will be flagged as 'Out of Bounds'",
    admin_btn_save_settings: "Save Settings",
    admin_tab_users: "Manage Users",
    admin_tab_settings: "GPS Settings",
    admin_missing: "Missing/Absent",
    admin_normal: "Normal",
    admin_late: "Late",
    admin_people: "people",

    // Switcher
    lang_th: "TH",
    lang_en: "EN"
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved === "en" || saved === "th") {
      setLanguage(saved);
    }
    setMounted(true);
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app_lang", lang);
  };

  const t = (key: string): string => {
    if (!mounted) return translations["th"][key as keyof typeof translations["th"]] || key; // fallback for ssr
    return translations[language][key as keyof typeof translations["th"]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
