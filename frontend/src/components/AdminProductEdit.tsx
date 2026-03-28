import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
const STOCK_MIN = 0;

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notifyError, notifySuccess } = useNotify();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [productType, setProductType] = useState<string>(PRODUCT_TYPES.PRINT);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [trackInventory, setTrackInventory] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imagesText, setImagesText] = useState("");
  const [imageDraft, setImageDraft] = useState("");

  const getApiErrorMessage = (err: unknown, fallback: string): string => {
    const maybeMessage = (err as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;
    if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
      return maybeMessage;
    }
    return fallback;
  };

  const editedImages = useMemo(
    () =>
      imagesText
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => !!url),
    [imagesText],
  );

  const finalPrice = useMemo(
    () =>
      productPriceParts({
        ...(product || ({} as Product)),
        price,
        discountPercentage,
      } as Product).current,
    [product, price, discountPercentage],
  );

  useEffect(() => {
    if (!id) {
      notifyError("Missing product id.");
      navigate("/admin/products");
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}?includeInactive=true`);
        const next = res.data as Product;

        setProduct(next);
        setName(next.name || "");
        setCategory(next.category || "");
        setProductType(next.productType || PRODUCT_TYPES.PRINT);
        setDescription(next.description || "");
        setPrice(next.price || 0);
        setDiscountPercentage(next.discountPercentage || 0);
        setTrackInventory(next.trackInventory ?? false);
        setStockQuantity(next.stockQuantity ?? 0);
        setIsActive(next.isActive ?? true);
        setImagesText(productImages(next).join("\n"));
      } catch (err) {
        console.error(err);
        notifyError(getApiErrorMessage(err, "Could not load product."));
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate, notifyError]);

  const addImage = () => {
    const next = imageDraft.trim();
    if (!next) return;
    setImagesText((prev) =>
      Array.from(
        new Set([
          ...prev
            .split("\n")
            .map((url) => url.trim())
            .filter((url) => !!url),
          next,
        ]),
      ).join("\n"),
    );
    setImageDraft("");
  };

  const removeImage = (index: number) => {
    const next = editedImages.filter((_, i) => i !== index);
    setImagesText(next.join("\n"));
  };

  const onSave = async () => {
    if (!id || !product) return;

    const nextName = name.trim();
    const nextCategory = category.trim();
    const nextDescription = description.trim();

    if (!nextName || !nextCategory) {
      notifyError("Name and category are required.");
      return;
    }

    if (price < 0) {
      notifyError("Price cannot be negative.");
      return;
    }

    if (discountPercentage < DISCOUNT_MIN || discountPercentage > DISCOUNT_MAX) {
      notifyError(
        `Discount must be between ${DISCOUNT_MIN} and ${DISCOUNT_MAX}.`,
      );
      return;
    }

    if (stockQuantity < STOCK_MIN) {
      notifyError("Stock cannot be negative.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: nextName,
        description: nextDescription,
        category: nextCategory,
        productType,
        imageUrl: editedImages[0] || product.imageUrl,
        images: editedImages,
        fileUrl: product.fileUrl || "",
        price,
        discountPercentage,
        trackInventory,
        stockQuantity: trackInventory ? stockQuantity : 0,
        isActive,
      };

      await api.put(`/products/${id}`, payload);
      notifySuccess("Product updated.");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      notifyError(getApiErrorMessage(err, "Could not update product."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminBreadcrumb
          title="Edit Product"
          items={[
            { label: "Admin", to: "/admin" },
            { label: "Products", to: "/admin/products" },
            { label: "Loading..." },
          ]}
        />
        <p className="admin-note">Loading product...</p>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <AdminBreadcrumb
          title="Edit Product"
          items={[
            { label: "Admin", to: "/admin" },
            { label: "Products", to: "/admin/products" },
            { label: "Missing" },
          ]}
        />
        <p className="admin-note">Product not found.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminBreadcrumb
        title="Edit Product"
        items={[
          { label: "Admin", to: "/admin" },
          { label: "Products", to: "/admin/products" },
          { label: product.name || "Edit" },
        ]}
      />

      <div className="admin-panel p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1b2b25]">{product.name}</h2>
          <Link to="/admin/products" className="admin-btn">
            Back to list
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label className="admin-label">
            <span className="font-semibold">Name</span>
            <input
              className="admin-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="admin-label">
            <span className="font-semibold">Category</span>
            <input
              className="admin-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>

          <label className="admin-label">
            <span className="font-semibold">Product Type</span>
            <select
              className="admin-field"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
            >
              {PRODUCT_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {PRODUCT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-label">
            <span className="font-semibold">Active</span>
            <select
              className="admin-field"
              value={isActive ? "true" : "false"}
              onChange={(e) => setIsActive(e.target.value === "true")}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="admin-label lg:col-span-2">
            <span className="font-semibold">Description</span>
            <textarea
              rows={4}
              className="admin-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <label className="admin-label">
            <span className="font-semibold">Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="admin-field"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            />
          </label>

          <label className="admin-label">
            <span className="font-semibold">Discount (%)</span>
            <input
              type="number"
              min={DISCOUNT_MIN}
              max={DISCOUNT_MAX}
              step="1"
              className="admin-field"
              value={discountPercentage}
              onChange={(e) =>
                setDiscountPercentage(parseFloat(e.target.value) || 0)
              }
            />
          </label>

          <label className="admin-label">
            <span className="font-semibold">Track Inventory</span>
            <select
              className="admin-field"
              value={trackInventory ? "true" : "false"}
              onChange={(e) => setTrackInventory(e.target.value === "true")}
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
              className="admin-field"
              value={stockQuantity}
              disabled={!trackInventory}
              onChange={(e) =>
                setStockQuantity(parseInt(e.target.value, 10) || 0)
              }
            />
          </label>

          <div className="admin-label">
            <span className="font-semibold">Final Price</span>
            <div className="admin-field flex items-center font-bold text-[#1b2b25]">
              EUR {finalPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-4 admin-label">
          <span className="font-semibold">Images</span>

          <div className="flex gap-2">
            <input
              className="admin-field"
              placeholder="Paste image URL and click Add"
              value={imageDraft}
              onChange={(e) => setImageDraft(e.target.value)}
            />
            <button type="button" className="admin-btn" onClick={addImage}>
              Add
            </button>
          </div>

          <textarea
            rows={4}
            className="admin-textarea mt-2"
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            placeholder="One image URL per line"
          />

          {editedImages.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
              {editedImages.map((url, index) => (
                <div
                  key={`${product.id}-image-${index}`}
                  className="rounded-lg border border-[#dce8e2] bg-white p-2"
                >
                  <a
                    href={resolveAssetUrl(url)}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={resolveAssetUrl(url)}
                      alt={`${product.name} image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border border-[#e7efeb]"
                    />
                  </a>
                  <p className="mt-2 text-[10px] text-[#60736d] break-all">{url}</p>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger mt-2 w-full"
                    onClick={() => removeImage(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#60736d] mt-2">
              No images configured for this product yet.
            </p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="admin-btn admin-btn-primary"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
          <Link to="/admin/products" className="admin-btn">
            Cancel
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
