export type UserRole = "admin" | "manager" | "analyst";

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  password: string;
  password_confirm: string;
}
