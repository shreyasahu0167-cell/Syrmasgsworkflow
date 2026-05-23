import React from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  Zap, 
  TrendingUp 
} from 'lucide-react';
import { LiveMetrics } from '../types';

interface KPICardsProps {
  metrics: LiveMetrics;
}

export default function KPICards({ metrics }: KPICardsProps) {
  const kpis = [
    {
      id: 'kpi-running',
      title: 'Active Workorders',
      value: metrics.runningCount,
      icon: Activity,
      color: 'text-cyan-400',
      glow: 'shadow-cyan-500/20',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-950/10',
      desc: 'WOs currently on assembly line'
    },
    {
      id: 'kpi-delayed',
      title: 'Delayed Batches',
      value: metrics.delayedCount,
      icon: AlertTriangle,
      color: metrics.delayedCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400',
      glow: metrics.delayedCount > 0 ? 'shadow-rose-500/30 border-rose-500/50' : 'shadow-transparent',
      border: metrics.delayedCount > 0 ? 'border-rose-500/40' : 'border-slate-800',
      bg: 'bg-rose-950/10',
      desc: 'Batches exceeding stage TAT'
    },
    {
      id: 'kpi-completed',
      title: 'Completed Today',
      value: metrics.completedTodayCount,
      icon: CheckCircle,
      color: 'text-emerald-400',
      glow: 'shadow-emerald-500/10',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/10',
      desc: 'Batches fully dispatched'
    },
    {
      id: 'kpi-efficiency',
      title: 'Line Efficiency',
      value: `${metrics.factoryEfficiency}%`,
      icon: Zap,
      color: 'text-amber-400',
      glow: 'shadow-amber-500/15',
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/10',
      desc: 'Based on actual line utilization',
      progress: metrics.factoryEfficiency
    },
    {
      id: 'kpi-otd',
      title: 'On-Time Delivery (OTD)',
      value: `${metrics.onTimeDeliveryPercent}%`,
      icon: TrendingUp,
      color: 'text-indigo-400',
      glow: 'shadow-indigo-500/15',
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-950/10',
      desc: 'Current operational commitment',
      progress: metrics.onTimeDeliveryPercent
    },
    {
      id: 'kpi-wip',
      title: 'Total WIP Panels',
      value: metrics.wipCount,
      icon: Cpu,
      color: 'text-violet-400',
      glow: 'shadow-violet-500/15',
      border: 'border-violet-500/30',
      bg: 'bg-violet-950/10',
      desc: 'Active printed circuit boards'
    }
  ];

  return (
    <div id="kpi-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            id={kpi.id}
            key={kpi.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={`relative overflow-hidden backdrop-blur-xl border ${kpi.border} rounded-xl p-4 flex flex-col justify-between h-36 ${kpi.bg} shadow-lg ${kpi.glow}`}
          >
            {/* Ambient Background Light Spot */}
            <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full bg-current opacity-5 blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-sans tracking-wide uppercase">{kpi.title}</p>
                <h3 className={`text-2xl font-mono font-bold mt-1 tracking-tight ${kpi.color}`}>
                  {kpi.value}
                </h3>
              </div>
              <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${kpi.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-2">
              {kpi.progress !== undefined ? (
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${
                      kpi.progress > 85 ? 'from-cyan-500 to-emerald-400' : 'from-amber-600 to-amber-400'
                    }`}
                    style={{ width: `${kpi.progress}%` }}
                  />
                </div>
              ) : null}
              <p className="text-[10px] text-slate-500 mt-1 truncate font-sans">{kpi.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
