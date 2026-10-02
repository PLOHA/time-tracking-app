const fs = require('fs');
let c = fs.readFileSync('src/actions/admin.ts', 'utf-8');
c = c.replace(/\n\) \{\s*const session = await getServerSession[\s\S]*?\}\n/, '\n');
fs.writeFileSync('src/actions/admin.ts', c);
