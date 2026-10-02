import os

with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Remove the state
c = c.replace('    const [branchFilter, setBranchFilter] = useState("ALL");\n', '')

# Remove filter logic
c = c.replace('          if (branchFilter === "TH" && !(log.user as any).branch?.name?.includes("TH")) return false;\n', '')
c = c.replace('          if (branchFilter === "SG" && !(log.user as any).branch?.name?.includes("SG")) return false;\n', '')

c = c.replace('          if (branchFilter === "TH" && !(u as any).branch?.name?.includes("TH")) return false;\n', '')
c = c.replace('          if (branchFilter === "SG" && !(u as any).branch?.name?.includes("SG")) return false;\n', '')

# Remove UI dropdown block. 
start_idx = c.find('<div>\n                  <label className="block text-xs font-semibold text-gray-500 mb-1 px-1">{t("admin_filter_branch") || "Branch"}</label>')
if start_idx != -1:
    end_idx = c.find('</select>\n                </div>', start_idx) + len('</select>\n                </div>')
    c = c[:start_idx] + c[end_idx:]

# Adjust grid cols from 4 to 3
c = c.replace('grid-cols-1 md:grid-cols-4 gap-4', 'grid-cols-1 md:grid-cols-3 gap-4')

# Remove flags
import re
c = re.sub(r'\{\(log\.user as any\)\.branch\?\.name\?\.includes\("TH"\) && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0\.5 rounded border border-gray-200">.*?<\/span>\}', '', c)
c = re.sub(r'\{\(log\.user as any\)\.branch\?\.name\?\.includes\("SG"\) && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0\.5 rounded border border-gray-200">.*?<\/span>\}', '', c)
c = re.sub(r'\{\(u as any\)\.branch\?\.name\?\.includes\("TH"\) && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0\.5 rounded border border-gray-200">.*?<\/span>\}', '', c)
c = re.sub(r'\{\(u as any\)\.branch\?\.name\?\.includes\("SG"\) && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0\.5 rounded border border-gray-200">.*?<\/span>\}', '', c)

with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
