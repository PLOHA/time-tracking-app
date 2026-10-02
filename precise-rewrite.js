const fs = require('fs');
let lines = fs.readFileSync('src/app/admin/page.tsx', 'utf-8').split('\n');

let newLines = [];
let skip = 0;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  // 1. imports
  line = line.replace(/getAdminBranches,\s*/, '');
  line = line.replace(/updateAdminBranch\s*/, '');
  line = line.replace(/,\s*\} from "@\/actions\/admin"/, '} from "@/actions/admin"');

  // 2. states
  if (line.includes('const [branches, setBranches]')) continue;
  if (line.includes('const [branchFilter, setBranchFilter]')) continue;

  // 3. fetch branches effect
  if (line.includes('if (branches.length === 0) {') && lines[i+1].includes('getAdminBranches')) {
    i += 3; // skip if, const bData, setBranches, }
    continue;
  }

  // 4. timezone fallback
  line = line.replace(/const tz = log\.user\.branch\?\.timezone \|\| "Asia\/Bangkok";/, 'const tz = "Asia/Singapore";');
  line = line.replace(/const tz = u\.branch\?\.timezone \|\| "Asia\/Bangkok";/, 'const tz = "Asia/Singapore";');

  // 5. filter by branch
  if (line.includes('if (branchFilter === "TH"')) continue;
  if (line.includes('if (branchFilter === "SG"')) continue;

  // 6. remove flags
  if (line.includes('log.user.branch?.name?.includes("TH")')) continue;
  if (line.includes('log.user.branch?.name?.includes("SG")')) continue;

  // 7. Branch UI dropdowns (Add/Edit user)
  if (line.includes('<label') && line.includes('(Branch)')) {
    // Skip this block: label, select, option, branches.map, /select, /div
    i += 5;
    continue;
  }
  
  if (line.includes('branchId: e.target.value')) continue;
  if (line.includes('branchId: newUser.branchId')) continue;

  newLines.push(line);
}

let newContent = newLines.join('\n');

// Dropdown filter
const dropdownRegex = /<div>\s*<label className="block text-xs font-semibold text-gray-500 mb-1 px-1">\{t\("admin_filter_branch"\) \|\| "Branch"\}<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/;
newContent = newContent.replace(dropdownRegex, '');

// Grid cols
newContent = newContent.replace(/<div className="grid grid-cols-1 md:grid-cols-4 gap-4">/, '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">');

// Settings tab branches map
const branchesMapRegex = /\{branches\.map\(b => \([\s\S]*?\}\)\}/;
newContent = newContent.replace(branchesMapRegex, '');

// Save
fs.writeFileSync('src/app/admin/page.tsx', newContent);
