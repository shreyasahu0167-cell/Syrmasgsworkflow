import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  ArrowRight, 
  Settings, 
  CheckCircle,
  TrendingUp, 
  UserPlus, 
  Sparkle,
  Zap, 
  LogOut 
} from 'lucide-react';
import { Stage, ManpowerAllocation } from '../types';

interface ManpowerModuleProps {
  manpower: {
    allocations: ManpowerAllocation[];
    suggestions: { from: Stage, to: Stage, count: number, reason: string }[];
  };
  onRefreshData: () => void;
}

export default function ManpowerModule({ manpower, onRefreshData }: ManpowerModuleProps) {
  const [loadingShift, setLoadingShift] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleApplyShift = async (from: Stage, to: Stage, count: number) => {
    setLoadingShift(true);
    try {
      const res = await fetch('/api/manpower/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromStage: from, toStage: to, count })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Allocations updated! Transferred ${count} technicians from ${from} to ${to}.`);
        onRefreshData();
      } else {
        alert(data.error || "Shift transfer rejected");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingShift(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div id="manpower-module-block" className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10 relative">
      
      {/* LEFT & CENTER Columns: STAGE ALLOCATIONS DISPLAY GRID */}
      <div className="lg:col-span-2 backdrop-blur-xl bg-slate-950/40 border border-slate-900/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h3 className="text-sm font-mono text-cyan-400 flex items-center gap-2 font-bold uppercase">
              <Users className="w-4 h-4 text-cyan-400" />
              Dynamic Technician Allocation Matrix
            </h3>
            <span className="text-[9px] font-mono text-slate-500">SHIFT-B LINE COUPLING SCHEDULE</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
            {manpower.allocations.map((alloc) => {
              const util = alloc.utilization;
              const isOverutil = util >= 95;
              const isUnderutil = util <= 50;

              return (
                <div 
                  id={`manpower-stage-card-${alloc.stage}`}
                  key={alloc.stage} 
                  className={`p-3.5 border rounded-xl flex flex-col justify-between h-36 bg-slate-950/40 relative overflow-hidden transition-all duration-300 ${
                    isOverutil ? 'border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.06)]' :
                    isUnderutil ? 'border-sky-500/10' : 'border-slate-900'
                  }`}
                >
                  {/* Miniature Utilization Progress Glow Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900">
                    <div 
                      className={`h-full ${
                        isOverutil ? 'bg-amber-400' :
                        isUnderutil ? 'bg-indigo-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${util}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{alloc.stage} Block</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${
                      isOverutil ? 'bg-amber-950/40 text-amber-400 border-amber-800/30 animate-pulse' :
                      isUnderutil ? 'bg-sky-950/40 text-sky-400 border-sky-900/30' :
                      'bg-emerald-950/20 text-emerald-400 border-emerald-900/10'
                    }`}>
                      {isOverutil ? 'Overloaded' : isUnderutil ? 'Idle Staff' : 'Sufficient'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2.5 my-1 border-y border-slate-900/80 text-[10px]">
                    <div className="text-center">
                      <span className="text-[8px] text-slate-500 block">TOTAL</span>
                      <strong className="text-slate-300 text-sm">{alloc.total}</strong>
                    </div>
                    <div className="text-center border-x border-slate-900">
                      <span className="text-[8px] text-emerald-500 block">ACTIVE</span>
                      <strong className="text-emerald-400 text-sm">{alloc.active}</strong>
                    </div>
                    <div className="text-center">
                      <span className="text-[8px] text-indigo-400 block">IDLE</span>
                      <strong className="text-indigo-400 text-sm">{alloc.idle}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Utilization %</span>
                    <span className={`font-mono font-bold ${
                      isOverutil ? 'text-amber-400' :
                      isUnderutil ? 'text-indigo-400' : 'text-cyan-400'
                    }`}>{util}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-[9px] text-slate-500 font-mono">
          * Technicians are scheduled daily. Idle technicians are eligible for line-balancing dispatch to relieve SMT and FATP assembly congestion.
        </div>
      </div>

      {/* RIGHT Column: AI SHIFTING ALERTS CONTAINER */}
      <div className="backdrop-blur-xl bg-slate-950/40 border border-slate-900/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between font-mono">
        <div>
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h3 className="text-sm text-cyan-400 flex items-center gap-2 font-bold uppercase">
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              Dynamic Line Balance System
            </h3>
            <span className="text-[9px] text-amber-400 font-bold bg-amber-950/20 border border-amber-800/30 px-1.5 rounded">
              AI LIVE SUGGESTIONS
            </span>
          </div>

          {manpower.suggestions.length === 0 ? (
            <div id="no-shifts-available" className="p-4 border border-slate-900/60 rounded-xl bg-slate-950/40 text-center flex flex-col items-center justify-center gap-2 h-48 select-none">
              <CheckCircle className="w-8 h-8 text-emerald-400 opacity-60" />
              <p className="text-[11px] text-slate-400 font-sans">Technician matrix is perfectly balanced.</p>
              <span className="text-[9px] text-slate-600">SMT & MI assembly cell ratios are optimal.</span>
            </div>
          ) : (
            <div id="shifts-suggestions-list" className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {manpower.suggestions.map((sug, idx) => {
                return (
                  <div 
                    id={`shifting-suggestion-${sug.from}-${sug.to}`}
                    key={idx} 
                    className="p-3 bg-slate-950 rounded-xl border border-slate-900 hover:border-cyan-500/20 text-xs flex flex-col gap-2 transition"
                  >
                    <div className="flex items-center justify-between font-bold border-b border-slate-900 pb-1.5 text-[10px]">
                      <span className="text-indigo-400 flex items-center gap-1">
                        FROM: {sug.from} Stage
                      </span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                      <span className="text-cyan-400 flex items-center gap-1">
                        TO: {sug.to} Stage
                      </span>
                      <span className="text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {sug.count} TECHS
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-snug font-sans">
                      {sug.reason}
                    </p>

                    <button
                      id={`apply-technician-shift-trigger-${idx}`}
                      disabled={loadingShift}
                      onClick={() => handleApplyShift(sug.from, sug.to, sug.count)}
                      className="w-full flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-1.5 rounded-lg text-[10px] uppercase font-sans transition shrink-0 cursor-pointer"
                    >
                      <Sparkle className="w-3.5 h-3.5" />
                      AUTO-Shift technicians
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shifting success toast within the card */}
        {successMsg && (
          <div className="mt-3 p-2 bg-emerald-950/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] text-center font-bold">
            {successMsg}
          </div>
        )}

        <div className="mt-4 p-2 bg-slate-950 rounded border border-slate-900 text-[9px] text-slate-500 text-center">
          DYNAMIC INTEGRATION STATUS CODE: 200 OK
        </div>
      </div>

    </div>
  );
}
