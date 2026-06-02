import { PageWrapper } from "@/components/layout/PageWrapper";
import { Badge } from "@/components/shared/Badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useDeleteProduct, useProducts } from "@/hooks/useProducts";
import { ProductFilters } from "@/types/product";
import { formatCurrency, formatDate } from "@/utils";
import { Plus, Search, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Products() {
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, page_size: 20 });
  const [search, setSearch] = useState("");
  const { data, isLoading } = useProducts(filters);
  const deleteMutation = useDeleteProduct();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search, page: 1 }));
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) deleteMutation.mutate(id);
  };

  return (
    <PageWrapper title="Products">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or SKU…"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-lg transition-colors">
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <select
            onChange={(e) => setFilters((f) => ({ ...f, marketplace: e.target.value || undefined, page: 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
          >
            <option value="">All Marketplaces</option>
            {["amazon", "ebay", "shopify", "walmart", "etsy", "other"].map((m) => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>

          <select
            onChange={(e) => setFilters((f) => ({ ...f, ordering: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
          >
            <option value="-created_at">Newest</option>
            <option value="created_at">Oldest</option>
            <option value="price">Price ↑</option>
            <option value="-price">Price ↓</option>
            <option value="inventory_count">Stock ↑</option>
            <option value="-inventory_count">Stock ↓</option>
          </select>

          <Link
            to="/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Marketplace</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.results.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    data?.results.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{p.name}</td>
                        <td className="px-4 py-3 text-gray-600">{p.category_name ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-800">{formatCurrency(p.price)}</td>
                        <td className="px-4 py-3">
                          <Badge
                            label={String(p.inventory_count)}
                            variant={p.is_low_stock ? "danger" : "success"}
                          />
                        </td>
                        <td className="px-4 py-3 capitalize text-gray-600">{p.marketplace}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(p.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link
                              to={`/products/${p.id}`}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Page {data.current_page} of {data.total_pages} — {data.count} products
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={!data.previous}
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!data.next}
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
