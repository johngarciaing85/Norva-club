import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.stubEnv("API_URL", "http://test-api:8000");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

async function loadClient() {
  return await import("@/lib/api/client");
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("fetchCategories", () => {
  it("returns categories on success", async () => {
    const categories = [{ id: "c1", slug: "camisetas", name: "Camisetas", description: "", sizeType: "ropa" }];
    mockFetch.mockResolvedValueOnce(jsonResponse(categories));

    const { fetchCategories } = await loadClient();
    const result = await fetchCategories();

    expect(result).toEqual(categories);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://test-api:8000/categories",
      expect.objectContaining({
        next: { revalidate: 120 },
      }),
    );
  });
});

describe("fetchProducts", () => {
  it("returns product list on success", async () => {
    const data = { products: [], total: 0, page: 1, page_size: 50 };
    mockFetch.mockResolvedValueOnce(jsonResponse(data));

    const { fetchProducts } = await loadClient();
    const result = await fetchProducts();

    expect(result).toEqual(data);
  });

  it("passes category filter", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ products: [], total: 0, page: 1, page_size: 50 }));

    const { fetchProducts } = await loadClient();
    await fetchProducts("camisetas");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("category=camisetas"),
      expect.anything(),
    );
  });
});

describe("fetchProduct", () => {
  it("returns product detail on success", async () => {
    const product = { id: "p1", slug: "test", name: "Test", sizeGuide: null };
    mockFetch.mockResolvedValueOnce(jsonResponse(product));

    const { fetchProduct } = await loadClient();
    const result = await fetchProduct("test");

    expect(result).toEqual(product);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://test-api:8000/products/test",
      expect.anything(),
    );
  });
});

describe("error handling", () => {
  it("throws ApiError on 404 with status property", async () => {
    mockFetch.mockResolvedValueOnce(new Response("Not Found", { status: 404 }));

    const { fetchProduct, ApiError } = await loadClient();

    try {
      await fetchProduct("nonexistent");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as InstanceType<typeof ApiError>).status).toBe(404);
    }
  });

  it("throws on network error", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));

    const { fetchCategories } = await loadClient();

    await expect(fetchCategories()).rejects.toThrow("fetch failed");
  });

  it("throws on timeout (abort)", async () => {
    mockFetch.mockImplementationOnce(
      () => new Promise((_, reject) => {
        setTimeout(() => reject(new DOMException("The operation was aborted.", "AbortError")), 50);
      }),
    );

    const { fetchCategories } = await loadClient();

    await expect(fetchCategories()).rejects.toThrow("aborted");
  });
});
