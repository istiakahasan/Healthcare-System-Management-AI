export interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  totalPages?: number;
}

export enum StatusEnum {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  INACTIVE = "INACTIVE",
  DISPUTED = "DISPUTED",
  DISABLED = "DISABLED",
  DISABILITES_CARE = "DISABILITES_CARE",
  SCHEDULED = "SCHEDULED",
  ERROR = "ERROR",
  FAILED = "FAILED",
  SUCCESS = "SUCCESS",
  UNKNOWN = "UNKNOWN",

  IN_PROGRESS = "IN_PROGRESS",
}

export const enum IRole {
  ADMIN = "ADMIN",
}

export const enum IUserRole {
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
}

export const enum IGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export const enum IUserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export const enum IServiceCategory {
  DISABILITES_CARE = "DISABILITES_CARE",
  AGE_CARE = "AGE_CARE",
}

export const enum IShiftType {
  MORNING = "MORNING",
  EVENING = "EVENING",
  NIGHT = "NIGHT",
}

export const enum ICertification {
  NDIS_WORKER_SCREENING = "NDIS_WORKER_SCREENING",
  MANUAL_HANDLING = "MANUAL_HANDLING",
  MEDICATION_ADMINISTRATION = "MEDICATION_ADMINISTRATION",
}

export const enum ILanguage {
  ENGLISH = "ENGLISH",
  GREEK = "GREEK",
  SPANISH = "SPANISH",
  FRENCH = "FRENCH",
}

export interface IBaseResponse<T = void> {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: IMeta;
  data?: T;
}

export interface ChildrenProps {
  children: React.ReactNode;
}

// auth flow types

// Login Types
export interface ILoginPayload {
  email: string;
  password: string;
}

export type ILoginResponse = IBaseResponse<{ accessToken: string }>;

// Get Profile Types

export interface IAdminProfile {
  id: string;
  email: string;
  role: IRole;

  firstName: string;
  lastName: string;

  profileImage: string;

  phoneNumber: string | null;
  gender: IGender | null;
  status: "ACTIVE";
  staff: string | null;
  customer: string | null;
  address: string[];
}

export type IGetProfileResponse = IBaseResponse<IAdminProfile>;

// ===================
// Password Change Types

// Forgot types
export interface IForgotPasswordPayload {
  email: string;
}
export type IForgotPasswordResponse = IBaseResponse;

// Resend OTP
export interface IResendOTPReqBody {
  email: string;
}
// export interface IResendOTPBaseResponse {
//   success: boolean;
//   statusCode: number;
//   message: string;
// }
export type IResendOTPBaseResponse = IBaseResponse;

// Reset Password
// export interface IResetPasswordPayload {
//   newPassword: string;
//   confirmPassword: string;
// }
export interface IResetPasswordPayload {
  newPassword: string;
  confirmPassword: string;
  token: string;
}

export type IResetPasswordResponse = IBaseResponse;

// Verify OTP type
export interface IVerifyOTPPayload {
  email: string;
  otp: string;
}

export type IVerifyOTPResponse = IBaseResponse<{ accessToken: string }>;

// DASHBOARD ROUTES TYPES START

export interface IChartData {
  month: string;
  shifts: number;
}

export interface IDashboardStats {
  totalUsers: number;
  activeStaff: number;
  pendingVerifications: number;
  ongoingShifts: number;
  chartData: IChartData[];
}

export type IDashboardStatsResponse = IBaseResponse<IDashboardStats>;

// Recent Shifts & All Shifts Types
export const enum IShiftStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface IShiftsStats {
  totalShifts: number;
  assignedStaffInShift: number;
  shiftsCompletedInThisMonth: number;
  totalCancelShifts: number;
}

export interface IShift {
  id: string;
  createdAt: string;
  status: IShiftStatus;
  staff: {
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string;
  };
  customer: {
    firstName: string;
    lastName: string;
  };
  serviceCategory: IServiceCategory[];
  aiSummary: string | null;
}

export type IRecentShiftsResponse = IBaseResponse<IShift[]>;
export type IShiftsResponse = IBaseResponse<IShift[]>;
export type IShiftsStatsResponse = IBaseResponse<IShiftsStats>;

// Users Types

export interface IUsersStats {
  totalRegisteredUser: number;
  activeStaff: number;
  activeClient: number;
  lastWeekSignUp: number;
}

export type IUsersStatsResponse = IBaseResponse<IUsersStats>;

export interface IUser {
  id: string;
  about: string | null;
  canResetPassword: boolean;
  email: string;
  fcmToken: string | null;
  firstName: string;
  gender: IGender;
  isDeleted: boolean;
  isResetPassword: boolean;
  isVerified: boolean;
  isBlocked: boolean;
  lastName: string;
  phoneNumber: string;
  profileImage: string | null;
  role: IUserRole;
  status: IUserStatus;
  portalSettings: string | null;
  createdAt: string;
  updatedAt: string;
}

export type IUsersResponse = IBaseResponse<IUser[]>;

// Block user
export interface IBlockUserPayload {
  userId: string;
}

export type IBlockUserResponse = IBaseResponse;

// unblock user
export interface IUnblockUserPayload {
  userId: string;
}

export type IUnblockUserResponse = IBaseResponse;

// Care Plan Types

export const enum ICarePlanShift {
  MORNING = "MORNING",
  EVENING = "EVENING",
}

export const enum ICarePlanType {
  WEEKLY = "WEEKLY",
  DAILY = "DAILY",
}

export const enum IDayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export const enum ICarePlanStatus {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
}

export const enum ICarePlanSupportActivity {
  DAILY_LIVING_SKILLS = "DAILY_LIVING_SKILLS",
  EMPLOYMENT_SUPPORT = "EMPLOYMENT_SUPPORT",
  COMMUNITY_ACCESS = "COMMUNITY_ACCESS",
}

export interface IPatient {
  firstName: string;
  lastName: string;
  age: string;
  gender: IGender;
}

export interface ICarePlan {
  id: string;
  carePlanShift: ICarePlanShift[];
  carePlanType: ICarePlanType;
  customerId: string;
  dayOfWeek: IDayOfWeek[];
  description: string;
  durationOfWeek: number;
  patientId: string;
  patient: IPatient;
  serviceCategory: IServiceCategory[];
  startDate: string;
  status: ICarePlanStatus;
  supportActivity: ICarePlanSupportActivity[];
  isFullyStaffed: boolean;
  totalShifts: number;
  title: string;
  careGoals: string[];
  createdAt: string;
  updatedAt: string;
}

export type ICarePlanResponse = IBaseResponse<ICarePlan[]>;

// Top Rated Staff Types

export interface ITopRatedStaffDetails {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  role: IRole;
}

export interface IRatingStats {
  averageRating: number;
  totalReviews: number;
}

export interface ITopRatedStaff {
  id: string;
  staffDetails: ITopRatedStaffDetails;
  ratingStats: IRatingStats;
}

export type ITopRatedStaffResponse = IBaseResponse<ITopRatedStaff[]>;

// Pending User ------ Staff Verification Types
// export interface IPendingUser {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   profileImage: string | null;

//   status: IUserStatus;
//   createdAt?: string;
//   updatedAt?: string;
// }
export interface IPendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;

  status: IUserStatus;
  createdAt?: string;
  updatedAt?: string;

  role: string;
  isVerified: boolean;
  phoneNumber: string;
  staffId: string;

  age: number;
  availabilityHours: string;
  bio: string;

  certifications: string[];

  dayOfWeek: string[];

  endTime: string;
  experienceYears: number;
  hourlyRate: string;

  languages: string[];

  serviceCategory: string[];

  shiftType: string[];

  skills: string[];
}

export type IPendingUserResponse = IBaseResponse<{
  meta: IMeta;
  data: IPendingUser[];
}>;
export type ISinglePendingUserResponse = IBaseResponse<IPendingUser>;

// Approve staff types

// Approve staff types

export type IApproveStaffResponse = IBaseResponse;
export type IRejectStaffResponse = IBaseResponse;

// Shift Note types
export interface IStaffShiftNote {
  id: string;
  createdAt: string;
  status: string;
  aiSummary: string;
  rawNotes?: string;
  adminNote?: string;
  incident?: string;
  concern?: string;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string;
    role: string;
    isVerified: boolean;
    phoneNumber: string;
    age: number;
    availabilityHours: string;
    bio: string;
    certifications: string[];
    dayOfWeek: string[];
    endTime: string;
    experienceYears: number;
    hourlyRate: string;
    languages: string[];
    serviceCategory: string[];
    shiftType: string[];
    skills: string[];
    staffId?: string;
  };
}

export type IStaffShiftNoteResponse = IBaseResponse<{
  meta: IMeta;
  data: IStaffShiftNote[];
}>;

export interface IContactSupport {
  id: string;
  category: string;
  image: string | null;
  message: string;
  subject: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
    email: string;
  };
}

export type IContactSupportResponse = IBaseResponse<{
  data: IContactSupport[];
  meta: IMeta;
}>;

export type ISingleContactSupportResponse = IBaseResponse<IContactSupport>;

export interface IPublicContact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export type IPublicContactResponse = IBaseResponse<IPublicContact[]>;
export type ISinglePublicContactResponse = IBaseResponse<IPublicContact>;
