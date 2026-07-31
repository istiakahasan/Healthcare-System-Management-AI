import { GenderEnum } from '@prisma/client'; // Make sure this enum is exported by Prisma

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  age: string; 
  gender: GenderEnum; 
  allergies?: string[]; // Prisma defaults to [""], but client can omit or send array
  medicalHistory?: string;
  notes?: string;
  // Risk & preferences
  riskFactors?: string[];
  preferences?: string[];
  // Ownership
  customerId: string; // Required in payload (you validate it)
  isSelfPatient: boolean; // Not in DB, but used to decide selfCustomerId vs customerId

  // Address (optional, handled separately)
  useDifferentAddress?: boolean;
  address?: {
    city?: string;
    state?: string;
    postcode?: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}
export type PatientUpdatePayload = {
  firstName: string;
  lastName: string;
  age: string; // string to allow formats like "38" or "2 years"
  gender: "MALE" | "FEMALE" | "OTHER";
  allergies: string;
  medicalHistory: string;
  notes: string;
  isSelfPatient: boolean;
  city: string;
  postcode: string;
  state: string;
  country: string;
  riskFactors: string[]; // array of risk factors
};
