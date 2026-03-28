import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import {
  Loader2,
  ImageIcon,
  Check,
  ShoppingCart,
  Search,
  SlidersHorizontal,
  Layers,
  Box,
} from "lucide-react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { useI18n } from "../i18n/I18nContext";
import Footer from "./Footer";
import { useNotify } from "../context/NotifyContext";
import { resolveAssetUrl } from "../utils/assetUrl";
import {
  PRODUCT_DEFAULT_FILTERS,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_TYPES,
  productImages,
  productInventoryParts,
  productPriceParts,
} from "../utils/products";

const ALL_FILTER_VALUE = "all";
const DEFAULT_CART_MATERIAL = "PLA";
const DEFAULT_CART_COLOR = "Black";

function mapSortToApi(sort: string): {
  sortBy: string;
  sortDir: "asc" | "desc";
} {
  switch (sort) {
    case PRODUCT_SORT_OPTIONS.PRICE_ASC:
      return { sortBy: "price", sortDir: "asc" };
    case PRODUCT_SORT_OPTIONS.PRICE_DESC:
      return { sortBy: "price", sortDir: "desc" };
    case PRODUCT_SORT_OPTIONS.NAME_ASC:
      return { sortBy: "name", sortDir: "asc" };
    case PRODUCT_SORT_OPTIONS.DISCOUNT_DESC:
      return { sortBy: "discount", sortDir: "desc" };
    default:
      return { sortBy: "newest", sortDir: "desc" };
  }
}

export default function Gallery() {
  const { t } = useI18n();
  const { notifyError } = useNotify();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(
    PRODUCT_DEFAULT_FILTERS.CATEGORY,
  );
  const [activeType, setActiveType] = useState<string>(
    PRODUCT_DEFAULT_FILTERS.TYPE,
  );
  const [search, setSearch] = useState<string>(PRODUCT_DEFAULT_FILTERS.SEARCH);
  const [discountOnly, setDiscountOnly] = useState<boolean>(
    PRODUCT_DEFAULT_FILTERS.DISCOUNT_ONLY,
  );
  const [inStockOnly, setInStockOnly] = useState<boolean>(
    PRODUCT_DEFAULT_FILTERS.IN_STOCK_ONLY,
  );
  const [sort, setSort] = useState<string>(PRODUCT_DEFAULT_FILTERS.SORT);
  const [loading, setLoading] = useState(true);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [pendingAddIds, setPendingAddIds] = useState<Set<string>>(new Set());

  const typeLabel = (type: string) => {
    if (type === PRODUCT_TYPES.FILAMENT) return t("gallery.typeFilament");
    if (type === PRODUCT_TYPES.OTHER) return t("gallery.typeOther");
    return t("gallery.typePrint");
  };

  const productTypes = [
    { value: ALL_FILTER_VALUE, label: t("gallery.typeAll") },
    {
      value: PRODUCT_TYPES.PRINT,
      label: typeLabel(PRODUCT_TYPES.PRINT),
    },
    {
      value: PRODUCT_TYPES.FILAMENT,
      label: typeLabel(PRODUCT_TYPES.FILAMENT),
    },
    {
      value: PRODUCT_TYPES.OTHER,
      label: typeLabel(PRODUCT_TYPES.OTHER),
    },
  ];

  const sortOptions = [
    { value: PRODUCT_SORT_OPTIONS.NEWEST, label: t("gallery.sortNewest") },
    {
      value: PRODUCT_SORT_OPTIONS.PRICE_ASC,
      label: t("gallery.sortPriceLowHigh"),
    },
    {
      value: PRODUCT_SORT_OPTIONS.PRICE_DESC,
      label: t("gallery.sortPriceHighLow"),
    },
    { value: PRODUCT_SORT_OPTIONS.NAME_ASC, label: t("gallery.sortName") },
    {
      value: PRODUCT_SORT_OPTIONS.DISCOUNT_DESC,
      label: t("gallery.sortDiscountHigh"),
    },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/products/categories");
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load product categories", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const sortMapping = mapSortToApi(sort);

        const params = new URLSearchParams();
        if (activeCategory !== ALL_FILTER_VALUE)
          params.set("category", activeCategory);
        if (activeType !== ALL_FILTER_VALUE)
          params.set("productType", activeType);
        if (search.trim()) params.set("q", search.trim());
        if (discountOnly) params.set("discountedOnly", "true");
        if (inStockOnly) params.set("inStockOnly", "true");
        params.set("sortBy", sortMapping.sortBy);
        params.set("sortDir", sortMapping.sortDir);

        const queryString = params.toString();
        const endpoint = queryString ? `/products?${queryString}` : "/products";
        const res = await api.get(endpoint);
        setItems(res.data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, activeType, search, discountOnly, inStockOnly, sort]);

  const handleAddToCart = async (product: Product) => {
    if (pendingAddIds.has(product.id)) {
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      notifyError(t("gallery.loginFirst"));
      navigate("/login");
      return;
    }

    try {
      setPendingAddIds((prev) => new Set(prev).add(product.id));
      await addToCart(product.id, 1, DEFAULT_CART_MATERIAL, DEFAULT_CART_COLOR);

      setAddedItemId(product.id);
      setTimeout(() => setAddedItemId(null), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      notifyError(t("gallery.addFailed"));
    } finally {
      setPendingAddIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  return (
    <div className="site-shell flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <header className="site-page-hero reveal-soft">
        <div className="site-page-hero-card reveal-up">
          <h1 className="site-page-hero-title">{t("gallery.catalogTitle")}</h1>
          <p className="site-page-hero-subtitle">
            {t("gallery.catalogSubtitle")}
          </p>
        </div>
      </header>

      <main className="site-main px-4 sm:px-6 py-12 flex-grow w-full reveal-up stagger-1">
        <div className="site-card reveal-up stagger-2 mb-8 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <label className="lg:col-span-2 flex items-center gap-2 rounded-xl border border-[#d8e6df] bg-white px-3">
              <Search size={16} className="text-[#5f726c]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("gallery.searchPlaceholder")}
                className="w-full py-2.5 bg-transparent outline-none text-sm"
              />
            </label>

            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value)}
              className="rounded-xl border border-[#d8e6df] bg-white px-3 py-2.5 text-sm"
            >
              {productTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="rounded-xl border border-[#d8e6df] bg-white px-3 py-2.5 text-sm"
            >
              <option value={ALL_FILTER_VALUE}>
                {t("gallery.categoryAll")}
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-[#d8e6df] bg-white px-3 py-2.5 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-[#445852]">
              <input
                type="checkbox"
                checked={discountOnly}
                onChange={(e) => setDiscountOnly(e.target.checked)}
                className="h-4 w-4 rounded border-[#c8dbd2]"
              />
              {t("gallery.discountedOnly")}
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-[#445852]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-[#c8dbd2]"
              />
              {t("gallery.inStockOnly")}
            </label>

            <span className="text-xs uppercase tracking-widest text-[#6c817a] flex items-center gap-1 whitespace-nowrap">
              <SlidersHorizontal size={12} />
              {items.length} {t("gallery.itemsLabel")}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
            <p className="text-gray-400 font-medium tracking-wide uppercase text-xs">
              {t("gallery.loading")}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => {
                const isAdded = addedItemId === item.id;
                const isAdding = pendingAddIds.has(item.id);
                const images = productImages(item);
                const leadImage = images[0] || "";
                const priceParts = productPriceParts(item);
                const inventory = productInventoryParts(item);

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col reveal-up stagger-3"
                  >
                    <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-[#eef3f1] shadow-sm border border-[#dbe8e2] transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-emerald-900/10 group-hover:-translate-y-1.5">
                      {leadImage ? (
                        <>
                          <img
                            src={resolveAssetUrl(leadImage)}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-35"
                          />
                          <img
                            src={resolveAssetUrl(leadImage)}
                            alt={item.name}
                            className="relative z-10 w-full h-full object-contain"
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <Box size={40} className="text-gray-300" />
                        </div>
                      )}

                      {priceParts.hasDiscount && (
                        <div className="absolute top-3 left-3 rounded-full bg-rose-600 text-white text-xs font-black px-3 py-1">
                          -{Math.round(priceParts.discountPercentage)}%
                        </div>
                      )}

                      {images.length > 1 && (
                        <div className="absolute top-3 right-3 rounded-full bg-black/60 text-white text-[10px] font-bold px-2 py-1 inline-flex items-center gap-1">
                          <Layers size={12} /> {images.length}
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#103a2e]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <Link
                          to={`/products/${item.id}`}
                          className="w-full mb-2 py-2 rounded-xl font-bold text-sm bg-white/90 text-[#103328] text-center hover:bg-white"
                        >
                          {t("gallery.viewDetails")}
                        </Link>
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={isAdded || isAdding}
                          className={`w-full py-3 rounded-xl font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex items-center justify-center gap-2 ${
                            isAdded || isAdding
                              ? "bg-emerald-500 text-white translate-y-0"
                              : "bg-white text-[#103328] hover:bg-emerald-50 active:scale-95"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check size={18} /> {t("gallery.added")}
                            </>
                          ) : isAdding ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />{" "}
                              {t("gallery.adding")}
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={18} />{" "}
                              {t("gallery.addToCart")}
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 px-1">
                      <div className="flex items-start justify-between mb-1 gap-3">
                        <h3 className="font-black text-[#1b2c27] text-lg tracking-tight uppercase truncate">
                          {item.name}
                        </h3>
                        <div className="text-right">
                          <span className="text-[#0f766e] font-black text-lg ml-2">
                            €{priceParts.current.toFixed(2)}
                          </span>
                          {priceParts.hasDiscount && (
                            <p className="text-xs text-gray-400 line-through">
                              €{priceParts.original.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600 flex-wrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          {item.category}
                        </p>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          {typeLabel(item.productType || PRODUCT_TYPES.PRINT)}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${
                            inventory.trackInventory
                              ? inventory.inStock
                                ? "text-emerald-700"
                                : "text-rose-700"
                              : "text-slate-600"
                          }`}
                        >
                          {inventory.trackInventory
                            ? inventory.inStock
                              ? `${t("gallery.stockIn")} ${inventory.stockQuantity}`
                              : t("gallery.stockOut")
                            : t("gallery.madeToOrder")}
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-2 text-sm text-[#60736d] line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[2rem] border border-dashed border-[#d9e8e2]">
                <ImageIcon size={64} className="mx-auto mb-4 text-gray-200" />
                <h3 className="text-xl font-bold text-[#1b2c27]">
                  {t("gallery.noProductsTitle")}
                </h3>
                <p className="text-[#6b7f79] mt-2">
                  {t("gallery.noProductsDesc")}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Cart Notification */}
      {addedItemId && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <button
            onClick={() => navigate("/cart")}
            className="bg-[#133827] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-400/30"
          >
            <ShoppingCart size={20} className="text-emerald-400" />
            <span className="font-bold text-sm">{t("gallery.viewInCart")}</span>
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
