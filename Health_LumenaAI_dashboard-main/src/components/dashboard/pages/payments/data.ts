import { StaffReport, TabValue } from "./types";

export const staffReportsData: StaffReport[] = [
  {
    id: 1,
    staff: "Sarah Mitchell",
    date: "Sep 30, 2024",
    summary: "Provided mobility assistance and medication support.",
    status: "Active",
    rawReport:
      "Today I assisted the client with morning personal care routines including showering and dressing. Administered prescribed medications at 9:00 AM as scheduled. Provided mobility support for a walk around the neighborhood. Client was in good spirits and cooperative throughout the session.",
    aiSummary: "Provided mobility assistance and medication support",
    adminNotes:
      "Today I assisted the client with morning personal care routines including showering and dressing",
  },
  {
    id: 2,
    staff: "Sarah Mitchell",
    date: "Sep 27, 2024",
    summary: "Completed personal care and meal preparation tasks.",
    status: "Active",
    rawReport:
      "Completed morning care routine including bathing and grooming. Prepared breakfast consisting of oatmeal and fruit. Client ate well and participated in light exercises. No concerns noted during shift.",
    aiSummary: "Completed personal care and meal preparation tasks",
    adminNotes: "Completed morning care routine including bathing and grooming",
  },
  {
    id: 3,
    staff: "Sarah Mitchell",
    date: "Sep 28, 2024",
    summary: "Completed personal care and meal preparation tasks.",
    status: "Pending",
    rawReport:
      "Assisted with personal hygiene and dressing. Made lunch and helped client eat. Client seemed tired but responsive. Vital signs checked and recorded.",
    aiSummary: "Completed personal care and meal preparation tasks",
    adminNotes: "Assisted with personal hygiene and dressing",
  },
  {
    id: 4,
    staff: "Sarah Mitchell",
    date: "Sep 27, 2024",
    summary: "Completed personal care and meal preparation tasks.",
    status: "Pending",
    rawReport:
      "Morning shift included full personal care, medication administration, and meal preparation. Client participated in physical therapy exercises.",
    aiSummary: "Completed personal care and meal preparation tasks",
    adminNotes: "Morning shift included full personal care",
  },
  {
    id: 5,
    staff: "Sarah Mitchell",
    date: "Sep 27, 2024",
    summary: "Completed personal care and meal preparation tasks.",
    status: "Active",
    rawReport:
      "Engaged client in conversation and activities. Assisted with light housekeeping and prepared dinner. Client was in good mood and alert.",
    aiSummary: "Completed personal care and meal preparation tasks",
    adminNotes: "Engaged client in conversation and activities",
  },
  {
    id: 6,
    staff: "Sarah Mitchell",
    date: "Sep 27, 2024",
    summary: "Completed personal care and meal preparation tasks.",
    status: "Pending",
    rawReport:
      "All care activities completed as scheduled. Client was comfortable and satisfied with services provided.",
    aiSummary: "Completed personal care and meal preparation tasks",
    adminNotes: "All care activities completed as scheduled",
  },
  {
    id: 7,
    staff: "Sarah Mitchell",
    date: "Sep 27, 2024",
    summary: "Completed personal care and meal preparation tasks.",
    status: "Active",
    rawReport:
      "Completed full shift with no issues. Client mobility improved with assistance. All tasks documented properly.",
    aiSummary: "Completed personal care and meal preparation tasks",
    adminNotes: "Completed full shift with no issues",
  },
  {
    id: 8,
    staff: "Sarah Mitchell",
    date: "Sep 27, 2024",
    summary: "Completed personal care and meal preparation tasks.",
    status: "Pending",
    rawReport:
      "Morning medications given on time. Personal care completed. Client participated in scheduled activities.",
    aiSummary: "Completed personal care and meal preparation tasks",
    adminNotes: "Morning medications given on time",
  },
];

export const completedReports: StaffReport[] = [
  {
    id: 9,
    staff: "Emily Roberts",
    date: "Sep 25, 2024",
    summary: "Successfully completed all scheduled care tasks.",
    status: "Completed",
    rawReport:
      "All care activities completed as scheduled. Client was comfortable and satisfied with services provided. Documentation updated.",
    aiSummary: "Successfully completed all scheduled care tasks",
    adminNotes: "All care activities completed as scheduled",
  },
];

export const cancelledReports: StaffReport[] = [
  {
    id: 10,
    staff: "Robert Taylor",
    date: "Sep 22, 2024",
    summary: "Shift cancelled due to client unavailability.",
    status: "Cancelled",
    rawReport:
      "Client was not available for scheduled shift. Family notified staff of cancellation.",
    aiSummary: "Shift cancelled due to client unavailability",
    adminNotes: "Client was not available for scheduled shift",
  },
];

export const disputedReports: StaffReport[] = [
  {
    id: 11,
    staff: "Christopher Lee",
    date: "Sep 20, 2024",
    summary: "Hours worked dispute - under review.",
    status: "Disputed",
    rawReport:
      "Discrepancy in reported hours versus scheduled hours. Investigation in progress.",
    aiSummary: "Hours worked dispute - under review",
    adminNotes: "Discrepancy in reported hours versus scheduled hours",
  },
];

export const getDataByTab = (tab: TabValue): StaffReport[] => {
  switch (tab) {
    case "Completed":
      return completedReports;
    case "Cancelled":
      return cancelledReports;
    case "Disputed":
      return disputedReports;
    default:
      return staffReportsData;
  }
};
