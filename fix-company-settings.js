const fs = require('fs');

let c = fs.readFileSync('src/actions/time-tracking.ts', 'utf-8');

c = c.replace(
`        allowedRadius: user.branch.allowedRadius,
        branchName: user.branch.name,
        updatedAt: user.branch.updatedAt,`,
`        allowedRadius: user.branch.allowedRadius,
        branchName: user.branch.name,
        timezone: user.branch.timezone,
        updatedAt: user.branch.updatedAt,`
);

// Fallback timezone
c = c.replace(
`  return {
    ...settings,
    branchName: null
  };`,
`  return {
    ...settings,
    branchName: null,
    timezone: "Asia/Bangkok"
  };`
);

fs.writeFileSync('src/actions/time-tracking.ts', c);
