
export interface BugReportData {
  core_desire: string;
  defensive_behavior: string;
  fear_root: string;
  repeating_loop: string;
  primary_contradiction: string;
  diagnosis_summary: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  type: 'text' | 'bug_report';
  reportData?: BugReportData;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export enum DiagnosticState {
  IDLE = 'IDLE',
  INITIALIZING = 'INITIALIZING',
  ANALYZING = 'ANALYZING',
  REPORT_READY = 'REPORT_READY'
}
