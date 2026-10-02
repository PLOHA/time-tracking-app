const fs = require('fs');
let c = fs.readFileSync('src/components/LanguageContext.tsx', 'utf-8');

const newKeys = `  // Missing keys
  admin_filter_branch: "Branch",
  admin_filter_branch_th: "Thailand",
  admin_filter_branch_sg: "Singapore",
  // Switcher`;

c = c.replace(/  \/\/ Switcher/, newKeys);

fs.writeFileSync('src/components/LanguageContext.tsx', c);
