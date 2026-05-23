import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, 
  ArrowRightLeft, 
  PlusCircle, 
  CheckCircle, 
  QrCode, 
  Cpu, 
  Send,
  AlertCircle
} from 'lucide-react';
import { Stage, Workorder } from '../types';

interface ScannerSimulatorProps {
  workorders: Workorder[];
  onRefreshData: () => void;
  onSelectWorkorder: (id: string) => void;
}

export default function ScannerSimulator({ 
  workorders, 
  onRefreshData,
  onSelectWorkorder 
}: ScannerSimulatorProps) {
  
  // SCANNER STATES
  const [selectedWOId, setSelectedWOId] = useState('');
  const [scanStage, setScanStage] = useState<Stage>('IGI');
  const [scanType, setScanType] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const [operatorId, setOperatorId] = useState('OP-3310');
  
  // BOARD SIMULATOR STATES
  const [boardIncrementAmt, setBoardIncrementAmt] = useState(25);
  
  // NEW WORKORDER STATES
  const [newWOId, setNewWOId] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newSku, setNewSku] = useState('SY-AUTO-');
  const [newQty, setNewQty] = useState(200);
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newResponsible, setNewResponsible] = useState('Suresh Nair');

  // TRIGGER EFFECTS
  const [flashAnimation, setFlashAnimation] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  // Default selected workorder if missing
  React.useEffect(() => {
    if (workorders.length > 0 && !selectedWOId) {
      setSelectedWOId(workorders[0].id);
    }
  }, [workorders, selectedWOId]);

  const activeWO = workorders.find(wo => wo.id === selectedWOId);

  // MES Scanner trigger
  const handleMESScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWOId) return;

    setFlashAnimation(true);
    setTimeout(() => setFlashAnimation(false), 800);

    try {
      const response = await fetch('/api/workorders/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workorderId: selectedWOId,
          stage: scanStage,
          scanType: scanType,
          operator: operatorId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedbackMsg({ text: data.error || "Lockout scanner error", type: 'error' });
      } else {
        setFeedbackMsg({ 
          text: `SUCCESS: ${selectedWOId} registered at ${scanStage} (${scanType} scan approved).`, 
          type: 'success' 
        });
        onSelectWorkorder(selectedWOId);
        onRefreshData();
      }
    } catch (err) {
      setFeedbackMsg({ text: "Backend integration offline", type: 'error' });
    }

    // Auto clear feedback
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Log boards passing through active stages
  const handleIncrementBoards = async () => {
    if (!selectedWOId || !activeWO) return;

    try {
      const response = await fetch('/api/workorders/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workorderId: selectedWOId,
          incrementAmount: boardIncrementAmt
        })
      });

      if (response.ok) {
        setFeedbackMsg({ 
          text: `Passed +${boardIncrementAmt} completed panels on line successfully.`, 
          type: 'success' 
        });
        onRefreshData();
      } else {
        const errorData = await response.json();
        setFeedbackMsg({ text: errorData.error || "Failed to log boards.", type: 'error' });
      }
    } catch (err) {
      setFeedbackMsg({ text: "Network error logging boards.", type: 'error' });
    }
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Dispatch brand new WO
  const handleDispatchWorkorder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWOId || !newProduct || !newQty) {
      setFeedbackMsg({ text: "Please enter Workorder ID, Product Name and Target Batch Qty", type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/workorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newWOId,
          productName: newProduct,
          sku: newSku,
          totalQty: newQty,
          priority: newPriority,
          responsiblePerson: newResponsible,
          currentStage: 'IGI'
        })
      });

      if (response.ok) {
        const dispatchObj = await response.json();
        setFeedbackMsg({ text: `DISPATCH SUCCESS: Created new MES Workorder ${dispatchObj.id}`, type: 'success' });
        
        onSelectWorkorder(dispatchObj.id);
        onRefreshData();
        
        // Reset fields
        setNewWOId('');
        setNewProduct('');
        setNewSku('SY-AUTO-');
      } else {
        const data = await response.json();
        setFeedbackMsg({ text: data.error || "Batch dispatch rejected.", type: 'error' });
      }
    } catch (err) {
      setFeedbackMsg({ text: "Database connection rejected.", type: 'error' });
    }
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  return (
    <div id="scanner-and-dispatch-container" className="grid grid-cols-1 xl:grid-cols-2 gap-6 z-10 relative">
      
      {/* SCANNING CONTROLS CARD */}
      <div className="backdrop-blur-xl bg-slate-950/40 border border-slate-900/60 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
        
        {/* Laser Scanning Flash Effect */}
        <AnimatePresence>
          {flashAnimation && (
            <motion.div 
              initial={{ top: "-100%" }}
              animate={{ top: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-red-500 blur-[2px] shadow-[0_0_12px_#ef4444] z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        <div>
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h3 className="text-sm font-mono text-cyan-400 flex items-center gap-2 font-bold uppercase">
              <Scan className="w-4 h-4 text-cyan-400 animate-pulse" />
              MES QR / Barcode Scanner Emulator
            </h3>
            <span className="text-[9px] font-mono text-slate-500">LINE COUPLING AUDIT ACTIVE</span>
          </div>

          <form onSubmit={handleMESScanSubmit} className="space-y-4 font-mono text-xs text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Target WO */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">Scan Workorder ID</label>
                <select
                  id="scanner-wo-select"
                  className="bg-slate-900 border border-slate-800 rounded-lg text-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={selectedWOId}
                  onChange={(e) => setSelectedWOId(e.target.value)}
                >
                  {workorders.map(wo => (
                    <option key={wo.id} value={wo.id}>{wo.id} ({wo.productName.substring(0, 15)}...)</option>
                  ))}
                </select>
              </div>

              {/* Target Stage */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">Assembly Line Station</label>
                <select
                  id="scanner-stage-select"
                  className="bg-slate-900 border border-slate-800 rounded-lg text-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={scanStage}
                  onChange={(e) => setScanStage(e.target.value as Stage)}
                >
                  <option value="IGI">IGI - Incoming Inspection</option>
                  <option value="SMT">SMT - Surface Mount Assembly</option>
                  <option value="MI">MI - Manual Insertion</option>
                  <option value="BLT">BLT - Board Level Testing</option>
                  <option value="FATP">FATP - Assembly & Pack</option>
                  <option value="SHIPMENT">SHIPMENT - Logistics Ready</option>
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Scan Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Scanning checkpoint Type</label>
                <div id="checkpoint-scanning-toggle" className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScanType('ENTRY')}
                    className={`py-2 px-3 rounded-lg border font-bold ${
                      scanType === 'ENTRY' 
                        ? 'border-amber-500 text-amber-400 bg-amber-950/10' 
                        : 'border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    ENTRY SCAN
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanType('EXIT')}
                    className={`py-2 px-3 rounded-lg border font-bold ${
                      scanType === 'EXIT' 
                        ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' 
                        : 'border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    EXIT SCAN
                  </button>
                </div>
              </div>

              {/* Operator */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">Operator Scanner ID Badge</label>
                <input
                  id="scanner-operator-badge-input"
                  type="text"
                  placeholder="e.g. OP-5012"
                  className="bg-slate-900 border border-slate-800 rounded-lg text-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                />
              </div>

            </div>

            {/* Display validation hints */}
            {activeWO && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-900 flex justify-between items-center">
                <span>
                  Current: <strong className="text-amber-400">{activeWO.currentStage}</strong> station 
                  ({activeWO.completedQty}/{activeWO.totalQty} finished panels)
                </span>
                <span className="text-[10px] text-slate-500">WIP Progress: {Math.round((activeWO.completedQty / activeWO.totalQty) * 100)}%</span>
              </div>
            )}

            <button
              id="barcode-scanner-activate-trigger"
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/20 text-slate-950 font-sans font-bold py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all uppercase cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              TRIGGER DIRECT BARCODE BEACON SCAN
            </button>
          </form>
        </div>

        {/* Dynamic Board simulator logger */}
        {activeWO && activeWO.status === 'running' && (
          <div className="mt-5 pt-4 border-t border-slate-900/80 font-mono text-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 text-[10px]">SMT FEEDER / PRODUCTION LINE ACCUMULATOR</span>
              <span className="text-slate-300">Fast Forward passed panels for <strong>{activeWO.id}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <select
                id="panel-increment-count-select"
                className="bg-slate-900 border border-slate-800 rounded-lg text-cyan-400 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                value={boardIncrementAmt}
                onChange={(e) => setBoardIncrementAmt(Number(e.target.value))}
              >
                <option value="1">1 Board</option>
                <option value="10">10 Boards</option>
                <option value="25">25 Boards</option>
                <option value="50">50 Boards</option>
                <option value="100">100 Boards</option>
              </select>

              <button
                id="panel-simulator-increment-trigger"
                onClick={handleIncrementBoards}
                className="p-2.5 px-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-bold font-sans transition-all cursor-pointer"
              >
                PASS BOARDS
              </button>
            </div>
          </div>
        )}

        {/* FEEDBACK STATUS FEEDS */}
        {feedbackMsg && (
          <div className={`mt-3 p-3 rounded-lg border flex items-center gap-2 text-[11px] font-mono ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-950/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-950/10 border-rose-500/30 text-rose-400 animate-shake'
          }`}>
            {feedbackMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

      </div>

      {/* NEW BATCH EXPEDITE / DISPATCH FORM CARD */}
      <div className="backdrop-blur-xl bg-slate-950/40 border border-slate-900/60 rounded-2xl p-5 shadow-xl font-mono flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <h3 className="text-sm text-cyan-400 flex items-center gap-2 font-bold uppercase">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              Dispatch New Workorder Batch (MES DB write)
            </h3>
            <span className="text-[9px] text-slate-500">ADMIN CONTROL CENTER</span>
          </div>

          <form onSubmit={handleDispatchWorkorder} className="space-y-3.5 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-slate-500">Workorder Number</label>
                <input
                  id="new-wo-id-input"
                  type="text"
                  placeholder="e.g. WO-2026-6080"
                  required
                  className="bg-slate-900 border border-slate-800 rounded-lg text-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold uppercase placeholder:lowercase"
                  value={newWOId}
                  onChange={(e) => setNewWOId(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-500">Product SKU Code</label>
                <input
                  id="new-sku-input"
                  type="text"
                  placeholder="e.g. SY-EV-MC-401"
                  className="bg-slate-900 border border-slate-800 rounded-lg text-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 uppercase"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-500">Product / Assembly Name</label>
              <input
                id="new-product-name-input"
                type="text"
                placeholder="EV Controller Board v1.2"
                required
                className="bg-slate-900 border border-slate-800 rounded-lg text-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder:opacity-50"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-slate-500">Batch Quantity (Boards)</label>
                <input
                  id="new-quantity-input"
                  type="number"
                  min="1"
                  required
                  className="bg-slate-900 border border-slate-800 rounded-lg text-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-500">Line Dispatch Priority</label>
                <select
                  id="new-priority-select"
                  className="bg-slate-900 border border-slate-800 rounded-lg text-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                >
                  <option value="low">LOW PRIORITY</option>
                  <option value="medium">MEDIUM PRIORITY</option>
                  <option value="high">HIGH PRIORITY (EXPEDITE)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-slate-500">Supervisor / Assignee</label>
                <input
                  id="new-assignee-input"
                  type="text"
                  placeholder="Supervisor Name"
                  className="bg-slate-900 border border-slate-800 rounded-lg text-slate-200 p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={newResponsible}
                  onChange={(e) => setNewResponsible(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-500">Line coupling stage</label>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-900 text-slate-500 text-center font-bold">
                  AUTOLINKED AT IGI
                </div>
              </div>
            </div>

            <button
              id="new-batch-dispatch-trigger"
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-sans font-bold py-2 px-4 rounded-xl transition-all cursor-pointer mt-2"
            >
              <Send className="w-4 h-4" />
              DISPATCH NEW BATCH INTO PIPELINE
            </button>
          </form>
        </div>

        <p className="text-[10px] text-slate-500 mt-4 leading-snug">
          * Dispatching immediately seeds the workorder into the live MES MongoDB simulation, placing its current stage status at Incoming Goods Inspection (IGI).
        </p>
      </div>

    </div>
  );
}
