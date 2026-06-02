import { useAuthStore } from "@/store/authStore";
import { Bell } from "lucide-react";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.full_name || user?.email}</span>
        </div>
      </div>
    </header>
  );
}
