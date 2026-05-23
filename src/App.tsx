import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Settings, 
  Terminal, 
  Activity, 
  Clock, 
  RotateCcw,
  Zap,
  HardDrive
} from 'lucide-react';

import { LiveMetrics, Workorder, ManpowerAllocation, SystemAlert } from './types';
import KPICards from './components/KPICards';
import WorkflowPipeline from './components/WorkflowPipeline';
import ScannerSimulator from './components/ScannerSimulator';
import ManpowerModule from './components/ManpowerModule';
import AIPrediction from './components/AIPrediction';
import AnalyticsSection from './components/AnalyticsSection';
import AlertsPanel from './components/AlertsPanel';

export default function App() {
  // CORE STATES
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<LiveMetrics>({
    runningCount: 0,
    delayedCount: 0,
    completedTodayCount: 0,
    factoryEfficiency: 0,
    onTimeDeliveryPercent: 0,
    wipCount: 0
  });

  const [workorders, setWorkorders] = useState<Workorder[]>([]);
  const [manpower, setManpower] = useState<{
    allocations: ManpowerAllocation[];
    suggestions: any[];
  }>({ allocations: [], suggestions: [] });
  
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  
  // CONTROL PANELS UX
  const [selectedWOId, setSelectedWOId] = useState<string>('WO-2026-1001');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [roleMode, setRoleMode] = useState<'QC' | 'OPERATOR' | 'SUPERVISOR'>('QC');
  const [utcClock, setUtcClock] = useState('');
  
  // TRIGGER STATE TO RE-EVALUATE GEMINI PREDICTIONS
  const [aiTriggerCount, setAiTriggerCount] = useState(0);

  // FETCH APIS FUNCTION
  const fetchDashboardData = async () => {
    try {
      const [resMetrics, resWos, resMp, resAlerts, resAnalytics] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/workorders'),
        fetch('/api/manpower'),
        fetch('/api/alerts'),
        fetch('/api/analytics')
      ]);

      if (resMetrics.ok && resWos.ok && resMp.ok && resAlerts.ok && resAnalytics.ok) {
        const dM = await resMetrics.json();
        const dW = await resWos.json();
        const dMp = await resMp.json();
        const dAl = await resAlerts.json();
        const dAn = await resAnalytics.json();

        setMetrics(dM);
        setWorkorders(dW);
        setManpower(dMp);
        setAlerts(dAl);
        setAnalyticsData(dAn);
      }
    } catch (e) {
      console.error("Express backend currently offline or starting...", e);
    } finally {
      setLoading(false);
    }
  };

  // INITIAL RUN & 4-SECOND RE-POLLING LOOP (MES REAL-TIME SENSORS)
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 4000); // Poll every 4 seconds to catch active simulated material progressions!
    return () => clearInterval(interval);
  }, []);

  // REAL UTC CLOCK SIMULATOR
  useEffect(() => {
    const clockInt = setInterval(() => {
      const now = new Date();
      setUtcClock(now.toISOString().replace('Z', ' ').replace('T', ' '));
    }, 1000);
    return () => clearInterval(clockInt);
  }, []);

  // Filtered list of all workorders
  const filteredWorkorders = workorders.filter(wo => {
    const matchSearch = wo.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        wo.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        wo.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = priorityFilter === 'all' || wo.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  return (
    <div id="full-dashboard-viewport" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative select-text selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background Neon Grid Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0c4a6e_0%,#020617_80%)] opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none" />

      {/* HEADER BAR */}
      <header id="syrma-dashboard-header" className="backdrop-blur-xl border-b border-slate-900 bg-slate-950/60 sticky top-0 z-50 px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Brand details */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/10 border border-cyan-400/20 shrink-0">
            <Cpu className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-mono font-black tracking-tight text-slate-100 uppercase">
                Syrma SGS
              </h1>
              <span className="text-[10px] bg-cyan-950/60 text-cyan-400 border border-cyan-800/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                MES Control Tower
              </span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Electronics Manufacturing Assembly Command Center
            </p>
          </div>
        </div>

        {/* Central Live Triggers */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
          
          {/* UTC Clock */}
          <div className="bg-slate-950 border border-slate-900 rounded-lg p-2 flex items-center gap-2 text-slate-400 px-3 py-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <span>UTC TIME: <strong className="text-slate-100">{utcClock || '2026-05-23 14:45:25'}</strong></span>
          </div>

          {/* Supervisor role selector */}
          <div className="bg-slate-950 border border-slate-900 rounded-lg p-1.5 flex items-center gap-1 shrink-0">
            <span className="text-slate-500 px-1 text-[10px] uppercase">COUPLED ROLE:</span>
            <button
              id="role-qc-toggle"
              onClick={() => setRoleMode('QC')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleMode === 'QC' ? 'bg-cyan-600 text-slate-950' : 'text-slate-400'}`}
            >
              QA MANAGER
            </button>
            <button
              id="role-operator-toggle"
              onClick={() => setRoleMode('OPERATOR')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleMode === 'OPERATOR' ? 'bg-amber-600 text-slate-950' : 'text-slate-400'}`}
            >
              OPERATOR
            </button>
            <button
              id="role-supervisor-toggle"
              onClick={() => setRoleMode('SUPERVISOR')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleMode === 'SUPERVISOR' ? 'bg-purple-600 text-slate-505 text-white' : 'text-slate-400'}`}
            >
              SUPERVISOR
            </button>
          </div>

          {/* Quick Refresh indicators */}
          <button
            id="force-mes-sensors-refresh"
            onClick={fetchDashboardData}
            className="p-2 border border-slate-900 hover:border-cyan-500/20 bg-slate-950 text-slate-400 hover:text-cyan-400 rounded-lg transition-all cursor-pointer"
            title="Manual Poll Sensors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </header>

      {/* SYSTEM COUPLING MESSAGE */}
      <div className="px-6 py-2 bg-cyan-950/20 border-b border-cyan-500/10 flex items-center justify-between text-[11px] font-mono text-cyan-400 mt-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>REAL-TIME PIPELINE INTERFACE CORRELATOR: CONNECTED TO L3 ASSEMBLY SYSTEM</span>
        </div>
        <span className="text-slate-500 uppercase text-[9px]">Solder Defects: PASSING 99.98%</span>
      </div>

      {loading ? (
        <div id="mes-control-loading" className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-24">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <p className="font-mono text-cyan-400 text-xs tracking-widest uppercase">Initializing Syrma SGS Database...</p>
        </div>
      ) : (
        <main id="mes-dashboard-view-grid" className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto relative z-10">
          
          {/* SECTION 1: METRICS PANEL */}
          <KPICards metrics={metrics} />

          {/* TWO COLUMN GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LARGE COLUMN: WORKORDER TRACE & PIPELINE MAP */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* PRIMARY VISUAL CHECKPOINT WORKFLOW */}
              <WorkflowPipeline 
                workorders={workorders} 
                selectedWorkorderId={selectedWOId}
                onSelectWorkorder={(id) => setSelectedWOId(id)}
              />

              {/* LIVE BATCH DATABASE MANAGER LISTING */}
              <div id="mesdb-batches-manager-card" className="backdrop-blur-xl bg-slate-950/40 border border-slate-900/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-900 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-sm font-mono text-cyan-400 font-bold uppercase">
                        Active Master Batch Registry (MES DB View)
                      </h3>
                    </div>

                    {/* Filter operations */}
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      
                      {/* Search box */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="db-batch-search-field"
                          type="text"
                          placeholder="Search batch..."
                          className="bg-slate-900 border border-slate-800 rounded-lg text-slate-200 pl-8 pr-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 max-w-[150px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      {/* Priority dropdown */}
                      <select
                        id="db-batch-priority-selector"
                        className="bg-slate-900 border border-slate-800 rounded-lg text-slate-300 px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                      >
                        <option value="all">ALL METRICS</option>
                        <option value="high">HIGH PRIORITY</option>
                        <option value="medium">MEDIUM PRI</option>
                        <option value="low">LOW PRI</option>
                      </select>

                    </div>
                  </div>

                  {/* Batch table layout */}
                  <div id="master-batches-table-wrapper" className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-500 text-[10px] uppercase">
                          <th className="py-2">Workorder ID</th>
                          <th className="py-2">Assembly Assembly</th>
                          <th className="py-2 text-center">Active Station</th>
                          <th className="py-2 text-center">In-Stage Progress</th>
                          <th className="py-2 text-center">Status</th>
                          <th className="py-2 text-right">Dispatch Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60">
                        {filteredWorkorders.map(wo => {
                          const isFocused = wo.id === selectedWOId;
                          const progress = Math.round((wo.completedQty / wo.totalQty) * 100);
                          
                          return (
                            <tr 
                              key={wo.id} 
                              className={`hover:bg-slate-900/40 cursor-default transition-all ${
                                isFocused ? 'bg-cyan-950/10' : ''
                              }`}
                            >
                              <td className="py-3 font-bold text-cyan-400">
                                {wo.id}
                              </td>
                              <td className="py-3 max-w-[160px] truncate" title={wo.productName}>
                                {wo.productName}
                              </td>
                              <td className="py-3 text-center">
                                <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-300">
                                  {wo.currentStage}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-2 justify-center max-w-[140px] mx-auto text-[10px]">
                                  <div className="w-16 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full bg-cyan-400" style={{ width: `${progress}%` }} />
                                  </div>
                                  <span>{wo.completedQty}/{wo.totalQty}</span>
                                </div>
                              </td>
                              <td className="py-3 text-center">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                                  wo.status === 'completed' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' :
                                  wo.status === 'delayed' ? 'bg-rose-950/20 text-rose-400 border-rose-500/20 animate-pulse' :
                                  'bg-amber-950/20 text-amber-400 border-amber-500/20'
                                }`}>
                                  {wo.status}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  id={`select-batch-action-${wo.id}`}
                                  onClick={() => setSelectedWOId(wo.id)}
                                  className="px-2.5 py-1 text-[10px] font-bold bg-slate-900 border border-slate-800 hover:border-cyan-500/30 rounded-lg text-slate-300 hover:text-cyan-400 transition cursor-pointer"
                                >
                                  Trace Flow
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 text-[9px] text-slate-500 font-mono flex items-center justify-between">
                  <span>* Filtered workorders matched: {filteredWorkorders.length} batches</span>
                  <span>* Total batches tracked: {workorders.length} WOs</span>
                </div>
              </div>

            </div>

            {/* SMALL COLUMN: ASSIST SYSTEM & CONTROL TERMINALS */}
            <div className="space-y-6">
              
              {/* ALERTS PANEL CENTER */}
              <AlertsPanel alerts={alerts} onRefreshData={fetchDashboardData} />

              {/* COGNITIVE AI NEURAL BRAIN DIAGNOSTICS */}
              <AIPrediction onRefreshTriggered={aiTriggerCount} />

              {/* DOCK BAR QUICK COGNITIVE MANUAL TRIGGER */}
              <div className="p-4 rounded-xl border border-dashed border-slate-900/80 bg-slate-950/60 flex items-center justify-between font-mono text-[10px] text-slate-500">
                <span>Sticking material logs flagged?</span>
                <button
                  id="submit-ai-re-routing"
                  onClick={() => setAiTriggerCount(prev => prev + 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg transition font-bold font-sans cursor-pointer uppercase text-[9px]"
                >
                  <Sparkles className="w-3 h-3 text-slate-950" />
                  Trigger Neural Refit
                </button>
              </div>

            </div>

          </div>

          {/* DYNAMIC SHIFT TERMINALS AND DISPATCH SCHEDULER BENTO GRID */}
          <ScannerSimulator 
            workorders={workorders} 
            onRefreshData={fetchDashboardData} 
            onSelectWorkorder={(id) => setSelectedWOId(id)}
          />

          {/* SECTION 3: MANPOWER SHIFTING MODULE */}
          <ManpowerModule manpower={manpower} onRefreshData={fetchDashboardData} />

          {/* SECTION 4: PRODUCTION PERFORMANCE CHARTS */}
          <AnalyticsSection 
            manpower={manpower} 
            analyticsData={analyticsData}
            workordersCount={workorders.length}
            selectedWorkorderId={selectedWOId}
            workorders={workorders}
          />

        </main>
      )}

      {/* FOOTER BAR */}
      <footer id="syrma-mes-footer" className="border-t border-slate-900 bg-slate-950 py-6 px-12 text-center font-mono text-[11px] text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4 mt-12">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 stroke-2" />
          SYRMA SGS MES DIGITAL INTEGRITY CERTIFIED &bull; ISO 9001 / ISO 13485
        </span>
        <span>
          Chennai Production Unit &bull; Line 3 Automation Tower v4.8
        </span>
      </footer>

    </div>
  );
}
