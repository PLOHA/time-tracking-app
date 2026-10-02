const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf-8');

const regex = /<div className="flex justify-between items-center">\s*<div className="flex flex-col">\s*<span className="text-xs text-gray-500 font-semibold mb-1">\{t\("admin_clock_in"\)\}<\/span>[\s\S]*?\{formatDuration\(log\.lateness\.minutesLate, language, log\.lateness\.isLate\)\}\s*<\/span>\s*\)\}\s*<\/div>/;

const newHTML = `<div className="flex justify-between items-center border-b border-gray-100 pb-3">
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
                             
                             <div className="flex justify-between items-center border-b border-gray-100 pb-3 mt-3">
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
                             </div>`;

c = c.replace(regex, newHTML);

fs.writeFileSync('src/app/admin/page.tsx', c);
