const fs = require('fs');
let c = fs.readFileSync('src/actions/time-tracking.ts', 'utf-8');

const regex = /export async function getCompanySettings\(\) \{[\s\S]*?return settings;\n\}/;

const newText = `export async function getCompanySettings() {
  return await prisma.companySetting.findFirst();
}`;

c = c.replace(regex, newText);
fs.writeFileSync('src/actions/time-tracking.ts', c);
