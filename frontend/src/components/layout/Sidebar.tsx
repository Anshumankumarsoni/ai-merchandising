import { cn } from "@/utils";
import {
  BarChart2,
  Bot,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/ai-tools", icon: Bot, label: "AI Tools" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-800">
        <ShoppingBag className="w-7 h-7 text-indigo-400" />
        <span className="font-bold text-lg leading-tight">AI Merch</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User / logout */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="mb-2 px-2">
          <p className="text-xs font-medium text-white truncate">{user?.full_name || user?.email}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
