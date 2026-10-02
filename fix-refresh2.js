const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(
/setFormData\(\{ name: "", email: "", passwordRaw: "", shiftType: "OFFICE", cycleStartDate: "", branchId: "" \}\);\s*fetchData\(\);\s*\/\/\s*reload users/,
`setFormData({ name: "", email: "", passwordRaw: "", shiftType: "OFFICE", cycleStartDate: "", branchId: "" });
        const updatedUsers = await getUsers();
        setUsers(updatedUsers);`
);

fs.writeFileSync('src/app/admin/page.tsx', c);
