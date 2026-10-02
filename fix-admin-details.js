const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

// Import calculateLateness
if (!c.includes('calculateLateness')) {
  c = c.replace('import { formatDuration, formatDistance } from "@/lib/format-utils";', 'import { formatDuration, formatDistance } from "@/lib/format-utils";\nimport { calculateLateness } from "@/lib/time-utils";');
}

// Replace the Day Details render block
const targetHTML = `                         return (
                           <div className="flex flex-col gap-4">
                             <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <span className="text-sm font-semibold text-gray-500">{t("admin_clock_in")}</span>
                                <div className="text-right flex flex-col items-end">
                                  <div className="flex items-center gap-2">
                                     <span className={\`text-[10px] px-2 py-0.5 rounded-full font-bold \${log.clockInFlagged ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}\`}>
                                       {log.clockInFlagged ? t("dash_out_bounds") : t("dash_in_bounds")}
                                     </span>
                                     <span className={\`text-lg font-bold \${log.clockInFlagged ? 'text-neu-red' : 'text-gray-700'}\`}>
                                       {formatTime(log.clockInTime)}
                                     </span>
                                  </div>
                                  {log.lateness && (
                                     <p className={\`text-xs font-bold mt-1 \${log.lateness.isLate ? 'text-neu-red' : 'text-neu-green'}\`}>
                                       {formatDuration(log.lateness.minutesLate, language, log.lateness.isLate)}
                                     </p>
                                  )}
                                </div>
                             </div>
                             
                             <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-500">{t("admin_clock_out")}</span>
                                <div className="text-right flex flex-col items-end">
                                  <div className="flex items-center gap-2">
                                     {log.clockOutTime && (
                                        <span className={\`text-[10px] px-2 py-0.5 rounded-full font-bold \${log.clockOutFlagged ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}\`}>
                                          {log.clockOutFlagged ? t("dash_out_bounds") : t("dash_in_bounds")}
                                        </span>
                                     )}
                                     <span className={\`text-lg font-bold \${log.clockOutTime ? (log.clockOutFlagged ? 'text-neu-red' : 'text-gray-700') : 'text-gray-400'}\`}>
                                       {formatTime(log.clockOutTime)}
                                     </span>
                                  </div>
                                </div>
                             </div>
                             
                             <div className="mt-2 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500">
                                  {t("admin_dist_in")} {formatDistance(log.distanceIn, language)} | {t("admin_dist_out")} {formatDistance(log.distanceOut, language)}
                                </span>
                                {log.lateness?.isLate && (
                                  <span className="text-xs font-bold text-neu-red bg-red-100 px-2 py-1 rounded-md">
                                    {formatDuration(log.lateness.minutesLate, language, log.lateness.isLate)}
                                  </span>
                                )}
                             </div>
                           </div>
                         );`;

const newHTML = `                         return (
                           <div className="flex flex-col gap-4">
                             <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <span className="text-sm font-semibold text-gray-500">{t("admin_clock_in")}</span>
                                <div className="text-right flex flex-col items-end">
                                  <div className="flex items-center gap-2">
                                     <span className={\`text-[10px] px-2 py-0.5 rounded-full font-bold \${log.clockInFlagged ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}\`}>
                                       {log.clockInFlagged ? t("dash_out_bounds") : t("dash_in_bounds")}
                                     </span>
                                     <span className={\`text-lg font-bold \${log.clockInFlagged ? 'text-neu-red' : 'text-gray-700'}\`}>
                                       {formatTime(log.clockInTime)}
                                     </span>
                                  </div>
                                  {(() => {
                                    const { isLate, minutesLate } = calculateLateness(log.clockInTime, log.user.shiftType);
                                    return (
                                      <p className={\`text-xs font-bold mt-1 \${isLate ? 'text-neu-red' : 'text-neu-green'}\`}>
                                        {formatDuration(minutesLate, language, isLate)}
                                      </p>
                                    );
                                  })()}
                                </div>
                             </div>
                             
                             <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <span className="text-sm font-semibold text-gray-500">{t("admin_clock_out")}</span>
                                <div className="text-right flex flex-col items-end">
                                  <div className="flex items-center gap-2">
                                     {log.clockOutTime && (
                                        <span className={\`text-[10px] px-2 py-0.5 rounded-full font-bold \${log.clockOutFlagged ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}\`}>
                                          {log.clockOutFlagged ? t("dash_out_bounds") : t("dash_in_bounds")}
                                        </span>
                                     )}
                                     <span className={\`text-lg font-bold \${log.clockOutTime ? (log.clockOutFlagged ? 'text-neu-red' : 'text-gray-700') : 'text-gray-400'}\`}>
                                       {formatTime(log.clockOutTime)}
                                     </span>
                                  </div>
                                </div>
                             </div>
                             
                             <div className="mt-2 pt-2 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-gray-500">{t("admin_dist_in")}</span>
                                  <span className="text-xs font-bold text-gray-700">{formatDistance(log.distanceIn, language)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-gray-500">{t("admin_dist_out")}</span>
                                  <span className="text-xs font-bold text-gray-700">{formatDistance(log.distanceOut, language)}</span>
                                </div>
                             </div>
                           </div>
                         );`;

c = c.replace(targetHTML, newHTML);

fs.writeFileSync('src/app/admin/page.tsx', c);
