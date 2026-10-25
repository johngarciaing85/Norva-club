import type { AdminProduct, Category } from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class AdminApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(
      res.status,
      (body as Record<string, string>).detail ?? `Error ${res.status}`,
    );
  }

  return (await res.json()) as T;
}

// ── Auth ────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<AdminUser> {
  const data = await adminFetch<{ user: AdminUser }>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.user;
}

export async function adminLogout(): Promise<void> {
  await adminFetch("/admin/auth/logout", { method: "POST" });
}

export async function adminGetMe(): Promise<AdminUser> {
  const data = await adminFetch<{ user: AdminUser }>("/admin/auth/me");
  return data.user;
}

// ── Products ────────────────────────────────────────────────────

export interface AdminProductDetail extends AdminProduct {
  sizeGuide: string | null;
  createdAt: string | null;
}

export interface AdminProductImage {
  id: string;
  url: string;
  alt: string;
  publicId?: string | null;
}

export async function adminListProducts(
  search?: string,
  status?: string,
): Promise<AdminProductDetail[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const qs = params.toString();
  const data = await adminFetch<{ products: AdminProductDetail[] }>(
    `/admin/products${qs ? `?${qs}` : ""}`,
  );
  return data.products;
}

export async function adminGetProduct(
  id: string,
): Promise<AdminProductDetail> {
  return adminFetch<AdminProductDetail>(`/admin/products/${id}`);
}

export async function adminCreateProduct(
  data: Record<string, unknown>,
): Promise<AdminProductDetail> {
  return adminFetch<AdminProductDetail>("/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateProduct(
  id: string,
  data: Record<string, unknown>,
): Promise<AdminProductDetail> {
  return adminFetch<AdminProductDetail>(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminArchiveProduct(id: string): Promise<void> {
  await adminFetch(`/admin/products/${id}`, { method: "DELETE" });
}

// ── Categories ──────────────────────────────────────────────────

export async function adminListCategories(): Promise<Category[]> {
  return adminFetch<Category[]>("/admin/categories");
}

export async function adminCreateCategory(
  data: { name: string; slug: string; description?: string; sizeType: string },
): Promise<Category> {
  return adminFetch<Category>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateCategory(
  id: string,
  data: { name?: string; slug?: string; description?: string; sizeType?: string },
): Promise<Category> {
  return adminFetch<Category>(`/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteCategory(id: string): Promise<void> {
  await adminFetch(`/admin/categories/${id}`, { method: "DELETE" });
}

// ── Sizes ──────────────────────────────────────────────────────

export interface SizeItem {
  id: string;
  label: string;
  sizeGroup: string;
  sortOrder: number;
}

export async function adminListSizes(sizeGroup?: string): Promise<SizeItem[]> {
  const qs = sizeGroup ? `?size_group=${sizeGroup}` : "";
  return adminFetch<SizeItem[]>(`/admin/sizes${qs}`);
}

export async function adminCreateSize(
  label: string,
  sizeGroup: string,
): Promise<SizeItem> {
  return adminFetch<SizeItem>("/admin/sizes", {
    method: "POST",
    body: JSON.stringify({ label, sizeGroup }),
  });
}

export async function adminDeleteSize(id: string): Promise<void> {
  await adminFetch(`/admin/sizes/${id}`, { method: "DELETE" });
}

// ── Media ───────────────────────────────────────────────────────

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function adminUploadImage(
  file: File,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/admin/media/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(
      res.status,
      (body as Record<string, string>).detail ?? `Error ${res.status}`,
    );
  }

  return (await res.json()) as UploadResult;
}

export async function adminDeleteImage(publicId: string): Promise<void> {
  await adminFetch(`/admin/media/${encodeURIComponent(publicId)}`, {
    method: "DELETE",
  });
}

export { AdminApiError };
