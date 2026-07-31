export interface ICreateChatPayload {
  receiverId: string;
  message: string;
}

export interface IChatFilters {
  receiverId?: string;
}

export interface IChatQueryParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  receiverId?: string;
}