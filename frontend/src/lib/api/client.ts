import type { Category, Product } from "@/types";

const API_URL = process.env.API_URL ?? "http://localhost:8000";
const FETCH_TIMEOUT_MS = 8000;

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, revalidate?: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      signal: controller.signal,
      next: { revalidate: revalidate ?? 60 },
    });

    if (!res.ok) {
      throw new ApiError(res.status, `API ${res.status}: ${path}`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
}

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories", 120);
}

export async function fetchProducts(
  category?: string,
  page = 1,
  pageSize = 50,
): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  params.set("page", String(page));
  params.set("page_size", String(pageSize));
  return apiFetch<ProductListResponse>(`/products?${params}`, 60);
}

export interface ProductDetail extends Product {
  sizeGuide: string | null;
}

export async function fetchProduct(slug: string): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/products/${encodeURIComponent(slug)}`, 60);
}

export { ApiError };
