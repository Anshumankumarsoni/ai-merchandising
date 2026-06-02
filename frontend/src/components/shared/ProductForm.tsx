import { categoriesApi, brandsApi } from "@/api/products";
import { CreateProductPayload, Marketplace } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface ProductFormProps {
  initialValues?: Partial<CreateProductPayload>;
  onSubmit: (data: CreateProductPayload) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const MARKETPLACES: { value: Marketplace; label: string }[] = [
  { value: "amazon", label: "Amazon" },
  { value: "ebay", label: "eBay" },
  { value: "shopify", label: "Shopify" },
  { value: "walmart", label: "Walmart" },
  { value: "etsy", label: "Etsy" },
  { value: "other", label: "Other" },
];

export function ProductForm({ initialValues, onSubmit, isLoading, submitLabel = "Save Product" }: ProductFormProps) {
  const [form, setForm] = useState<CreateProductPayload>({
    sku: "",
    name: "",
    description: "",
    category_id: "",
    brand_id: "",
    price: 0,
    inventory_count: 0,
    marketplace: "other",
    ...initialValues,
  });

  useEffect(() => {
    if (initialValues) setForm((f) => ({ ...f, ...initialValues }));
  }, [initialValues]);

  const { data: categoriesData } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const { data: brandsData } = useQuery({ queryKey: ["brands"], queryFn: brandsApi.list });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      category_id: form.category_id || undefined,
      brand_id: form.brand_id || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            name="sku"
            required
            value={form.sku}
            onChange={handleChange}
            placeholder="e.g. PROD-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Marketplace */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marketplace</label>
          <select
            name="marketplace"
            value={form.marketplace}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {MARKETPLACES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Product description…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category_id"
            value={form.category_id ?? ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">— None —</option>
            {categoriesData?.results.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <select
            name="brand_id"
            value={form.brand_id ?? ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">— None —</option>
            {brandsData?.results.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (USD) <span className="text-red-500">*</span>
          </label>
          <input
            name="price"
            type="number"
            required
            min={0}
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Inventory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inventory Count <span className="text-red-500">*</span>
          </label>
          <input
            name="inventory_count"
            type="number"
            required
            min={0}
            value={form.inventory_count}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          {isLoading ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
