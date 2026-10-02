const fs = require('fs');
let c = fs.readFileSync('src/components/LanguageContext.tsx', 'utf-8');

c = c.replace(/type Language = 'en';/, "type Language = 'en' | 'th';");

const newKeys = `  // Missing keys
  dash_gps_error: "GPS Error",
  dash_success_red: "Success",
  dash_success: "Success",
  dash_error_submit: "Submission Error",
  dash_reset_success: "Reset Success",
  
  // Switcher`;

c = c.replace(/  \/\/ Switcher/, newKeys);

fs.writeFileSync('src/components/LanguageContext.tsx', c);
