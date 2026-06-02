import { authApi } from "@/api/auth";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, KeyRound, User } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, setUser } = useAuthStore();

  const [profile, setProfile] = useState({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    username: user?.username ?? "",
  });

  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const profileMutation = useMutation({
    mutationFn: (data: typeof profile) => authApi.updateMe(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      authApi.changePassword(passwords.old_password, passwords.new_password),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswords({ old_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: () => {
      setPasswordError("Current password is incorrect.");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate(profile);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwords.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    passwordMutation.mutate();
  };

  return (
    <PageWrapper title="Settings">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Profile</h2>
              <p className="text-xs text-gray-400">Update your personal information</p>
            </div>
          </div>

          {/* Role badge */}
          <div className="mb-5 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-800">{user?.email}</p>
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full capitalize">
              {user?.role}
            </span>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  value={profile.first_name}
                  onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  value={profile.last_name}
                  onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                value={profile.username}
                onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {profileSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle className="w-4 h-4" />
                Profile updated successfully!
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileMutation.isPending}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {profileMutation.isPending ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Password */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Change Password</h2>
              <p className="text-xs text-gray-400">Keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwords.old_password}
                onChange={(e) => setPasswords((p) => ({ ...p, old_password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwords.new_password}
                onChange={(e) => setPasswords((p) => ({ ...p, new_password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirm_password}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm_password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {passwordError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle className="w-4 h-4" />
                Password changed successfully!
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {passwordMutation.isPending ? "Changing…" : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
