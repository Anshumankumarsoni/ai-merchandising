export type AnalysisType = "description" | "classification" | "review" | "listing_quality";
export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";

export interface AIAnalysis {
  id: string;
  product: string | null;
  analysis_type: AnalysisType;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown> | null;
  status: AnalysisStatus;
  error_message: string;
  created_at: string;
  completed_at: string | null;
}

export interface DescriptionOutput {
  seo_title: string;
  description: string;
  features: string[];
  keywords: string[];
}

export interface ClassificationOutput {
  category: string;
  subcategory: string;
  confidence: number;
  reasoning: string;
}

export interface ReviewAnalysisOutput {
  sentiment_score: number;
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  summary: string;
  common_praises: string[];
  common_complaints: string[];
}

export interface ListingQualityOutput {
  seo_score: number;
  readability_score: number;
  missing_information: string[];
  suggestions: string[];
  overall_grade: string;
}

export interface DashboardStats {
  total_products: number;
  total_categories: number;
  low_stock_count: number;
  ai_generated_analyses: number;
  total_inventory_value: number;
  average_product_price: number;
}

export interface InventoryDashboard {
  low_stock_products: {
    id: string;
    sku: string;
    name: string;
    inventory_count: number;
    category__name: string | null;
  }[];
  by_category: { category__name: string; count: number; total_inventory: number }[];
  by_marketplace: { marketplace: string; count: number }[];
}
