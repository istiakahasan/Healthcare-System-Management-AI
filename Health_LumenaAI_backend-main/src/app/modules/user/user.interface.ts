import { ServiceCategory } from "@prisma/client";

export interface UserUpdatePayload {
  firstName: string;
  lastName: string;
  profileImage: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface CreateReviewPayload {
  rating: number;
  comment: string;
  staffId: string;
  careType: ServiceCategory;
}
