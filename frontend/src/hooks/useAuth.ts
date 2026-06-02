import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { LoginPayload, RegisterPayload } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.access, data.refresh);
      navigate("/dashboard");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.access, data.refresh);
      navigate("/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => {
      const refresh = localStorage.getItem("refresh_token") ?? "";
      return authApi.logout(refresh);
    },
    onSettled: () => {
      clearAuth();
      qc.clear();
      navigate("/login");
    },
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
