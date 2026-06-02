import { analyticsApi } from "@/api/analytics";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatCard } from "@/components/shared/StatCard";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Bot, Package, Tag } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: analyticsApi.dashboard,
  });

  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ["inventory-dashboard"],
    queryFn: analyticsApi.inventory,
  });

  const { data: aiUsage } = useQuery({
    queryKey: ["ai-usage"],
    queryFn: analyticsApi.aiUsage,
  });

  if (statsLoading || invLoading) return <PageWrapper title="Dashboard"><LoadingSpinner /></PageWrapper>;

  return (
    <PageWrapper title="Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Products"
          value={stats?.total_products ?? 0}
          icon={Package}
          color="indigo"
          subtitle="Across all marketplaces"
        />
        <StatCard
          title="Categories"
          value={stats?.total_categories ?? 0}
          icon={Tag}
          color="green"
        />
        <StatCard
          title="Low Stock"
          value={stats?.low_stock_count ?? 0}
          icon={AlertTriangle}
          color="amber"
          subtitle="< 10 units remaining"
        />
        <StatCard
          title="AI Analyses"
          value={stats?.ai_generated_analyses ?? 0}
          icon={Bot}
          color="indigo"
          subtitle="Total completed"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Products by Category</h2>
          {inventory?.by_category?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={inventory.by_category}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category__name" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">No data yet</p>
          )}
        </div>

        {/* Marketplace distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Products by Marketplace</h2>
          {inventory?.by_marketplace?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={inventory.by_marketplace}
                  dataKey="count"
                  nameKey="marketplace"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {inventory.by_marketplace.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">No data yet</p>
          )}
        </div>
      </div>

      {/* AI usage + low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI usage */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">AI Analyses Breakdown</h2>
          {aiUsage?.by_type?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={aiUsage.by_type} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis dataKey="analysis_type" type="category" tick={{ fontSize: 11 }} tickLine={false} width={110} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#22c55e" radius={[0, 4, 4, 0]} />
                <Bar dataKey="failed" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">No AI analyses yet</p>
          )}
        </div>

        {/* Low stock table */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">⚠ Low Stock Products</h2>
          {inventory?.low_stock_products?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">SKU</th>
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inventory.low_stock_products.slice(0, 6).map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-2 font-mono text-xs text-gray-500">{p.sku}</td>
                      <td className="py-2 text-gray-800 truncate max-w-[140px]">{p.name}</td>
                      <td className="py-2 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                          {p.inventory_count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">All products well stocked 🎉</p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
