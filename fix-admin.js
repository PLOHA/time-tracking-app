const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

// 1. Remove Branch filter states and dropdowns
c = c.replace(/const \[branchFilter, setBranchFilter\] = useState\("ALL"\);\n/g, '');
c = c.replace(/if \(branchFilter === "TH"[\s\S]*?return false;\n/g, '');
c = c.replace(/if \(branchFilter === "SG"[\s\S]*?return false;\n/g, '');
const branchDropdownRegex = /<div>\s*<label className="block text-xs font-semibold text-gray-500 mb-1 px-1">\{t\("admin_filter_branch"\) \|\| "Branch"\}<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/g;
c = c.replace(branchDropdownRegex, '');
c = c.replace(/<div className="grid grid-cols-1 md:grid-cols-4 gap-4">/g, '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">');

// 2. Remove flags from cards
c = c.replace(/\{log\.user\.branch\?\.name\?\.includes\("TH"\).*?\n/g, '');
c = c.replace(/\{log\.user\.branch\?\.name\?\.includes\("SG"\).*?\n/g, '');

// 3. Update timezone
c = c.replace(/const tz = log\.user\.branch\?\.timezone \|\| "Asia\/Bangkok";/g, 'const tz = "Asia/Singapore";');

// 4. Remove branches from imports and API calls
c = c.replace(/getAdminBranches,\s*updateAdminBranch\s*\} from "@\/actions\/admin";/g, '} from "@/actions/admin";');
c = c.replace(/const \[branches, setBranches\] = useState<any\[\]>\(\[\]\);\n/g, '');
c = c.replace(/if \(branches\.length === 0\) \{\s*const bData = await getAdminBranches\(\);\s*setBranches\(bData\);\s*\}/g, '');

// 5. Remove the entire branches rendering logic in SETTINGS tab
const settingsContentRegex = /\{branches\.map\(b => \([\s\S]*?\}\)\}/g;
c = c.replace(settingsContentRegex, '<div>Settings UI simplified</div>');

fs.writeFileSync('src/app/admin/page.tsx', c);
