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

    // Switcher
    lang_th: "TH",
    lang_en: "EN"
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: "th",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("th");
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
