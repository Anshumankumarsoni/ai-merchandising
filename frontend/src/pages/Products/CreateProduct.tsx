import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProductForm } from "@/components/shared/ProductForm";
import { useCreateProduct } from "@/hooks/useProducts";
import { CreateProductPayload } from "@/types/product";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreateProduct() {
  const navigate = useNavigate();
  const createMutation = useCreateProduct();

  const handleSubmit = (data: CreateProductPayload) => {
    createMutation.mutate(data, {
      onSuccess: (product) => navigate(`/products/${product.id}`),
    });
  };

  return (
    <PageWrapper title="Create Product">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">New Product</h2>

          {createMutation.isError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              Failed to create product. Please check your inputs and try again.
            </div>
          )}

          <ProductForm
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending}
            submitLabel="Create Product"
          />
        </div>
      </div>
    </PageWrapper>
  );
}
