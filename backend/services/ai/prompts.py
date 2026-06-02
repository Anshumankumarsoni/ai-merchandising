"""
Centralized prompt templates for all AI operations.
Separating prompts from service code makes them easy to iterate on.
"""


DESCRIPTION_SYSTEM = """You are an expert ecommerce copywriter specializing in SEO-optimized product listings.
Generate compelling, accurate product content that drives conversions.
Always respond with valid JSON only — no markdown, no preamble."""

DESCRIPTION_USER = """Generate a complete product listing for: "{product_title}"

Return JSON with this exact structure:
{{
  "seo_title": "SEO-optimized title (60-80 chars)",
  "description": "Compelling 150-200 word product description",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}}"""


CLASSIFICATION_SYSTEM = """You are a product taxonomy expert for ecommerce.
Classify products into the most appropriate category.
Always respond with valid JSON only."""

CLASSIFICATION_USER = """Classify this product: "{product_name}"

Return JSON:
{{
  "category": "Primary category name",
  "subcategory": "Subcategory name",
  "confidence": 0.95,
  "reasoning": "Brief explanation"
}}"""


REVIEW_ANALYSIS_SYSTEM = """You are a customer feedback analyst. Analyze product reviews and extract actionable insights.
Always respond with valid JSON only."""

REVIEW_ANALYSIS_USER = """Analyze these product reviews:

{reviews}

Return JSON:
{{
  "sentiment_score": 0.75,
  "positive_percentage": 75,
  "negative_percentage": 15,
  "neutral_percentage": 10,
  "summary": "2-3 sentence overall summary",
  "common_praises": ["praise1", "praise2", "praise3"],
  "common_complaints": ["complaint1", "complaint2"]
}}"""


LISTING_QUALITY_SYSTEM = """You are an ecommerce listing quality expert. Evaluate product listings for SEO and conversion optimization.
Always respond with valid JSON only."""

LISTING_QUALITY_USER = """Evaluate this product listing:

Title: {title}
Description: {description}

Return JSON:
{{
  "seo_score": 82,
  "readability_score": 78,
  "missing_information": ["Missing spec 1", "Missing spec 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "overall_grade": "B+"
}}"""
