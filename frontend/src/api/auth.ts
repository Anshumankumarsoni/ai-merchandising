import { AuthTokens, LoginPayload, RegisterPayload, User } from "@/types/auth";
import apiClient from "./client";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens>("/auth/login/", payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthTokens>("/auth/register/", payload).then((r) => r.data),

  logout: (refresh: string) =>
    apiClient.post("/auth/logout/", { refresh }).then((r) => r.data),

  me: () => apiClient.get<User>("/auth/me/").then((r) => r.data),

  updateMe: (data: Partial<User>) =>
    apiClient.patch<User>("/auth/me/", data).then((r) => r.data),

  changePassword: (old_password: string, new_password: string) =>
    apiClient.post("/auth/change-password/", { old_password, new_password }),
};
