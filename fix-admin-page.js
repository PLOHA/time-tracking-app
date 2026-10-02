const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

c = c.replace(/else if \(log\.lateness\?\.isLate\) todayLate\+\+;\s*else todayNormal\+\+;/g, `else {
          const tz = log.user.branch?.timezone || "Asia/Bangkok";
          const clientLateness = calculateLateness(log.clockInTime, log.user.shiftType, tz);
          if (clientLateness.isLate) todayLate++;
          else todayNormal++;
        }`);

c = c.replace(/else if \(log\.lateness\?\.isLate\) barDataMap\[d\]\[t\("admin_late"\)\]\+\+;\s*else barDataMap\[d\]\[t\("admin_normal"\)\]\+\+;/g, `else {
          const tz = log.user.branch?.timezone || "Asia/Bangkok";
          const clientLateness = calculateLateness(log.clockInTime, log.user.shiftType, tz);
          if (clientLateness.isLate) barDataMap[d][t("admin_late")]++;
          else barDataMap[d][t("admin_normal")]++;
        }`);

c = c.replace(/\{log\.lateness && \([\s\S]*?<\/span>\s*\)\}/, 
`{(() => {
                            const tz = log.user.branch?.timezone || "Asia/Bangkok";
                            const clientLateness = calculateLateness(log.clockInTime, log.user.shiftType, tz);
                            if (log.clockInTime) {
                              return (
                                <span className={\`text-xs font-bold \${clientLateness.isLate ? 'text-neu-red' : 'text-neu-green'}\`}>
                                  {formatDuration(clientLateness.minutesLate, language, clientLateness.isLate)}
                                </span>
                              );
                            }
                            return null;
                          })()}`);

fs.writeFileSync('src/app/admin/page.tsx', c);
