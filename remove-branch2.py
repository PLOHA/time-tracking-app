import os

with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False

for line in lines:
    if 'สาขา (Branch)' in line:
        skip = True
        # remove the preceding wrapper div if it exists
        if len(new_lines) > 0 and '<div' in new_lines[-1]:
            new_lines.pop()
            
    if skip:
        if '</div>' in line:
            skip = False
        continue

    new_line = line.replace(', branchId: "" as any', '')
    new_line = new_line.replace('...(formData.branchId ? { branchId: formData.branchId } : {}) as any', '')
    new_line = new_line.replace('/* branchId: editFormData.branchId */', '')
    
    # We also need to change the remaining Thai text labels in Edit User Modal to English, as requested by user A2
    new_line = new_line.replace('ชื่อ-นามสกุล (Name)', 'Name')
    new_line = new_line.replace('รูปแบบการเข้างาน (Shift)', 'Shift Type')
    new_line = new_line.replace('วันที่เริ่มรอบ (Cycle Start)', 'Cycle Start Date')

    new_lines.append(new_line)

with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
