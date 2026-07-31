/* eslint-disable @typescript-eslint/no-unused-vars */
interface CarePlanData {
  patientName: string;
  planType: string;
  duration: string;
  startDate: string;
  daysOfWeek: string[];
  shifts: string[];
  serviceCategories: string[];
  careGoals: string[];
  supportActivities: string[];
}

interface CarePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: CarePlanData;
}