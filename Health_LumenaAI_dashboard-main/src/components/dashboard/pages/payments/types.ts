export interface StaffReport {
  id: number;
  staff: string;
  date: string;
  summary: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Cancelled' | 'Disputed';
  rawReport?: string;
  aiSummary?: string;
  adminNotes?: string;
}

export type ReportStatus = StaffReport['status'];
export type TabValue = 'Active' | 'Completed' | 'Cancelled' | 'Disputed';