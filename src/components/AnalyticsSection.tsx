import React, { useState, useRef, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  Cell 
} from 'recharts';
import { AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, BarChart4, AlertOctagon, HelpCircle, FileDown, ChevronDown } from 'lucide-react';
import { Stage, ManpowerAllocation, Workorder } from '../types';

interface AnalyticsSectionProps {
  manpower: {
    allocations: ManpowerAllocation[];
  };
  analyticsData: {
    name: string;
    efficiency: number;
    completedQty: number;
    dpm: number;
  }[];
  workordersCount: number;
  selectedWorkorderId: string;
  workorders: Workorder[];
}

export default function AnalyticsSection({ 
  manpower, 
  analyticsData,
  workordersCount,
  selectedWorkorderId,
  workorders
}: AnalyticsSectionProps) {

  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    const activeWO = workorders.find(wo => wo.id === selectedWorkorderId) || workorders[0];
    if (!activeWO) return;

    // Headers
    const headers = ["Timestamp", "Action", "Stage", "Operator", "Workorder ID", "Product", "SKU"];
    
    // Logs rows
    const logs = activeWO.historyLogs || [];
    const rows = logs.map(log => [
      log.timestamp || "",
      `"${(log.action || '').replace(/"/g, '""')}"`,
      log.stage || "",
      `"${(log.operator || '').replace(/"/g, '""')}"`,
      activeWO.id,
      `"${activeWO.productName.replace(/"/g, '""')}"`,
      activeWO.sku
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Batch_Logs_${activeWO.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  // Prepare custom manpower chart data
  const manpowerChartData = manpower.allocations.map(m => ({
    stage: m.stage,
    utilization: m.utilization,
    active: m.active,
    idle: m.idle,
    total: m.total
  }));

  const handleDownloadReport = () => {
    // Generate simple custom text report download
    const reportContent = `
=========================================
SYRMA SGS - MES STATUS DISPATCH REPORT
Generated: ${new Date().toISOString()}
=========================================

1. OPERATIONAL ANALYSIS METRICS
   - Total Tracked Batches: ${workordersCount} WOs
   - Line shift schedule: Shift-B
   - System state: Fully Balanced

2. TECHNICIAN ASSIGNMENTS
${manpower.allocations.map(a => `   - ${a.stage} Cell: Total staff ${a.total} | Active ${a.active} | Idle ${a.idle} | Util: ${a.utilization}%`).join('\n')}

3. HISTORICAL SHIFT PERFORMANCE
${analyticsData.map(d => `   - ${d.name}: Efficiency: ${d.efficiency}% | Passed boards: ${d.completedQty} | Defects Index (DPM): ${d.dpm}`).join('\n')}

- END OF REPORT -
=========================================
`;
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Syrma_SGS_MES_Status_Report_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="analytics-section-charts" className="grid grid-cols-1 xl:grid-cols-3 gap-6 z-10 relative">
      
      {/* CHART 1: SHIFT PERFORMANCE CONTROLLER */}
      <div className="backdrop-blur-xl bg-slate-950/40 border border-slate-900/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h3 className="text-sm font-mono text-cyan-400 flex items-center gap-2 font-bold uppercase">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Shift Production Analytics
            </h3>
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                id="analytics-download-trigger"
                onClick={() => setShowMenu(prev => !prev)}
                className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 px-2.5 py-1.5 rounded-md transition cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>EXPORTS</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1.5 w-64 rounded-xl bg-slate-950 border border-slate-900 shadow-2xl p-1.5 z-50 origin-top-right text-xs font-mono"
                  >
                    <button
                      id="export-txt-report-btn"
                      onClick={() => {
                        handleDownloadReport();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[11px] text-slate-300 hover:text-cyan-300 hover:bg-slate-900/60 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                      Download TXT Status Report
                    </button>
                    <button
                      id="export-csv-logs-btn"
                      onClick={handleExportCSV}
                      className="w-full text-left px-3 py-2 text-[11px] text-slate-300 hover:text-cyan-300 hover:bg-slate-900/60 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      <span>Export CSV Logs ({selectedWorkorderId})</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="text-[10px] font-mono text-slate-500 mb-4 leading-relaxed uppercase">
            Efficiency % and Finished Batch Output comparison across daily shifts.
          </p>

          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer>
              <AreaChart
                data={analyticsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={8} 
                  tickLine={false}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={8} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: 10, fontFamily: 'monospace' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
                <Area 
                  type="monotone" 
                  name="Efficiency %" 
                  dataKey="efficiency" 
                  stroke="#06b6d4" 
                  fillOpacity={1} 
                  fill="url(#colorEff)" 
                />
                <Area 
                  type="monotone" 
                  name="Board Qty" 
                  dataKey="completedQty" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorQty)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-3 text-[9px] text-slate-500 font-mono text-right">
          INTEGRATION RE-INDEX CYCLE: 300S
        </div>
      </div>

      {/* CHART 2: SHIFT DEFECTS DPM */}
      <div className="backdrop-blur-xl bg-slate-950/40 border border-slate-900/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h3 className="text-sm font-mono text-cyan-400 flex items-center gap-2 font-bold uppercase">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              Solder Defects Density (DPM)
            </h3>
            <span className="text-[9px] font-mono text-slate-500">ISO 9001 DEFECT RATE INDEX</span>
          </div>

          <p className="text-[10px] font-mono text-slate-500 mb-4 leading-relaxed uppercase">
            Defects Per Million (DPM) registered on automatic optical test (AOI).
          </p>

          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer>
              <LineChart
                data={analyticsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={8} 
                  tickLine={false}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={8} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: 10, fontFamily: 'monospace' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
                <Line 
                  type="monotone" 
                  name="Solder Defects Index" 
                  dataKey="dpm" 
                  stroke="#f43f5e" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-3 text-[9px] text-slate-500 font-mono text-right">
          MAX TOLERATED LEVEL: 60 DPM
        </div>
      </div>

      {/* CHART 3: DYNAMIC TECHNICIAN UTILIZATION */}
      <div className="backdrop-blur-xl bg-slate-950/40 border border-slate-900/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h3 className="text-sm font-mono text-cyan-400 flex items-center gap-2 font-bold uppercase">
              <BarChart4 className="w-4 h-4 text-cyan-400" />
              Cell Manpower Load Heatmap
            </h3>
            <span className="text-[9px] font-mono text-slate-500">LIVE WORKSTATION LOADS</span>
          </div>

          <p className="text-[10px] font-mono text-slate-500 mb-4 leading-relaxed uppercase">
            Active operator utilization percentages mapped across assembly blocks.
          </p>

          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer>
              <BarChart
                data={manpowerChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                <XAxis 
                  dataKey="stage" 
                  stroke="#475569" 
                  fontSize={8} 
                  tickLine={false}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={8} 
                  tickLine={false} 
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: 10, fontFamily: 'monospace' }}
                />
                <Bar 
                  dataKey="utilization" 
                  name="Utilization %" 
                  fill="#06b6d4" 
                  radius={[4, 4, 0, 0]}
                >
                  {manpowerChartData.map((entry, index) => {
                    const isHigh = entry.utilization >= 95;
                    const isLow = entry.utilization <= 50;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isHigh ? '#f59e0b' : isLow ? '#6366f1' : '#06b6d4'} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-3 text-[9px] text-slate-500 font-mono text-right flex justify-between">
          <div className="flex gap-2">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"/> Overloaded</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"/> Optimal</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"/> Idle</span>
          </div>
          <span>BETA RATIO ACCURATE</span>
        </div>
      </div>

    </div>
  );
}
