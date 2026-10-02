const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(/<div className="grid grid-cols-1 md:grid-cols-3 gap-4">/g, `<div className="grid grid-cols-1 md:grid-cols-4 gap-4">`);

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

fs.writeFileSync('src/app/admin/page.tsx', c);
