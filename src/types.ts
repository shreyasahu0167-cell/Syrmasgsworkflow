export type Stage = 'IGI' | 'SMT' | 'MI' | 'BLT' | 'FATP' | 'SHIPMENT';

export interface StageDetail {
  entryTime: string | null;
  exitTime: string | null;
  completedBoards: number;
  durationMinutes: number;
}

export interface Workorder {
  id: string; // Workorder number e.g., WO-2026-6081
  productName: string;
  sku: string;
  totalQty: number;
  completedQty: number; // Boards completed in the CURRENT stage
  currentStage: Stage;
  status: 'pending' | 'running' | 'delayed' | 'completed';
  responsiblePerson: string;
  specialistPerson: string;
  targetShipDate: string;
  delayMinutes: number;
  priority: 'high' | 'medium' | 'low';
  stageDetails: Record<Stage, StageDetail>;
  isStuck: boolean;
  historyLogs: {
    timestamp: string;
    action: string;
    stage: Stage;
    operator: string;
  }[];
}

export interface ManpowerAllocation {
  stage: Stage;
  total: number;
  active: number;
  idle: number;
  utilization: number; // calculated percent
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  stage: Stage;
  workorderId: string;
  message: string;
  resolved: boolean;
}

export interface LiveMetrics {
  runningCount: number;
  delayedCount: number;
  completedTodayCount: number;
  factoryEfficiency: number;
  onTimeDeliveryPercent: number;
  wipCount: number;
}
