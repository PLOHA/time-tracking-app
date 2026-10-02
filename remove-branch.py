import os

with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
skip_count = 0

for line in lines:
    if '<label className="block text-sm font-semibold text-gray-600 mb-2 px-1">???? (Branch)</label>' in line:
        skip = True
        skip_count = 5 # skip label, select, option, map, /select, /div
        # Actually, let's just skip until </div>
        
    if skip:
        if '</div>' in line:
            skip = False
        continue

    new_line = line.replace(', branchId: "" as any', '')
    new_line = new_line.replace('...(formData.branchId ? { branchId: formData.branchId } : {}) as any', '')
    new_line = new_line.replace('/* branchId: editFormData.branchId */', '')
    
    # Let's also remove the wrapper div if it's there. Actually, the wrapper div is the previous line.
    
    new_lines.append(new_line)

with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
