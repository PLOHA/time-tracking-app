const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

// 1. Add state
c = c.replace(/const \[shiftFilter, setShiftFilter\] = useState\("ALL"\);/g, `const [shiftFilter, setShiftFilter] = useState("ALL");\n  const [branchFilter, setBranchFilter] = useState("ALL");`);

// 2. Add filter to filteredLogs
c = c.replace(/const filteredLogs = logs\.filter\(log => \{/g, `const filteredLogs = logs.filter(log => {
    if (branchFilter === "TH" && !log.user.branch?.name.includes("TH")) return false;
    if (branchFilter === "SG" && !log.user.branch?.name.includes("SG")) return false;`);

// 3. Add filter to activeUsers
c = c.replace(/const activeUsers = users\.filter\(u => \{/g, `const activeUsers = users.filter(u => {
          if (branchFilter === "TH" && !u.branch?.name.includes("TH")) return false;
          if (branchFilter === "SG" && !u.branch?.name.includes("SG")) return false;`);

// 4. Add filter to filteredMonthlyLogs
c = c.replace(/const filteredMonthlyLogs = monthlyLogsData\.filter\(log => \{/g, `const filteredMonthlyLogs = monthlyLogsData.filter(log => {
      if (branchFilter === "TH" && !log.user.branch?.name.includes("TH")) return false;
      if (branchFilter === "SG" && !log.user.branch?.name.includes("SG")) return false;`);

// 5. Add UI Dropdown (insert next to shiftFilter dropdown)
const shiftDropdownStr = `<label className="block text-xs font-semibold text-gray-500 mb-1 px-1">{t("admin_filter_shift")}</label>
                  <select 
                    value={shiftFilter} 
                    onChange={(e) => setShiftFilter(e.target.value)} 
                    className="w-full px-4 py-2 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 text-sm font-medium appearance-none"
                  >
                    <option value="ALL">{t("admin_filter_all")}</option>
                    <option value="OFFICE">{t("admin_filter_office")}</option>
                    <option value="SHIFT_MORNING">{t("admin_filter_morning")}</option>
                    <option value="SHIFT_NIGHT">{t("admin_filter_night")}</option>
                  </select>`;

const branchDropdownStr = `<label className="block text-xs font-semibold text-gray-500 mb-1 px-1">{t("admin_filter_branch") || "Branch"}</label>
                  <select 
                    value={branchFilter} 
                    onChange={(e) => setBranchFilter(e.target.value)} 
                    className="w-full px-4 py-2 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 text-sm font-medium appearance-none"
                  >
                    <option value="ALL">{t("admin_filter_all")}</option>
                    <option value="TH">{t("admin_filter_branch_th") || "Thailand (TH)"}</option>
                    <option value="SG">{t("admin_filter_branch_sg") || "Singapore (SG)"}</option>
                  </select>`;

c = c.replace(shiftDropdownStr, `${shiftDropdownStr}\n                </div>\n                <div>\n                  ${branchDropdownStr}`);

// 6. Update grid columns for the filter bar to accommodate the new dropdown
c = c.replace(/<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">/g, `<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">`);


// 7. Add Badge to Card
// Search for: <h3 className="text-lg font-bold text-gray-700">{log.user.name}</h3>
const nameHeader = `<h3 className="text-lg font-bold text-gray-700">{log.user.name}</h3>`;
const nameHeaderWithBadge = `<div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-700">{log.user.name}</h3>
                            {log.user.branch?.name.includes("TH") && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">🇹🇭 TH</span>}
                            {log.user.branch?.name.includes("SG") && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">🇸🇬 SG</span>}
                          </div>`;
c = c.replace(nameHeader, nameHeaderWithBadge);

fs.writeFileSync('src/app/admin/page.tsx', c);
