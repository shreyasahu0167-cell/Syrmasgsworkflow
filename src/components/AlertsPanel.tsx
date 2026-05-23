import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BellRing, 
  Check, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  Trash2 
} from 'lucide-react';
import { SystemAlert } from '../types';

interface AlertsPanelProps {
  alerts: SystemAlert[];
  onRefreshData: () => void;
}

export default function AlertsPanel({ alerts, onRefreshData }: AlertsPanelProps) {
  
  const handleResolveAlert = async (id: string) => {
    try {
      const res = await fetch('/api/alerts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        onRefreshData();
      } else {
        console.error("Failed to resolve incident");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div id="alerts-center-panel" className="backdrop-blur-xl bg-slate-950/40 border border-slate-900/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between font-mono">
      <div>
        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
          <h3 className="text-sm text-cyan-400 flex items-center gap-2 font-bold uppercase">
            <BellRing className={`w-4 h-4 ${activeAlerts.length > 0 ? 'text-rose-500 animate-bounce' : 'text-cyan-400'}`} />
            MES Live Incident Annunciator Panels
          </h3>
          <span className="text-[9px] text-slate-500 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            {activeAlerts.length} OPEN INS
          </span>
        </div>

        {activeAlerts.length === 0 ? (
          <div id="no-open-alerts" className="py-8 bg-slate-950/40 rounded-xl border border-dashed border-slate-900 text-center flex flex-col items-center justify-center gap-2 text-xs">
            <Check className="w-8 h-8 text-emerald-400 p-1.5 bg-emerald-950/20 border border-emerald-800/20 rounded-full" />
            <p className="text-slate-400">All assembly lines clear. No outstanding incident alarms.</p>
            <span className="text-[10px] text-slate-600 uppercase">Continuous material flow monitored</span>
          </div>
        ) : (
          <div id="live-active-alerts-list" className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <AnimatePresence>
              {activeAlerts.map((alert) => {
                const isCritical = alert.severity === 'critical';
                const isWarning = alert.severity === 'warning';
                
                const cardColor = isCritical 
                  ? 'bg-rose-950/10 border-rose-500/30 text-rose-300' 
                  : isWarning 
                    ? 'bg-amber-950/10 border-amber-500/20 text-amber-300' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-300';

                const Icon = isCritical ? AlertOctagon : isWarning ? AlertTriangle : Info;

                return (
                  <motion.div
                    id={`active-alert-row-${alert.id}`}
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${cardColor}`}
                  >
                    <div className="flex gap-2.5 items-start">
                      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-relaxed">
                        <div className="flex items-center gap-2 font-bold mb-0.5">
                          <span className="text-slate-100 uppercase">{alert.id}</span>
                          <span className="text-[9px] opacity-60">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="px-1 text-[8px] rounded border uppercase shrink-0 font-extrabold bg-slate-950 border-current opacity-80">
                            {alert.stage} CELL
                          </span>
                        </div>
                        <p className="font-sans text-[10.5px] leading-snug">{alert.message}</p>
                      </div>
                    </div>

                    <button
                      id={`resolve-alert-trigger-${alert.id}`}
                      onClick={() => handleResolveAlert(alert.id)}
                      className="p-1 px-2 font-sans font-bold bg-slate-950/60 hover:bg-emerald-500 hover:text-slate-950 text-slate-400 rounded text-[9px] border border-slate-800 hover:border-emerald-500/30 transition uppercase shrink-0 cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* HISTORIC ARCHIVES LIST */}
        {resolvedAlerts.length > 0 && (
          <div className="mt-5">
            <span className="text-[10px] text-slate-500 block mb-2 font-bold border-b border-slate-900 pb-1.5">
              Acknowledged incidents logs (Downtime logs)
            </span>
            <div id="resolved-alerts-archives" className="space-y-1 max-h-[120px] overflow-y-auto font-sans pr-1">
              {resolvedAlerts.map(alert => (
                <div key={alert.id} className="p-2 border border-slate-900/60 bg-slate-950/20 text-slate-500 rounded-lg text-[10px] flex items-center justify-between gap-2">
                  <span className="truncate max-w-[200px]">✓ {alert.message}</span>
                  <span className="text-[9px] font-mono whitespace-nowrap opacity-60 shrink-0">resolved at {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-[9px] text-slate-600 text-center uppercase tracking-wide">
        Incident diagnostics recorded under MES quality logs
      </div>
    </div>
  );
}
