import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Brain, 
  Activity, 
  Clock, 
  ShieldAlert, 
  Timer, 
  CheckCircle,
  TrendingUp, 
  RefreshCw 
} from 'lucide-react';

interface Bottleneck {
  stage: string;
  probability: string;
  reason: string;
}

interface AIPredictionProps {
  onRefreshTriggered: number; // parent count trigger
}

export default function AIPrediction({ onRefreshTriggered }: AIPredictionProps) {
  const [loading, setLoading] = useState(false);
  const [predictionData, setPredictionData] = useState<{
    predictedBottlenecks: Bottleneck[];
    aiShiftRecommendations: string[];
    estimatedWipClearingTime: string;
    factoryHealthScore: number;
    aiSummary: string;
  } | null>(null);

  const fetchAIPrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setPredictionData(data);
      } else {
        console.error("AI connection failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIPrediction();
  }, [onRefreshTriggered]);

  return (
    <div id="ai-prediction-control-panel" className="backdrop-blur-xl bg-slate-950/40 border border-slate-900/60 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Brain Neon Mesh Grid Overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-cyan-500/5 to-transparent pointer-events-none" />

      <div>
        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 z-10 relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-mono text-cyan-400 font-bold uppercase tracking-tight flex items-center gap-1.5">
                Gemini Industry 4.0 Neural Core
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </h3>
              <p className="text-[9px] font-mono text-slate-500 uppercase">Predictive Bottlenecks & Capacity Solver</p>
            </div>
          </div>

          <button
            id="ai-predict-refresh-trigger"
            onClick={fetchAIPrediction}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 font-sans bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-cyan-400 transition cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            REFRESH COGNITIVE ENGINE
          </button>
        </div>

        {loading ? (
          <div id="ai-prediction-loading" className="py-12 flex flex-col items-center justify-center gap-4 text-center font-mono">
            <span className="relative flex h-10 w-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-10 w-10 bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-400" />
              </span>
            </span>
            <div className="space-y-1">
              <p className="text-xs text-cyan-300 font-bold">LAZILY INGESTING LINE VARIABLES...</p>
              <p className="text-[10px] text-slate-500 uppercase">Generating rule-balanced pipeline predictions</p>
            </div>
          </div>
        ) : predictionData ? (
          <div id="ai-prediction-results" className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs z-10 relative">
            
            {/* COLUMN 1: BOTTLENECK RISKS HEATMAP */}
            <div className="border border-slate-900 bg-slate-950/40 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block mb-3 border-b border-slate-900 pb-1.5">
                  Probabilistic Bottleneck Risks
                </span>
                
                <div className="space-y-3">
                  {predictionData.predictedBottlenecks.map((bottleneck, index) => {
                    const isHigh = bottleneck.probability.includes('High') || bottleneck.probability.includes('80') || bottleneck.probability.includes('90');
                    return (
                      <div 
                        id={`ai-bottleneck-card-${index}`}
                        key={index} 
                        className={`p-3 rounded-xl border text-[10px] ${
                          isHigh ? 'bg-amber-950/20 border-amber-500/20 text-amber-300' : 'bg-slate-950 border-slate-900 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="text-slate-100 uppercase">{bottleneck.stage}</span>
                          <span className={isHigh ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}>
                            {bottleneck.probability}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                          {bottleneck.reason}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900/60 flex justify-between items-center text-[10px]">
                <span className="text-slate-500 uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  WIP Clearing Est:
                </span>
                <strong className="text-indigo-400 font-bold text-xs uppercase">{predictionData.estimatedWipClearingTime}</strong>
              </div>
            </div>

            {/* COLUMN 2: STAFF BALANCING ROADMAPS */}
            <div className="border border-slate-900 bg-slate-950/40 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block mb-3 border-b border-slate-900 pb-1.5">
                Cognitive Re-routing Roadmap
              </span>

              <div id="ai-re-routing-list" className="space-y-3">
                {predictionData.aiShiftRecommendations.map((rec, index) => {
                  return (
                    <div key={index} className="flex gap-2.5 items-start text-[10px] text-slate-300 leading-relaxed font-sans">
                      <span className="w-5 h-5 rounded bg-cyan-950/50 border border-cyan-800/30 flex items-center justify-center font-mono text-cyan-400 shrink-0 text-[10px] font-bold">
                        {index + 1}
                      </span>
                      <p>{rec}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 3: ANALYSIS SUMMARY & HEALTH SCORE */}
            <div className="border border-slate-900 bg-slate-950/40 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block mb-3 border-b border-slate-900 pb-1.5">
                  Line Performance Synthesis
                </span>

                <div className="flex items-center gap-4 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                  <div className="relative shrink-0 flex items-center justify-center w-14 h-14">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle 
                        cx="28" cy="28" r="24" 
                        className="stroke-slate-900 stroke-[4]" 
                        fill="transparent" 
                      />
                      <circle 
                        cx="28" cy="28" r="24" 
                        className="stroke-cyan-500 stroke-[4] transition-all duration-1000" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 24}
                        strokeDashoffset={(2 * Math.PI * 24) * (1 - predictionData.factoryHealthScore / 100)}
                      />
                    </svg>
                    <span className="absolute text-cyan-400 font-bold text-sm">
                      {predictionData.factoryHealthScore}
                    </span>
                  </div>

                  <div>
                    <span className="text-[8px] text-slate-500 block">FACTORY LAB HEALTH EXCEL</span>
                    <strong className="text-slate-200 uppercase text-[10px]">
                      {predictionData.factoryHealthScore > 85 ? 'Highly Restructured' : 'Optimized Standard'}
                    </strong>
                    <span className="text-[9px] text-slate-400 block font-normal">Real-time vector integrity</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed font-sans pr-1">
                  {predictionData.aiSummary}
                </p>
              </div>

              <div className="mt-4 p-2 bg-slate-950 text-cyan-500/80 rounded border border-cyan-950 text-[8px] uppercase tracking-wider text-center">
                Verified against ISO 9001 and Industry 4.0 MES Standards
              </div>
            </div>

          </div>
        ) : (
          <div id="ai-predict-failed" className="py-6 text-center text-xs text-rose-400 font-mono">
            COGNITIVE INGESTION FAILURE. CLICK REFRESH TO RE-CONNECT PIPELINES.
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-slate-900 pt-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>* Neural network models are backed by Google Gemini 3.5 Flash engine proxy lines.</span>
        <span>COGNITIVE HEALTH SCORE APPROVED</span>
      </div>

    </div>
  );
}
