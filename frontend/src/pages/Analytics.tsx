import { analyticsApi } from "@/api/analytics";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatCard } from "@/components/shared/StatCard";
import { formatCurrency } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, BarChart2, Bot, DollarSign, Package, Tag,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316"];

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: analyticsApi.dashboard,
  });

  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ["inventory-dashboard"],
    queryFn: analyticsApi.inventory,
  });

  const { data: aiUsage, isLoading: aiLoading } = useQuery({
    queryKey: ["ai-usage"],
    queryFn: analyticsApi.aiUsage,
  });

  if (statsLoading || invLoading || aiLoading) {
    return <PageWrapper title="Analytics"><LoadingSpinner /></PageWrapper>;
  }

  return (
    <PageWrapper title="Analytics">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Products" value={stats?.total_products ?? 0} icon={Package} color="indigo" />
        <StatCard title="Categories" value={stats?.total_categories ?? 0} icon={Tag} color="green" />
        <StatCard
          title="Avg. Price"
          value={formatCurrency(stats?.average_product_price ?? 0)}
          icon={DollarSign}
          color="amber"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.low_stock_count ?? 0}
          icon={AlertTriangle}
          color="red"
          subtitle="< 10 units"
        />
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-indigo-600 text-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="w-6 h-6 text-indigo-200" />
            <span className="text-sm font-medium text-indigo-200">Total AI Analyses</span>
          </div>
          <p className="text-4xl font-bold">{stats?.ai_generated_analyses ?? 0}</p>
          <p className="text-xs text-indigo-300 mt-1">Completed analyses</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <BarChart2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-500">Inventory Value</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats?.total_inventory_value ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Estimated total value</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-500">Marketplaces</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {inventory?.by_marketplace?.length ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">Active marketplaces</p>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Products by category */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Products by Category</h2>
          <p className="text-xs text-gray-400 mb-4">Top 10 categories by product count</p>
          {inventory?.by_category?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={inventory.by_category} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category__name" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Bar dataKey="count" name="Products" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  {inventory.by_category.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
              No category data yet
            </div>
          )}
        </div>

        {/* Marketplace distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Marketplace Distribution</h2>
          <p className="text-xs text-gray-400 mb-4">Products per sales channel</p>
          {inventory?.by_marketplace?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={inventory.by_marketplace}
                  dataKey="count"
                  nameKey="marketplace"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                  }
                  labelLine={false}
                >
                  {inventory.by_marketplace.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
              No marketplace data yet
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI usage breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">AI Usage by Type</h2>
          <p className="text-xs text-gray-400 mb-4">Completed vs Failed analyses</p>
          {aiUsage?.by_type?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={aiUsage.by_type} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis
                  dataKey="analysis_type"
                  type="category"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  width={120}
                />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[0, 4, 4, 0]} stackId="a" />
                <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[0, 4, 4, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
              No AI usage data yet
            </div>
          )}
        </div>

        {/* Low stock table */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">⚠ Low Stock Alert</h2>
          <p className="text-xs text-gray-400 mb-4">Products with fewer than 10 units</p>
          {inventory?.low_stock_products?.length ? (
            <div className="overflow-y-auto max-h-[220px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-2 text-xs font-medium text-gray-500">SKU</th>
                    <th className="pb-2 text-xs font-medium text-gray-500">Name</th>
                    <th className="pb-2 text-xs font-medium text-gray-500 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inventory.low_stock_products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-1.5 font-mono text-xs text-gray-400">{p.sku}</td>
                      <td className="py-1.5 text-gray-700 truncate max-w-[140px]">{p.name}</td>
                      <td className="py-1.5 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                          {p.inventory_count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm text-green-600 font-medium">🎉 All products well stocked!</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
