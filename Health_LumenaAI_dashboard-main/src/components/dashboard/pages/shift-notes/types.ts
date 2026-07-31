import { IStaffShiftNote } from "@/types/global";

export type StaffReport = IStaffShiftNote;

export type ReportStatus = StaffReport['status'];
export type TabValue = "PENDING" | "COMPLETED" | "CANCELLED" | "DISPUTED";