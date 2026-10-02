const fs = require('fs');
let c = fs.readFileSync('src/components/LanguageContext.tsx', 'utf-8');

c = c.replace(/admin_filter_shift: "กะการทำงาน",/g, `admin_filter_shift: "กะการทำงาน",\n    admin_filter_branch: "สาขา",\n    admin_filter_branch_th: "ไทย (TH)",\n    admin_filter_branch_sg: "สิงคโปร์ (SG)",`);
c = c.replace(/admin_filter_shift: "Shift Type",/g, `admin_filter_shift: "Shift Type",\n    admin_filter_branch: "Branch",\n    admin_filter_branch_th: "Thailand (TH)",\n    admin_filter_branch_sg: "Singapore (SG)",`);

fs.writeFileSync('src/components/LanguageContext.tsx', c);
