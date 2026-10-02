const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

// Remove Branch dropdown filter
const branchFilterRegex = /<div>\s*<label className="block text-xs font-semibold text-gray-500 mb-1 px-1">\{t\("admin_filter_branch"\) \|\| "Branch"\}<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/;
c = c.replace(branchFilterRegex, '');

// Fix grid cols
c = c.replace(/<div className="grid grid-cols-1 md:grid-cols-4 gap-4">/, '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">');

// Remove branchFilter state
c = c.replace(/const \[branchFilter, setBranchFilter\] = useState\("ALL"\);\n/, '');

// Remove branch filtering from filteredLogs
c = c.replace(/\s*if \(branchFilter === "TH".*?\n/g, '\n');
c = c.replace(/\s*if \(branchFilter === "SG".*?\n/g, '\n');

// Remove flags from cards
c = c.replace(/\{log\.user\.branch\?\.name\?\.includes\("TH"\).*?\n/g, '');
c = c.replace(/\{log\.user\.branch\?\.name\?\.includes\("SG"\).*?\n/g, '');

// Remove timezone fallback in rendering (we will just use Asia/Singapore everywhere)
c = c.replace(/const tz = log\.user\.branch\?\.timezone \|\| "Asia\/Bangkok";/g, 'const tz = "Asia/Singapore";');

fs.writeFileSync('src/app/admin/page.tsx', c);
