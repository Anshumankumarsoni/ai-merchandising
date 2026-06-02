import { aiApi } from "@/api/aiTools";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Badge } from "@/components/shared/Badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ProductForm } from "@/components/shared/ProductForm";
import { useDeleteProduct, useProduct, useUpdateInventory, useUpdateProduct } from "@/hooks/useProducts";
import { CreateProductPayload } from "@/types/product";
import { formatCurrency, formatDate } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft, Bot, Edit2, Package, RefreshCw, Save, Trash2, X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const updateMutation = useUpdateProduct(id!);
  const deleteMutation = useDeleteProduct();
  const inventoryMutation = useUpdateInventory(id!);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [changeReason, setChangeReason] = useState("");
  const [aiResult, setAiResult] = useState<string | null>(null);

  const descMutation = useMutation({
    mutationFn: () => aiApi.generateDescription(product!.name),
    onSuccess: (data) => setAiResult(JSON.stringify(data.output_data, null, 2)),
  });

  const classifyMutation = useMutation({
    mutationFn: () => aiApi.classifyProduct(product!.name),
    onSuccess: (data) => setAiResult(JSON.stringify(data.output_data, null, 2)),
  });

  if (isLoading) return <PageWrapper title="Product Detail"><LoadingSpinner /></PageWrapper>;
  if (!product) return <PageWrapper title="Not Found"><p className="text-gray-500">Product not found.</p></PageWrapper>;

  const handleUpdate = (data: CreateProductPayload) => {
    updateMutation.mutate(data, { onSuccess: () => setIsEditing(false) });
  };

  const handleDelete = () => {
    deleteMutation.mutate(id!, { onSuccess: () => navigate("/products") });
  };

  const handleInventoryUpdate = () => {
    inventoryMutation.mutate(
      { count: newCount, reason: changeReason },
      {
        onSuccess: () => {
          setShowInventoryModal(false);
          setChangeReason("");
        },
      }
    );
  };

  return (
    <PageWrapper title="Product Detail">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => { setIsEditing(true); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Save className="w-4 h-4 text-indigo-500" />
                Edit Product
              </h2>
              <ProductForm
                initialValues={{
                  sku: product.sku,
                  name: product.name,
                  description: product.description,
                  category_id: product.category?.id,
                  brand_id: product.brand?.id,
                  price: Number(product.price),
                  inventory_count: product.inventory_count,
                  marketplace: product.marketplace,
                }}
                onSubmit={handleUpdate}
                isLoading={updateMutation.isPending}
                submitLabel="Save Changes"
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                  <p className="text-sm font-mono text-gray-400 mt-0.5">{product.sku}</p>
                </div>
                <Badge
                  label={product.marketplace.charAt(0).toUpperCase() + product.marketplace.slice(1)}
                  variant="info"
                />
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-5">{product.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Price", value: formatCurrency(product.price) },
                  { label: "Category", value: product.category?.name ?? "—" },
                  { label: "Brand", value: product.brand?.name ?? "—" },
                  { label: "Created", value: formatDate(product.created_at) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Tools panel */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-500" />
              AI Tools
            </h2>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => descMutation.mutate()}
                disabled={descMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {descMutation.isPending ? "Generating…" : "Generate Description"}
              </button>
              <button
                onClick={() => classifyMutation.mutate()}
                disabled={classifyMutation.isPending}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                {classifyMutation.isPending ? "Classifying…" : "Auto-Classify"}
              </button>
            </div>
            {aiResult && (
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                {aiResult}
              </pre>
            )}
          </div>
        </div>

        {/* Sidebar: inventory */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-400" />
              Inventory
            </h3>
            <div className="text-center py-4">
              <p
                className={`text-4xl font-bold mb-1 ${
                  product.is_low_stock ? "text-red-600" : "text-green-600"
                }`}
              >
                {product.inventory_count}
              </p>
              <p className="text-xs text-gray-400">units in stock</p>
              {product.is_low_stock && (
                <p className="mt-2 text-xs font-medium text-red-500 bg-red-50 rounded-full px-3 py-1 inline-block">
                  ⚠ Low Stock
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setNewCount(product.inventory_count);
                setShowInventoryModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors mt-2"
            >
              <RefreshCw className="w-4 h-4" />
              Update Stock
            </button>
          </div>

          {/* Meta info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Meta</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created by</span>
                <span className="text-gray-800 truncate ml-2">{product.created_by_email ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Updated</span>
                <span className="text-gray-800">{formatDate(product.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Update Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowInventoryModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Update Inventory</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Count</label>
                <input
                  type="number"
                  min={0}
                  value={newCount}
                  onChange={(e) => setNewCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <input
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="e.g. Restock, Sale, Adjustment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setShowInventoryModal(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={handleInventoryUpdate}
                disabled={inventoryMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                {inventoryMutation.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={deleteMutation.isPending}
      />
    </PageWrapper>
  );
}
