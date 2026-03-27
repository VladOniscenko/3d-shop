import { useEffect, useState } from "react";
import AdminBreadcrumb from "./AdminBreadcrumb";
import AdminLayout from "./AdminLayout";
import api from "../services/api";
import type { Product } from "../types";
import { useNotify } from "../context/NotifyContext";
import { resolveAssetUrl } from "../utils/assetUrl";

export default function AdminProducts() {
  const { notifyError, notifySuccess } = useNotify();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileFile, setFileFile] = useState<File | null>(null);
  const [price, setPrice] = useState(0);
  const [nameEdits, setNameEdits] = useState<Record<string, string>>({});
  const [categoryEdits, setCategoryEdits] = useState<Record<string, string>>({});
  const [priceEdits, setPriceEdits] = useState<Record<string, number>>({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      const nextProducts = Array.isArray(res.data) ? res.data : [];
      setProducts(nextProducts);

      const nextNameEdits: Record<string, string> = {};
      const nextCategoryEdits: Record<string, string> = {};
      const nextPriceEdits: Record<string, number> = {};
      nextProducts.forEach((prod: Product) => {
        nextNameEdits[prod.id] = prod.name;
        nextCategoryEdits[prod.id] = prod.category;
        nextPriceEdits[prod.id] = prod.price;
      });

      setNameEdits(nextNameEdits);
      setCategoryEdits(nextCategoryEdits);
      setPriceEdits(nextPriceEdits);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = "";
    let fileUrl = "";

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const res = await api.post("/upload", formData);
      imageUrl = res.data.url;
    }

    if (fileFile) {
      const formData = new FormData();
      formData.append("file", fileFile);
      const res = await api.post("/upload", formData);
      fileUrl = res.data.url;
    }

    try {
      await api.post("/products", { name, category, imageUrl, fileUrl, price });
      setName("");
      setCategory("");
      setImageFile(null);
      setFileFile(null);
      setPrice(0);
      fetchProducts();
      notifySuccess("Product created.");
    } catch (err) {
      console.error(err);
      notifyError("Could not create product. Ensure you are admin.");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?") || !id) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
      notifySuccess("Product deleted.");
    } catch (err) {
      console.error(err);
      notifyError("Could not delete product.");
    }
  };

  const updateProduct = async (id: string) => {
    const existing = products.find((prod) => prod.id === id);
    if (!existing) {
      notifyError("Product not found.");
      return;
    }

    const nextName = (nameEdits[id] || "").trim();
    const nextCategory = (categoryEdits[id] || "").trim();
    const nextPrice = priceEdits[id] ?? 0;

    if (!nextName || !nextCategory) {
      notifyError("Name and category are required.");
      return;
    }

    if (nextPrice < 0) {
      notifyError("Price cannot be negative.");
      return;
    }

    setSavingId(id);
    try {
      const payload: Product = {
        ...existing,
        name: nextName,
        category: nextCategory,
        imageUrl: existing.imageUrl,
        fileUrl: existing.fileUrl,
        price: nextPrice,
      };
      await api.put(`/products/${id}`, payload);

      setProducts((prev) =>
        prev.map((prod) => (prod.id === id ? payload : prod)),
      );
      notifySuccess("Product updated.");
    } catch (err) {
      console.error(err);
      notifyError("Could not update product.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout>
        <AdminBreadcrumb
          title="Product Catalog Admin"
          items={[{ label: "Admin", to: "/admin" }, { label: "Products" }]}
        />

        <form
          onSubmit={addProduct}
          className="admin-panel grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 p-4"
        >
          <label className="admin-label">
            <span className="font-semibold">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Name"
              className="admin-field"
            />
          </label>
          <label className="admin-label">
            <span className="font-semibold">Category</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              className="admin-field"
            />
          </label>
          <label className="admin-label">
            <span className="font-semibold">Product Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="admin-field"
            />
          </label>
          <label className="admin-label col-span-full sm:col-span-2">
            <span className="font-semibold">Model File</span>
            <input
              type="file"
              onChange={(e) => setFileFile(e.target.files?.[0] || null)}
              className="admin-field"
            />
          </label>
          <label className="admin-label">
            <span className="font-semibold">Price</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              required
              placeholder="Price"
              className="admin-field"
            />
          </label>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
          >
            Add Product
          </button>
        </form>

        {loading ? (
          <p className="admin-note">Loading products...</p>
        ) : (
          <div className="admin-panel admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Image URL</th>
                  <th>Model URL</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <input
                        className="admin-field"
                        value={nameEdits[prod.id] ?? ""}
                        onChange={(e) =>
                          setNameEdits((prev) => ({
                            ...prev,
                            [prod.id]: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="admin-field"
                        value={categoryEdits[prod.id] ?? ""}
                        onChange={(e) =>
                          setCategoryEdits((prev) => ({
                            ...prev,
                            [prod.id]: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td>
                      {prod.imageUrl ? (
                        <a
                          href={resolveAssetUrl(prod.imageUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-xs font-semibold text-teal-700 hover:underline"
                        >
                          Preview
                        </a>
                      ) : (
                        <span className="text-xs text-[#60736d]">No image URL</span>
                      )}
                    </td>
                    <td>
                      {prod.fileUrl ? (
                        <a
                          href={resolveAssetUrl(prod.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-xs font-semibold text-teal-700 hover:underline"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="text-xs text-[#60736d]">No model URL</span>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="admin-field w-32"
                        value={priceEdits[prod.id] ?? 0}
                        onChange={(e) =>
                          setPriceEdits((prev) => ({
                            ...prev,
                            [prod.id]: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateProduct(prod.id)}
                          disabled={savingId === prod.id}
                          className="admin-btn admin-btn-primary"
                        >
                          {savingId === prod.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => deleteProduct(prod.id)}
                          disabled={savingId === prod.id}
                          className="admin-btn admin-btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && products.length === 0 && (
              <p className="admin-empty">No products found.</p>
            )}
          </div>
        )}
    </AdminLayout>
  );
}
