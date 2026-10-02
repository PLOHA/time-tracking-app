const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

// 1. Import updateUser
if (!c.includes('updateUser')) {
  c = c.replace('import { getUsers, createUser } from "@/actions/users";', 'import { getUsers, createUser, updateUser } from "@/actions/users";');
}

// 2. Add state
if (!c.includes('const [editUser')) {
  c = c.replace('const [selectedUser, setSelectedUser] = useState<any>(null);', 
    'const [selectedUser, setSelectedUser] = useState<any>(null);\n  const [editUser, setEditUser] = useState<any>(null);\n  const [editFormData, setEditFormData] = useState({ name: "", shiftType: "OFFICE" as any, cycleStartDate: "", branchId: "" });');
}

// 3. Make card clickable
c = c.replace(
  '<div key={u.id} className="neu-pressed rounded-2xl p-6 relative flex flex-col">',
  `<div 
                    key={u.id} 
                    className="neu-pressed rounded-2xl p-6 relative flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setEditUser(u);
                      setEditFormData({
                        name: u.name,
                        shiftType: u.shiftType,
                        cycleStartDate: u.cycleStartDate ? new Date(u.cycleStartDate).toISOString().split('T')[0] : "",
                        branchId: u.branchId || ""
                      });
                    }}
                  >`
);

// 4. Create the Edit Modal UI
const editModalUI = `
      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-neu-bg max-w-md w-full rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-neu-bg">
              <h3 className="text-lg font-bold text-gray-700">แก้ไขข้อมูลพนักงาน</h3>
              <button onClick={() => setEditUser(null)} className="w-10 h-10 neu-btn text-gray-500 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  const res = await updateUser(editUser.id, {
                    name: editFormData.name,
                    shiftType: editFormData.shiftType,
                    cycleStartDate: editFormData.shiftType !== "OFFICE" && editFormData.cycleStartDate ? new Date(editFormData.cycleStartDate).toISOString() : null,
                    branchId: editFormData.branchId || null
                  });
                  if (res.success) {
                    setEditUser(null);
                    const updatedUsers = await getUsers();
                    setUsers(updatedUsers);
                    alert("บันทึกข้อมูลสำเร็จ");
                  }
                } catch (err: any) {
                  alert("เกิดข้อผิดพลาด: " + err.message);
                } finally {
                  setIsSubmitting(false);
                }
              }} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">ชื่อ-นามสกุล (Name)</label>
                  <input type="text" required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">สาขา (Branch)</label>
                  <select className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 appearance-none" value={editFormData.branchId} onChange={e => setEditFormData({...editFormData, branchId: e.target.value})}>
                    <option value="">-- ไม่ระบุ (ใช้สำนักงานใหญ่) --</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">รูปแบบเวลาเข้างาน (Shift)</label>
                  <select className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 appearance-none" value={editFormData.shiftType} onChange={e => setEditFormData({...editFormData, shiftType: e.target.value as any})}>
                    <option value="OFFICE">{t("admin_filter_office")}</option>
                    <option value="SHIFT_MORNING">{t("admin_filter_morning")}</option>
                    <option value="SHIFT_NIGHT">{t("admin_filter_night")}</option>
                  </select>
                </div>
                {editFormData.shiftType !== "OFFICE" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">รอบกะวันแรก (Cycle Start)</label>
                    <input type="date" required value={editFormData.cycleStartDate} onChange={e => setEditFormData({...editFormData, cycleStartDate: e.target.value})} className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700" />
                  </div>
                )}
                <button type="submit" disabled={isSubmitting} className="w-full neu-btn text-neu-blue font-bold py-4 mt-4">
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
`;

c = c.replace('{/* User Calendar Modal */}', editModalUI + '\n\n          {/* User Calendar Modal */}');

fs.writeFileSync('src/app/admin/page.tsx', c);
