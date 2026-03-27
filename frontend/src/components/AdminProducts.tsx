import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import AdminBreadcrumb from "./AdminBreadcrumb";
import api from "../services/api";
import type { Product } from "../types";
import { useNotify } from "../context/NotifyContext";

export default function AdminProducts() {
  const { notifyError, notifySuccess } = useNotify();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileFile, setFileFile] = useState<File | null>(null);
  const [price, setPrice] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      setProducts(res.data);
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

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <AdminBreadcrumb
          title="Product Catalog Admin"
          items={[
            { label: "Admin", to: "/admin" },
            { label: "Products" },
          ]}
        />

        <form
          onSubmit={addProduct}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
        >
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-semibold">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Name"
              className="border rounded-xl p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-semibold">Category</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              className="border rounded-xl p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-semibold">Product Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="border rounded-xl p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700 col-span-full sm:col-span-2">
            <span className="font-semibold">Model File</span>
            <input
              type="file"
              onChange={(e) => setFileFile(e.target.files?.[0] || null)}
              className="border rounded-xl p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-semibold">Price</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              required
              placeholder="Price"
              className="border rounded-xl p-2"
            />
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl"
          >
            Add Product
          </button>
        </form>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr
                    key={prod.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{prod.name}</td>
                    <td className="px-4 py-3">{prod.category}</td>
                    <td className="px-4 py-3">€{prod.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteProduct(prod.id)}
                        className="text-sm text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
