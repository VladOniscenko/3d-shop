import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Layers, Loader2, ShoppingCart, Tag } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../services/api";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useNotify } from "../context/NotifyContext";
import { useI18n } from "../i18n/I18nContext";
import { resolveAssetUrl } from "../utils/assetUrl";
import { formatCurrencyAmount } from "../utils/currency";
import {
  PRODUCT_TYPES,
  productImages,
  productInventoryParts,
  productPriceParts,
} from "../utils/products";

const DEFAULT_CART_MATERIAL = "PLA";
const DEFAULT_CART_COLOR = "Black";

export default function ProductDetail() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { notifyError, notifySuccess } = useNotify();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const typeLabel = (type?: string) => {
    if (type === PRODUCT_TYPES.FILAMENT) return t("gallery.typeFilament");
    if (type === PRODUCT_TYPES.OTHER) return t("gallery.typeOther");
    return t("gallery.typePrint");
  };

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data || null);
      } catch (err) {
        console.error("Failed to load product", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const images = useMemo(
    () => productImages(product || ({} as Product)),
    [product],
  );
  const activeImageUrl = images[activeImage] || "";
  const price = product ? productPriceParts(product) : null;
  const inventory = product ? productInventoryParts(product) : null;
  const isUnavailable = Boolean(
    inventory && inventory.trackInventory && !inventory.inStock,
  );

  const handleAddToCart = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");
    if (!token) {
      notifyError(t("gallery.loginFirst"));
      navigate("/login");
      return;
    }

    if (isUnavailable) {
      notifyError(t("productDetail.unavailableError"));
      return;
    }

    setAdding(true);
    try {
      await addToCart(product.id, 1, DEFAULT_CART_MATERIAL, DEFAULT_CART_COLOR);
      notifySuccess(t("productDetail.added"));
    } catch (err) {
      console.error(err);
      notifyError(t("gallery.addFailed"));
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="site-shell">
        <Navbar />
        <main className="site-main px-4 sm:px-6 py-16 flex justify-center">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="site-shell">
        <Navbar />
        <main className="site-main px-4 sm:px-6 py-16">
          <p className="text-lg font-semibold text-[#1d2f28]">
            {t("productDetail.notFound")}
          </p>
          <Link
            to="/products"
            className="text-teal-700 underline mt-2 inline-block"
          >
            {t("productDetail.backToCatalog")}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="site-shell">
      <Navbar />

      <main className="site-main px-4 sm:px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[#546962] hover:text-[#16322a]"
        >
          <ArrowLeft size={16} /> {t("productDetail.back")}
        </button>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-[#dbe8e2] bg-[#eef3f1]">
              {activeImageUrl ? (
                <>
                  <img
                    src={resolveAssetUrl(activeImageUrl)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-35"
                  />
                  <img
                    src={resolveAssetUrl(activeImageUrl)}
                    alt={product.name}
                    className="relative z-10 w-full h-full object-contain"
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                  <Layers size={36} />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border ${
                      index === activeImage
                        ? "border-emerald-600"
                        : "border-[#dbe8e2]"
                    } bg-[#eef3f1]`}
                  >
                    <img
                      src={resolveAssetUrl(image)}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-35"
                    />
                    <img
                      src={resolveAssetUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="relative z-10 w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="site-card p-6">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#5f736d]">
              <span className="rounded-full bg-[#e8f4ef] px-2 py-1">
                {product.category}
              </span>
              <span className="rounded-full bg-[#f5f7f6] px-2 py-1">
                {typeLabel(product.productType)}
              </span>
            </div>

            <h1 className="text-3xl font-black text-[#1b2c27] mt-3">
              {product.name}
            </h1>

            <div className="mt-4 flex items-end gap-3">
              <span className="text-3xl font-black text-[#0f766e]">
                {formatCurrencyAmount(price?.current || 0)}
              </span>
              {price?.hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatCurrencyAmount(price.original)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-rose-700 bg-rose-50 px-2 py-1 rounded-full">
                    <Tag size={12} /> -{Math.round(price.discountPercentage)}%
                  </span>
                </>
              )}
            </div>

            {inventory && (
              <p
                className={`mt-3 text-sm font-semibold ${
                  inventory.trackInventory
                    ? inventory.inStock
                      ? "text-emerald-700"
                      : "text-rose-700"
                    : "text-slate-700"
                }`}
              >
                {inventory.trackInventory
                  ? inventory.inStock
                    ? `${t("gallery.stockIn")} ${inventory.stockQuantity}`
                    : t("gallery.stockOut")
                  : t("gallery.madeToOrder")}
              </p>
            )}

            <p className="mt-4 text-[#4f655e] leading-relaxed">
              {product.description || t("productDetail.noDescription")}
            </p>

            {product.fileUrl && (
              <a
                href={resolveAssetUrl(product.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 text-sm text-teal-700 hover:underline"
              >
                {t("productDetail.openModelFile")}
              </a>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || isUnavailable}
                className="site-btn-primary inline-flex items-center gap-2"
              >
                {adding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ShoppingCart size={16} />
                )}
                {isUnavailable
                  ? t("productDetail.unavailable")
                  : adding
                    ? t("gallery.adding")
                    : t("gallery.addToCart")}
              </button>

              <Link to="/products" className="site-btn-soft">
                {t("productDetail.continueBrowsing")}
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
