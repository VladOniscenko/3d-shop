import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminBreadcrumb from "./AdminBreadcrumb";
import AdminLayout from "./AdminLayout";
import api from "../services/api";
import type { Product } from "../types";
import { useNotify } from "../context/NotifyContext";
import { useI18n } from "../i18n/I18nContext";
import { resolveAssetUrl } from "../utils/assetUrl";
import {
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPES,
  productImages,
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
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const getApiErrorMessage = (err: unknown, fallback: string): string => {
    const maybeMessage = (err as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
      return maybeMessage;
    }
    return fallback;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products?includeInactive=true");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      notifyError("Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

      await fetchProducts();
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

    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      await fetchProducts();
      notifySuccess("Product deleted.");
    } catch (err) {
      console.error(err);
      notifyError("Could not delete product.");
    } finally {
      setDeletingId(null);
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
          <span className="font-semibold">{t("admin.products.nameLabel")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={t("admin.products.namePlaceholder")}
            className="admin-field"
          />
        </label>
        <label className="admin-label">
          <span className="font-semibold">{t("admin.products.categoryLabel")}</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t("admin.products.categoryPlaceholder")}
            className="admin-field"
          />
        </label>
        <label className="admin-label">
          <span className="font-semibold">{t("admin.products.productTypeLabel")}</span>
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
          <span className="font-semibold">{t("admin.products.descriptionLabel")}</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t("admin.products.descriptionPlaceholder")}
            className="admin-textarea"
          />
        </label>
        <label className="admin-label">
          <span className="font-semibold">{t("admin.products.imagesLabel")}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
            className="admin-field"
          />
        </label>
        <label className="admin-label col-span-full sm:col-span-2">
          <span className="font-semibold">{t("admin.products.modelFileLabel")}</span>
          <input
            type="file"
            onChange={(e) => setFileFile(e.target.files?.[0] || null)}
            className="admin-field"
          />
        </label>
        <label className="admin-label">
          <span className="font-semibold">{t("admin.products.priceLabel")}</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            required
            placeholder={t("admin.products.pricePlaceholder")}
            className="admin-field"
          />
        </label>
        <label className="admin-label">
          <span className="font-semibold">{t("admin.products.discountLabel")}</span>
          <input
            type="number"
            min={DISCOUNT_MIN}
            max={DISCOUNT_MAX}
            step="1"
            value={discountPercentage}
            onChange={(e) =>
              setDiscountPercentage(parseFloat(e.target.value) || 0)
            }
            placeholder={t("admin.products.discountPlaceholder")}
            className="admin-field"
          />
        </label>
        <label className="admin-label">
          <span className="font-semibold">{t("admin.products.trackInventoryLabel")}</span>
          <select
            value={trackInventory ? "true" : "false"}
            onChange={(e) => setTrackInventory(e.target.value === "true")}
            className="admin-field"
          >
            <option value="true">{t("admin.products.trackInventoryYes")}</option>
            <option value="false">{t("admin.products.trackInventoryNo")}</option>
          </select>
        </label>
        <label className="admin-label">
          <span className="font-semibold">{t("admin.products.stockQuantityLabel")}</span>
          <input
            type="number"
            min={STOCK_MIN}
            step="1"
            value={stockQuantity}
            onChange={(e) =>
              setStockQuantity(parseInt(e.target.value, 10) || 0)
            }
            disabled={!trackInventory}
            placeholder={t("admin.products.stockQuantityPlaceholder")}
            className="admin-field"
          />
        </label>
        <label className="admin-label">
          <span className="font-semibold">{t("admin.products.activeLabel")}</span>
          <select
            value={isActive ? "true" : "false"}
            onChange={(e) => setIsActive(e.target.value === "true")}
            className="admin-field"
          >
            <option value="true">{t("admin.products.activeYes")}</option>
            <option value="false">{t("admin.products.activeNo")}</option>
          </select>
        </label>
        <button type="submit" className="admin-btn admin-btn-primary">
          {t("admin.products.addButton")}
        </button>
      </form>

      {loading ? (
        <p className="admin-note">{t("admin.products.loadingMessage")}</p>
      ) : (
        <div className="admin-panel p-4">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("admin.products.tablePreview")}</th>
                  <th>{t("admin.products.tableName")}</th>
                  <th>{t("admin.products.tableType")}</th>
                  <th>{t("admin.products.tableCategory")}</th>
                  <th>{t("admin.products.tablePrice")}</th>
                  <th>{t("admin.products.tableStatus")}</th>
                  <th>{t("admin.products.tableActions")}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const thumb = productImages(product)[0];
                  return (
                    <tr key={product.id}>
                      <td>
                        {thumb ? (
                          <img
                            src={resolveAssetUrl(thumb)}
                            alt={product.name}
                            className="w-16 h-16 rounded-md object-cover border border-[#ddeae3]"
                          />
                        ) : (
                          <span className="text-xs text-[#60736d]">
                            No image
                          </span>
                        )}
                      </td>
                      <td className="font-semibold">{product.name}</td>
                      <td>
                        {PRODUCT_TYPE_LABELS[
                          product.productType || PRODUCT_TYPES.PRINT
                        ] || product.productType}
                      </td>
                      <td>{product.category}</td>
                      <td>EUR {product.price.toFixed(2)}</td>
                      <td>
                        {product.isActive ? (
                          <span className="text-emerald-700 font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="text-slate-600 font-semibold">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="admin-btn admin-btn-primary"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => deleteProduct(product.id)}
                            disabled={deletingId === product.id}
                            className="admin-btn admin-btn-danger"
                          >
                            {deletingId === product.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && products.length === 0 && (
            <p className="admin-empty">{t("admin.products.noProducts")}</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
