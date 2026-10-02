"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
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

  // Missing keys
  dash_gps_error: "GPS Error",
  dash_success_red: "Success",
  dash_success: "Success",
  dash_error_submit: "Submission Error",
  dash_reset_success: "Reset Success",
  
  // Missing keys
  admin_filter_branch: "Branch",
  admin_filter_branch_th: "Thailand",
  admin_filter_branch_sg: "Singapore",
  // Switcher
  lang_th: "TH",
  lang_en: "EN"
};

type Language = 'en' | 'th';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language = 'en';

  const t = (key: keyof typeof translations): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: () => {}, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
