export interface FacebookGroup {
  id: string;
  name: string;
  url: string;
  category: "discussion" | "marketplace";
  memberCount?: string;
  isActive: boolean;
  shift: "all" | "morning" | "evening";
  lastStatus?: "success" | "pending_approval" | "error" | "ready";
  lastPostedAt?: string;
  postNote?: string;
}

export interface ScheduleConfig {
  morningShiftTime: string; // "08:45"
  eveningShiftTime: string; // "19:30"
  randomOffsetMinutes: number; // 15 mins (+/- 15 mins)
  minDelaySeconds: number; // 240s (4 mins)
  maxDelaySeconds: number; // 480s (8 mins)
  typingDelayMinMs: number; // 60ms
  typingDelayMaxMs: number; // 160ms
  autoScrollBeforePost: boolean;
  stealthModeEnabled: boolean;
  emergencyStopOnWarning: boolean;
  activeShifts: {
    morning: boolean;
    evening: boolean;
  };
}

export interface PostCampaign {
  rawContent: string;
  spintaxContent: string;
  images: string[];
  selectedGroupIds: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "delay";
  groupName?: string;
  message: string;
}

export interface EngineState {
  status: "idle" | "running" | "paused" | "cooling_down" | "completed";
  currentGroupIndex: number;
  totalGroups: number;
  currentGroupName: string;
  countdownSeconds: number;
  progressPercent: number;
  currentVariation: string;
}
