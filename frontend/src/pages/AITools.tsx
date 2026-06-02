import { aiApi } from "@/api/aiTools";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AIAnalysis, DescriptionOutput, ReviewAnalysisOutput, ListingQualityOutput, ClassificationOutput } from "@/types/ai";
import { useMutation } from "@tanstack/react-query";
import { Bot, BookOpen, Star, Zap } from "lucide-react";
import { useState } from "react";

type Tool = "description" | "classify" | "reviews" | "listing";

function ResultCard({ analysis }: { analysis: AIAnalysis | null }) {
  if (!analysis) return null;

  if (analysis.status === "pending" || analysis.status === "processing") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
        <p className="text-sm text-amber-700 font-medium">⏳ Processing… Check back shortly.</p>
        <p className="text-xs text-amber-600 mt-1">Analysis ID: {analysis.id}</p>
      </div>
    );
  }

  if (analysis.status === "failed") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
        <p className="text-sm text-red-700 font-medium">Analysis failed</p>
        <p className="text-xs text-red-500 mt-1">{analysis.error_message}</p>
      </div>
    );
  }

  const out = analysis.output_data;
  if (!out) return null;

  if (analysis.analysis_type === "description") {
    const d = out as unknown as DescriptionOutput;
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mt-4 space-y-3">
        <div><p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">SEO Title</p><p className="text-sm font-medium text-gray-800">{d.seo_title}</p></div>
        <div><p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Description</p><p className="text-sm text-gray-700">{d.description}</p></div>
        <div><p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Features</p><ul className="text-sm text-gray-700 list-disc list-inside space-y-1">{d.features?.map((f, i) => <li key={i}>{f}</li>)}</ul></div>
        <div><p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Keywords</p><div className="flex flex-wrap gap-1.5">{d.keywords?.map((k, i) => <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">{k}</span>)}</div></div>
      </div>
    );
  }

  if (analysis.analysis_type === "classification") {
    const d = out as unknown as ClassificationOutput;
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-4 space-y-2">
        <div className="flex items-center gap-2"><span className="text-xs font-semibold text-green-600 uppercase">Category</span><span className="text-sm font-bold text-gray-800">{d.category}</span></div>
        <div className="flex items-center gap-2"><span className="text-xs font-semibold text-green-600 uppercase">Subcategory</span><span className="text-sm text-gray-700">{d.subcategory}</span></div>
        <div className="flex items-center gap-2"><span className="text-xs font-semibold text-green-600 uppercase">Confidence</span><span className="text-sm text-gray-700">{((d.confidence ?? 0) * 100).toFixed(0)}%</span></div>
        <p className="text-xs text-gray-500 mt-1">{d.reasoning}</p>
      </div>
    );
  }

  if (analysis.analysis_type === "review") {
    const d = out as unknown as ReviewAnalysisOutput;
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mt-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[["Positive", d.positive_percentage, "green"], ["Neutral", d.neutral_percentage, "gray"], ["Negative", d.negative_percentage, "red"]].map(([label, val, color]) => (
            <div key={String(label)} className="text-center"><p className={`text-xl font-bold text-${color}-600`}>{val}%</p><p className="text-xs text-gray-500">{label}</p></div>
          ))}
        </div>
        <p className="text-sm text-gray-700">{d.summary}</p>
        {d.common_praises?.length > 0 && <div><p className="text-xs font-semibold text-green-600 mb-1">Praises</p><ul className="text-sm text-gray-600 list-disc list-inside">{d.common_praises.map((p, i) => <li key={i}>{p}</li>)}</ul></div>}
        {d.common_complaints?.length > 0 && <div><p className="text-xs font-semibold text-red-500 mb-1">Complaints</p><ul className="text-sm text-gray-600 list-disc list-inside">{d.common_complaints.map((c, i) => <li key={i}>{c}</li>)}</ul></div>}
      </div>
    );
  }

  if (analysis.analysis_type === "listing_quality") {
    const d = out as unknown as ListingQualityOutput;
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-4 space-y-3">
        <div className="flex items-center gap-4">
          <div className="text-center"><p className="text-2xl font-bold text-indigo-600">{d.seo_score}</p><p className="text-xs text-gray-500">SEO Score</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-green-600">{d.readability_score}</p><p className="text-xs text-gray-500">Readability</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-amber-600">{d.overall_grade}</p><p className="text-xs text-gray-500">Grade</p></div>
        </div>
        {d.missing_information?.length > 0 && <div><p className="text-xs font-semibold text-red-500 mb-1">Missing</p><ul className="text-sm text-gray-600 list-disc list-inside">{d.missing_information.map((m, i) => <li key={i}>{m}</li>)}</ul></div>}
        {d.suggestions?.length > 0 && <div><p className="text-xs font-semibold text-indigo-600 mb-1">Suggestions</p><ul className="text-sm text-gray-600 list-disc list-inside">{d.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
      </div>
    );
  }

  return null;
}

export default function AITools() {
  const [activeTool, setActiveTool] = useState<Tool>("description");
  const [result, setResult] = useState<AIAnalysis | null>(null);

  // Form states
  const [productTitle, setProductTitle] = useState("");
  const [productName, setProductName] = useState("");
  const [reviews, setReviews] = useState("");
  const [listingTitle, setListingTitle] = useState("");
  const [listingDesc, setListingDesc] = useState("");

  const descMutation = useMutation({ mutationFn: () => aiApi.generateDescription(productTitle), onSuccess: setResult });
  const classifyMutation = useMutation({ mutationFn: () => aiApi.classifyProduct(productName), onSuccess: setResult });
  const reviewsMutation = useMutation({ mutationFn: () => aiApi.analyzeReviews(reviews.split("\n").filter(Boolean)), onSuccess: setResult });
  const listingMutation = useMutation({ mutationFn: () => aiApi.analyzeListingQuality(listingTitle, listingDesc), onSuccess: setResult });

  const TOOLS = [
    { id: "description" as Tool, label: "Description Generator", icon: BookOpen },
    { id: "classify" as Tool, label: "Product Classifier", icon: Zap },
    { id: "reviews" as Tool, label: "Review Analyzer", icon: Star },
    { id: "listing" as Tool, label: "Listing Quality", icon: Bot },
  ];

  const isLoading = descMutation.isPending || classifyMutation.isPending || reviewsMutation.isPending || listingMutation.isPending;

  return (
    <PageWrapper title="AI Tools">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool selector */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-fit">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Select Tool</h2>
          <div className="space-y-1">
            {TOOLS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveTool(id); setResult(null); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTool === id ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Active tool form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {activeTool === "description" && (
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">AI Description Generator</h2>
              <p className="text-sm text-gray-500 mb-4">Generate SEO-optimized titles, descriptions, and keywords.</p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
              <input value={productTitle} onChange={(e) => setProductTitle(e.target.value)} placeholder="e.g. Wireless Noise Cancelling Headphones" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4" />
              <button disabled={!productTitle || isLoading} onClick={() => descMutation.mutate()} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {isLoading ? "Generating…" : "Generate"}
              </button>
            </div>
          )}

          {activeTool === "classify" && (
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">Product Classifier</h2>
              <p className="text-sm text-gray-500 mb-4">Automatically classify products into categories.</p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Running Shoes For Men Size 10" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4" />
              <button disabled={!productName || isLoading} onClick={() => classifyMutation.mutate()} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {isLoading ? "Classifying…" : "Classify"}
              </button>
            </div>
          )}

          {activeTool === "reviews" && (
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">Review Analyzer</h2>
              <p className="text-sm text-gray-500 mb-4">Paste one review per line. Get sentiment & insights.</p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Reviews (one per line)</label>
              <textarea value={reviews} onChange={(e) => setReviews(e.target.value)} rows={6} placeholder={"Great product, fast shipping!\nBattery died after 2 weeks.\nLooks exactly like the photos."} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 resize-none" />
              <button disabled={!reviews.trim() || isLoading} onClick={() => reviewsMutation.mutate()} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {isLoading ? "Analyzing…" : "Analyze Reviews"}
              </button>
            </div>
          )}

          {activeTool === "listing" && (
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">Listing Quality Analyzer</h2>
              <p className="text-sm text-gray-500 mb-4">Get SEO score, readability, and improvement tips.</p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={listingTitle} onChange={(e) => setListingTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3" />
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={listingDesc} onChange={(e) => setListingDesc(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 resize-none" />
              <button disabled={!listingTitle || !listingDesc || isLoading} onClick={() => listingMutation.mutate()} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {isLoading ? "Analyzing…" : "Analyze Listing"}
              </button>
            </div>
          )}

          {isLoading && <LoadingSpinner className="mt-4 p-4" />}
          <ResultCard analysis={result} />
        </div>
      </div>
    </PageWrapper>
  );
}
