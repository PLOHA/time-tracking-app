const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(
`        setFormData({ name: "", email: "", passwordRaw: "", shiftType: "OFFICE", cycleStartDate: "", branchId: "" });
        fetchData(); // reload users`,
`        setFormData({ name: "", email: "", passwordRaw: "", shiftType: "OFFICE", cycleStartDate: "", branchId: "" });
        const updatedUsers = await getUsers();
        setUsers(updatedUsers);`
);

const headerUI = `            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-700">{t("admin_all_users")}</h2>
              <button 
                type="button"
                onClick={async () => {
                   const data = await getUsers();
                   setUsers(data);
                }} 
                className="w-10 h-10 neu-btn text-gray-500 flex items-center justify-center rounded-full hover:text-neu-blue transition-colors"
                title="Refresh"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>`;

c = c.replace(`<h2 className="text-lg font-bold text-gray-700 mb-6">{t("admin_all_users")}</h2>`, headerUI);

fs.writeFileSync('src/app/admin/page.tsx', c);
