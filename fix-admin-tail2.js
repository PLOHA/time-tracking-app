const fs = require('fs');
let c = fs.readFileSync('src/actions/admin.ts', 'utf-8');
const idx = c.indexOf('\n) {');
if (idx !== -1) {
  c = c.substring(0, idx) + '\n';
  fs.writeFileSync('src/actions/admin.ts', c);
}
