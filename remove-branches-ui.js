const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(/const \[branches, setBranches\] = useState<any\[\]>\(\[\]\);\n/, '');

c = c.replace(/if \(branches\.length === 0\) \{\n\s*const bData = await getAdminBranches\(\);\n\s*setBranches\(bData\);\n\s*\}/g, '');

c = c.replace(/\{branches\.map\(b => \([\s\S]*?\}\)\}/g, '');

c = c.replace(/<div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">/g, '');

fs.writeFileSync('src/app/admin/page.tsx', c);
