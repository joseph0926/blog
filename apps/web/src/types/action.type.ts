export type ActionResponse<T = null> = {
  data: T | null;
  message: string;
  success: boolean;
  status: number;
};
