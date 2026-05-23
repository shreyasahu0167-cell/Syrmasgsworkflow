import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Check, 
  HelpCircle, 
  User, 
  ShieldAlert, 
  Clock, 
  Layers, 
  Gauge, 
  MapPin 
} from 'lucide-react';
import { Stage, Workorder } from '../types';

interface WorkflowPipelineProps {
  workorders: Workorder[];
  selectedWorkorderId: string;
  onSelectWorkorder: (id: string) => void;
}

const STAGE_LABELS: Record<Stage, string> = {
  IGI: 'Incoming Inspection',
  SMT: 'Surface Mount Technology',
  MI: 'Manual Insertion',
  BLT: 'Board Level Test',
  FATP: 'Final Assembly & Test',
  SHIPMENT: 'Ready for Shipment'
};

const STAGE_DESCS: Record<Stage, string> = {
  IGI: 'Component vetting, visual validation & barcode registration.',
  SMT: 'High-speed automated PCB pick-and-place component assembly.',
  MI: 'Manual through-hole insertion, wave soldering & post-assembly audits.',
  BLT: 'In-circuit electrical test (ICT) and functional RF check.',
  FATP: 'Enclosure integration, firmware flashing & full system test.',
  SHIPMENT: 'Final packaging box boxing, custom container logistics handover.'
};

export default function WorkflowPipeline({ 
  workorders, 
  selectedWorkorderId, 
  onSelectWorkorder 
}: WorkflowPipelineProps) {
  
  // Find the focused workorder
  const selectedWO = workorders.find(wo => wo.id === selectedWorkorderId) || workorders[0];

  if (!selectedWO) {
    return (
      <div id="pipeline-null" className="p-8 backdrop-blur-md rounded-xl bg-slate-900/40 border border-slate-800 text-center">
        <p className="text-slate-400">Loading Syrma SGS Workflow Pipeline...</p>
      </div>
    );
  }

  const stagesList: Stage[] = ['IGI', 'SMT', 'MI', 'BLT', 'FATP', 'SHIPMENT'];
  const currentStageIndex = stagesList.indexOf(selectedWO.currentStage);

  // Determine stage visual configuration
  const getStageState = (stage: Stage) => {
    const stageIndex = stagesList.indexOf(stage);
    const detail = selectedWO.stageDetails[stage];

    // Workorder complete status overrides individual stages to Completed
    if (selectedWO.status === 'completed') {
      return { status: 'completed', colorClass: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400', banner: 'Completed' };
    }

    if (stageIndex < currentStageIndex) {
      return { status: 'completed', colorClass: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400', banner: 'Completed' };
    } else if (stageIndex === currentStageIndex) {
      if (selectedWO.status === 'delayed' || selectedWO.isStuck) {
        return { status: 'delayed', colorClass: 'border-rose-500 bg-rose-950/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]', banner: 'Stuck Alert' };
      }
      return { status: 'running', colorClass: 'border-amber-500 bg-amber-950/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]', banner: 'Active' };
    } else {
      return { status: 'pending', colorClass: 'border-slate-800 bg-slate-900/40 text-slate-500', banner: 'Locked' };
    }
  };

  return (
    <div id="manufacturing-pipeline-container" className="backdrop-blur-xl bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:32px_32px] opacity-10 pointer-events-none" />

      {/* Control Panel Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-900 pb-4 mb-6 z-10 relative">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Manufacturing Flow Control Control Tower
          </span>
          <h2 className="text-xl font-mono text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            STAGING WORKFLOW FOR <span className="text-cyan-400 bg-cyan-950/40 px-2 rounded border border-cyan-800/30">
              {selectedWO.id}
            </span>
          </h2>
        </div>

        {/* Pick Batch Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">Select Workorder:</label>
          <select 
            id="workorder-select-dropdown"
            className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-cyan-300 font-mono px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            value={selectedWO.id}
            onChange={(e) => onSelectWorkorder(e.target.value)}
          >
            {workorders.map(wo => (
              <option key={wo.id} value={wo.id}>
                {wo.id} - {wo.productName.substring(0, 20)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Batch Mini Summary Header Card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/60 border border-slate-900 p-4 rounded-xl mb-8 font-mono text-xs z-10 relative">
        <div className="flex flex-col gap-1 border-r border-slate-900 pr-2">
          <span className="text-slate-500 uppercase text-[10px]">Product / Assembly</span>
          <span className="text-slate-200 truncate font-semibold" title={selectedWO.productName}>{selectedWO.productName}</span>
          <span className="text-slate-400 text-[10px]">SKU: {selectedWO.sku}</span>
        </div>
        <div className="flex flex-col gap-1 border-r border-slate-900 pl-2 pr-2">
          <span className="text-slate-500 uppercase text-[10px]">WIP Status / Priority</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
              selectedWO.status === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' :
              selectedWO.status === 'delayed' ? 'bg-rose-950/40 text-rose-400 border-rose-500/30 animate-pulse' :
              'bg-amber-950/40 text-amber-400 border-amber-500/30'
            }`}>
              {selectedWO.status}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
              selectedWO.priority === 'high' ? 'bg-rose-950/20 text-rose-400 border-rose-800/30' :
              'bg-blue-950/20 text-blue-400 border-blue-800/30'
            }`}>
              {selectedWO.priority} PRI
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-r border-slate-900 pl-2 pr-2">
          <span className="text-slate-500 uppercase text-[10px]">Batch Board Output</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-slate-200 font-bold">{selectedWO.completedQty}</span>
            <span className="text-slate-500">of</span>
            <span className="text-cyan-400">{selectedWO.totalQty} passed</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1 mt-1 overflow-hidden">
            <div 
              className="h-full bg-cyan-400" 
              style={{ width: `${Math.round((selectedWO.completedQty / selectedWO.totalQty) * 100)}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 pl-2">
          <span className="text-slate-500 uppercase text-[10px]">Expected Completion</span>
          <span className="text-slate-400 flex items-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            {new Date(selectedWO.targetShipDate).toLocaleDateString()} {new Date(selectedWO.targetShipDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
          {selectedWO.delayMinutes > 0 && (
            <span className="text-rose-400 font-bold block mt-0.5 text-[10px] animate-pulse">
              ⚠ LATE TIME BY {selectedWO.delayMinutes} MINS
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Staging Nodes Map */}
      <div id="horizontal-stage-nodes-pipeline" className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 py-6 border-b border-slate-900/80 mb-8 relative z-10 overflow-x-auto select-none">
        {stagesList.map((stage, sIdx) => {
          const detail = selectedWO.stageDetails[stage];
          const stConfig = getStageState(stage);
          const isCurrent = stage === selectedWO.currentStage && selectedWO.status !== 'completed';
          const isLast = sIdx === stagesList.length - 1;

          return (
            <React.Fragment key={stage}>
              {/* Dynamic Connecting Line */}
              {sIdx > 0 && (
                <div id={`flow-line-connector-${stage}`} className="hidden lg:flex flex-1 h-1.5 bg-slate-900 rounded-full relative min-w-8">
                  {/* Neon flowing flow-particles for completed stages */}
                  {sIdx <= currentStageIndex ? (
                    <motion.div 
                      className={`absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r ${
                        stConfig.status === 'delayed' ? 'from-rose-500 to-amber-500' : 'from-emerald-400 to-cyan-500'
                      }`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                  ) : null}
                  {/* Dynamic pulse particle traveling along line if running */}
                  {isCurrent && (
                    <span 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 blur-[2px] animate-ping"
                      style={{ left: '50%' }}
                    />
                  )}
                </div>
              )}

              {/* Stage Node Box */}
              <motion.div
                id={`stage-card-node-${stage}`}
                whileHover={{ scale: 1.02 }}
                className={`flex-1 min-w-[140px] px-3.5 py-4 border rounded-xl flex flex-col items-center justify-between text-center gap-2 relative transition-all duration-300 ${stConfig.colorClass}`}
              >
                {/* Node Status Banner */}
                <span className="absolute -top-2 px-2 py-0.5 bg-slate-950 text-[8px] font-mono rounded-full border border-current font-bold uppercase tracking-wider">
                  {stConfig.banner}
                </span>

                {/* Micro-Icon indicator */}
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-1 font-mono font-bold text-xs ${
                  stConfig.status === 'completed' ? 'border-emerald-500 bg-emerald-950/40' :
                  stConfig.status === 'delayed' ? 'border-rose-500 bg-rose-950/40 animate-pulse' :
                  stConfig.status === 'running' ? 'border-amber-500 bg-amber-950/40' :
                  'border-slate-800'
                }`}>
                  {stConfig.status === 'completed' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span>{stage}</span>
                  )}
                </div>

                {/* Label Title */}
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-bold text-slate-100">{stage}</span>
                  <span className="text-[9px] text-slate-400 tracking-wide truncate max-w-[110px]">{STAGE_LABELS[stage]}</span>
                </div>

                {/* Small Board Passed Meter */}
                {detail && (
                  <div className="w-full mt-1.5 pt-1.5 border-t border-slate-900 text-left font-mono">
                    <div className="flex justify-between text-[8px] text-slate-500">
                      <span>BOARDS</span>
                      <span className="text-slate-300">{detail.completedBoards}/{selectedWO.totalQty}</span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-1 mt-0.5 overflow-hidden">
                      <div 
                        className={`h-full ${stConfig.status === 'completed' ? 'bg-emerald-500' : 'bg-cyan-500'}`} 
                        style={{ width: `${Math.round((detail.completedBoards / selectedWO.totalQty) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected Stage Expanded MES Audit logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono z-10 relative">
        
        {/* Left: Active Stage detail sheet */}
        <div className="lg:col-span-2 border border-slate-900 rounded-xl p-4 bg-slate-950/40">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5 mb-3 text-slate-200 text-xs">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>ACTIVE STAGE ANALYSIS : {selectedWO.currentStage}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-900/60">
                <span className="text-slate-500">Description:</span>
                <span className="text-slate-300 text-[10px] text-right font-sans pl-4">
                  {STAGE_DESCS[selectedWO.currentStage]}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900/60">
                <span className="text-slate-500">Entry Timestamp:</span>
                <span className="text-slate-300">
                  {selectedWO.stageDetails[selectedWO.currentStage]?.entryTime ? (
                    new Date(selectedWO.stageDetails[selectedWO.currentStage].entryTime!).toLocaleTimeString()
                  ) : (
                    'Pending Entry Scan'
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900/60">
                <span className="text-slate-500">Total Duration:</span>
                <span className="text-slate-300">
                  {selectedWO.stageDetails[selectedWO.currentStage]?.durationMinutes || 0} Hours
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-900/60">
                <span className="text-slate-500">Responsible Person:</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  {selectedWO.responsiblePerson}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900/60">
                <span className="text-slate-500">Stage Specialist:</span>
                <span className="text-slate-300 text-right">{selectedWO.specialistPerson}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900/60">
                <span className="text-slate-500">Remaining Qty:</span>
                <span className="text-slate-200">
                  {Math.max(0, selectedWO.totalQty - selectedWO.completedQty)} units
                </span>
              </div>
            </div>
          </div>

          {selectedWO.isStuck && (
            <div className="mt-4 p-3 bg-rose-950/10 border border-rose-900/40 text-rose-400 rounded-lg text-[11px] flex items-start gap-2 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase block text-rose-500">MES Delay lockout active</span>
                Target Turnaround Time (TAT) on SMT placement exceeded. System flagged zero movement over last timer sync. Technicians alerted via automated shifts.
              </div>
            </div>
          )}
        </div>

        {/* Right: Stage-wise Bottleneck Alert Heatmap */}
        <div className="border border-slate-900 rounded-xl p-4 bg-slate-950/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5 mb-3 text-slate-200 text-xs">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>STAGE BOTTLENECK HAZ_HEATMAP</span>
            </div>

            <div className="space-y-2">
              {['IGI', 'SMT', 'MI', 'BLT', 'FATP'].map((stage) => {
                const isMatchingAndStuck = selectedWO.currentStage === stage && selectedWO.status === 'delayed';
                const isMatchingAndActive = selectedWO.currentStage === stage && selectedWO.status === 'running';
                
                let hazardLevel = 'Clear';
                let hazardColor = 'bg-slate-900 text-slate-500 border-slate-900';
                
                if (isMatchingAndStuck) {
                  hazardLevel = 'Critical Danger [85/100]';
                  hazardColor = 'bg-rose-950/20 text-rose-400 border-rose-900/30';
                } else if (isMatchingAndActive && selectedWO.priority === 'high') {
                  hazardLevel = 'Moderate capacity load [40/100]';
                  hazardColor = 'bg-amber-950/20 text-amber-400 border-amber-900/30';
                } else {
                  hazardLevel = 'Operational flow optimal';
                  hazardColor = 'bg-emerald-950/10 text-emerald-400 border-emerald-950/30';
                }

                return (
                  <div key={stage} className={`flex items-center justify-between p-1.5 rounded border text-[10px] ${hazardColor}`}>
                    <span className="font-bold">{stage} Assembly Block</span>
                    <span>{hazardLevel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-4 font-sans leading-snug">
            * Hazard alerts trigger automatically in response to delay timers exceeding threshold limits.
          </p>
        </div>

      </div>

    </div>
  );
}
