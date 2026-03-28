import { useEffect, useState } from "react";
import AdminBreadcrumb from "./AdminBreadcrumb";
import AdminLayout from "./AdminLayout";
import api from "../services/api";
import type { Product } from "../types";
import { useNotify } from "../context/NotifyContext";
import { resolveAssetUrl } from "../utils/assetUrl";
import {
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPES,
  productImages,
  productPriceParts,
} from "../utils/products";

const PRODUCT_TYPE_OPTIONS = [
  PRODUCT_TYPES.PRINT,
  PRODUCT_TYPES.FILAMENT,
  PRODUCT_TYPES.OTHER,
] as const;

const DISCOUNT_MIN = 0;
const DISCOUNT_MAX = 90;
const PRICE_MIN = 0;
const STOCK_MIN = 0;

export default function AdminProducts() {
  const { notifyError, notifySuccess } = useNotify();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [productType, setProductType] = useState<string>(PRODUCT_TYPES.PRINT);
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [fileFile, setFileFile] = useState<File | null>(null);
  const [price, setPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [trackInventory, setTrackInventory] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [nameEdits, setNameEdits] = useState<Record<string, string>>({});
  const [descriptionEdits, setDescriptionEdits] = useState<
    Record<string, string>
  >({});
  const [categoryEdits, setCategoryEdits] = useState<Record<string, string>>(
    {},
  );
  const [typeEdits, setTypeEdits] = useState<Record<string, string>>({});
  const [priceEdits, setPriceEdits] = useState<Record<string, number>>({});
  const [discountEdits, setDiscountEdits] = useState<Record<string, number>>(
    {},
  );
  const [trackInventoryEdits, setTrackInventoryEdits] = useState<
    Record<string, boolean>
  >({});
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [isActiveEdits, setIsActiveEdits] = useState<Record<string, boolean>>(
    {},
  );
  const [imagesEdits, setImagesEdits] = useState<Record<string, string>>({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products?includeInactive=true");
      const nextProducts = Array.isArray(res.data) ? res.data : [];
      setProducts(nextProducts);

      const nextNameEdits: Record<string, string> = {};
      const nextDescriptionEdits: Record<string, string> = {};
      const nextCategoryEdits: Record<string, string> = {};
      const nextTypeEdits: Record<string, string> = {};
      const nextPriceEdits: Record<string, number> = {};
      const nextDiscountEdits: Record<string, number> = {};
      const nextTrackInventoryEdits: Record<string, boolean> = {};
      const nextStockEdits: Record<string, number> = {};
      const nextIsActiveEdits: Record<string, boolean> = {};
      const nextImagesEdits: Record<string, string> = {};

      nextProducts.forEach((prod: Product) => {
        nextNameEdits[prod.id] = prod.name;
        nextDescriptionEdits[prod.id] = prod.description || "";
        nextCategoryEdits[prod.id] = prod.category;
        nextTypeEdits[prod.id] = prod.productType || PRODUCT_TYPES.PRINT;
        nextPriceEdits[prod.id] = prod.price;
        nextDiscountEdits[prod.id] = prod.discountPercentage || 0;
        nextTrackInventoryEdits[prod.id] = prod.trackInventory ?? false;
        nextStockEdits[prod.id] = prod.stockQuantity ?? 0;
        nextIsActiveEdits[prod.id] = prod.isActive ?? true;
        nextImagesEdits[prod.id] = productImages(prod).join("\n");
      });

      setNameEdits(nextNameEdits);
      setDescriptionEdits(nextDescriptionEdits);
      setCategoryEdits(nextCategoryEdits);
      setTypeEdits(nextTypeEdits);
      setPriceEdits(nextPriceEdits);
      setDiscountEdits(nextDiscountEdits);
      setTrackInventoryEdits(nextTrackInventoryEdits);
      setStockEdits(nextStockEdits);
      setIsActiveEdits(nextIsActiveEdits);
      setImagesEdits(nextImagesEdits);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getApiErrorMessage = (err: unknown, fallback: string): string => {
    const maybeMessage = (err as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
      return maybeMessage;
    }
    return fallback;
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData);
      if (res?.data?.url) {
        urls.push(res.data.url);
      }
    }
    return urls;
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (price < PRICE_MIN) {
      notifyError("Price cannot be negative.");
      return;
    }

    if (
      discountPercentage < DISCOUNT_MIN ||
      discountPercentage > DISCOUNT_MAX
    ) {
      notifyError(
        `Discount must be between ${DISCOUNT_MIN} and ${DISCOUNT_MAX}.`,
      );
      return;
    }

    if (stockQuantity < STOCK_MIN) {
      notifyError("Stock cannot be negative.");
      return;
    }

    try {
      let imageUrls: string[] = [];
      let fileUrl = "";

      if (imageFiles.length > 0) {
        imageUrls = await uploadFiles(imageFiles);
      }

      if (fileFile) {
        const formData = new FormData();
        formData.append("file", fileFile);
        const res = await api.post("/upload", formData);
        fileUrl = res.data.url;
      }

      await api.post("/products", {
        name,
        category,
        productType,
        description,
        imageUrl: imageUrls[0] || "",
        images: imageUrls,
        fileUrl,
        price,
        discountPercentage,
        trackInventory,
        stockQuantity: trackInventory ? stockQuantity : 0,
        isActive,
      });
      setName("");
      setCategory("");
      setProductType(PRODUCT_TYPES.PRINT);
      setDescription("");
      setImageFiles([]);
      setFileFile(null);
      setPrice(0);
      setDiscountPercentage(0);
      setTrackInventory(false);
      setStockQuantity(0);
      setIsActive(true);
      fetchProducts();
      notifySuccess("Product created.");
    } catch (err) {
      console.error(err);
      notifyError(
        getApiErrorMessage(
          err,
          "Could not create product. Ensure you are admin.",
        ),
      );
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
    const nextDescription = (descriptionEdits[id] || "").trim();
    const nextCategory = (categoryEdits[id] || "").trim();
    const nextType = (typeEdits[id] || PRODUCT_TYPES.PRINT).trim() as
      | "print"
      | "filament"
      | "other";
    const nextPrice = priceEdits[id] ?? 0;
    const nextDiscount = discountEdits[id] ?? 0;
    const nextTrackInventory = trackInventoryEdits[id] ?? false;
    const nextStock = stockEdits[id] ?? 0;
    const nextIsActive = isActiveEdits[id] ?? true;
    const nextImages = (imagesEdits[id] || "")
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => !!url);

    if (!nextName || !nextCategory) {
      notifyError("Name and category are required.");
      return;
    }

    if (nextPrice < 0) {
      notifyError("Price cannot be negative.");
      return;
    }

    if (nextDiscount < DISCOUNT_MIN || nextDiscount > DISCOUNT_MAX) {
      notifyError(
        `Discount must be between ${DISCOUNT_MIN} and ${DISCOUNT_MAX}.`,
      );
      return;
    }

    if (nextStock < STOCK_MIN) {
      notifyError("Stock cannot be negative.");
      return;
    }

    setSavingId(id);
    try {
      const payload = {
        name: nextName,
        description: nextDescription,
        category: nextCategory,
        productType: nextType,
        imageUrl: nextImages[0] || existing.imageUrl,
        images: nextImages,
        fileUrl: existing.fileUrl || "",
        price: nextPrice,
        discountPercentage: nextDiscount,
        trackInventory: nextTrackInventory,
        stockQuantity: nextTrackInventory ? nextStock : 0,
        isActive: nextIsActive,
      };

      await api.put(`/products/${id}`, payload);

      setProducts((prev) =>
        prev.map((prod) =>
          prod.id === id
            ? {
                ...prod,
                ...payload,
              }
            : prod,
        ),
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
          <span className="font-semibold">Product Type</span>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="admin-field"
          >
            {PRODUCT_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {PRODUCT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-label col-span-full">
          <span className="font-semibold">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the product"
            className="admin-textarea"
          />
        </label>
        <label className="admin-label">
          <span className="font-semibold">Product Images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
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
        <label className="admin-label">
          <span className="font-semibold">Discount (%)</span>
          <input
            type="number"
            min={DISCOUNT_MIN}
            max={DISCOUNT_MAX}
            step="1"
            value={discountPercentage}
            onChange={(e) =>
              setDiscountPercentage(parseFloat(e.target.value) || 0)
            }
            placeholder="0"
            className="admin-field"
          />
        </label>
        <label className="admin-label">
          <span className="font-semibold">Track Inventory</span>
          <select
            value={trackInventory ? "true" : "false"}
            onChange={(e) => setTrackInventory(e.target.value === "true")}
            className="admin-field"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label className="admin-label">
          <span className="font-semibold">Stock Quantity</span>
          <input
            type="number"
            min={STOCK_MIN}
            step="1"
            value={stockQuantity}
            onChange={(e) =>
              setStockQuantity(parseInt(e.target.value, 10) || 0)
            }
            disabled={!trackInventory}
            placeholder="0"
            className="admin-field"
          />
        </label>
        <label className="admin-label">
          <span className="font-semibold">Active</span>
          <select
            value={isActive ? "true" : "false"}
            onChange={(e) => setIsActive(e.target.value === "true")}
            className="admin-field"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <button type="submit" className="admin-btn admin-btn-primary">
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
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Images</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Track</th>
                <th>Stock</th>
                <th>Final</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr
                  key={prod.id}
                  className={!isActiveEdits[prod.id] ? "opacity-60" : ""}
                >
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
                    <select
                      className="admin-field"
                      value={typeEdits[prod.id] ?? PRODUCT_TYPES.PRINT}
                      onChange={(e) =>
                        setTypeEdits((prev) => ({
                          ...prev,
                          [prod.id]: e.target.value,
                        }))
                      }
                    >
                      {PRODUCT_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {PRODUCT_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
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
                    <textarea
                      rows={3}
                      className="admin-textarea"
                      value={descriptionEdits[prod.id] ?? ""}
                      onChange={(e) =>
                        setDescriptionEdits((prev) => ({
                          ...prev,
                          [prod.id]: e.target.value,
                        }))
                      }
                    />
                  </td>
                  <td>
                    <textarea
                      rows={3}
                      className="admin-textarea"
                      value={imagesEdits[prod.id] ?? ""}
                      onChange={(e) =>
                        setImagesEdits((prev) => ({
                          ...prev,
                          [prod.id]: e.target.value,
                        }))
                      }
                      placeholder="One image URL per line"
                    />
                    {productImages(prod)[0] && (
                      <a
                        href={resolveAssetUrl(productImages(prod)[0])}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs font-semibold text-teal-700 hover:underline"
                      >
                        Preview
                      </a>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      min={PRICE_MIN}
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
                    <input
                      type="number"
                      min={DISCOUNT_MIN}
                      max={DISCOUNT_MAX}
                      step="1"
                      className="admin-field w-24"
                      value={discountEdits[prod.id] ?? 0}
                      onChange={(e) =>
                        setDiscountEdits((prev) => ({
                          ...prev,
                          [prod.id]: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="admin-field"
                      value={trackInventoryEdits[prod.id] ? "true" : "false"}
                      onChange={(e) =>
                        setTrackInventoryEdits((prev) => ({
                          ...prev,
                          [prod.id]: e.target.value === "true",
                        }))
                      }
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={STOCK_MIN}
                      step="1"
                      className="admin-field w-24"
                      value={stockEdits[prod.id] ?? 0}
                      disabled={!trackInventoryEdits[prod.id]}
                      onChange={(e) =>
                        setStockEdits((prev) => ({
                          ...prev,
                          [prod.id]: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                    />
                  </td>
                  <td className="font-semibold text-[#1b2b25]">
                    EUR
                    {productPriceParts({
                      ...prod,
                      price: priceEdits[prod.id] ?? 0,
                      discountPercentage: discountEdits[prod.id] ?? 0,
                    }).current.toFixed(2)}
                  </td>
                  <td>
                    <select
                      className="admin-field"
                      value={isActiveEdits[prod.id] ? "true" : "false"}
                      onChange={(e) =>
                        setIsActiveEdits((prev) => ({
                          ...prev,
                          [prod.id]: e.target.value === "true",
                        }))
                      }
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
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
