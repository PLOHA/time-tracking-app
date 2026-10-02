const fs = require('fs');
let c = fs.readFileSync('src/actions/time-tracking.ts', 'utf-8');
const oldText = `export async function getCompanySettings() {
  const settings = await prisma.companySetting.findFirst();
  const session = await getServerSession(authOptions);
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      
    });
    
    ;
    }
  }

  return settings;
}`;

const newText = `export async function getCompanySettings() {
  return await prisma.companySetting.findFirst();
}`;

c = c.replace(oldText, newText);
fs.writeFileSync('src/actions/time-tracking.ts', c);
