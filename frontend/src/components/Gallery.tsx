import { useState, useEffect } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import { useI18n } from "../i18n/I18nContext";
import { useNotify } from "../context/NotifyContext";
import {
  PRODUCT_DEFAULT_FILTERS,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_TYPES,
} from "../utils/products";
import GalleryFilters from "./gallery/GalleryFilters";
import GalleryProductCard from "./gallery/GalleryProductCard";
import AddedToCartToast from "./gallery/AddedToCartToast";

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
    { value: PRODUCT_TYPES.PRINT, label: typeLabel(PRODUCT_TYPES.PRINT) },
    {
      value: PRODUCT_TYPES.FILAMENT,
      label: typeLabel(PRODUCT_TYPES.FILAMENT),
    },
    { value: PRODUCT_TYPES.OTHER, label: typeLabel(PRODUCT_TYPES.OTHER) },
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
    if (pendingAddIds.has(product.id)) return;

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

      <header className="site-page-hero reveal-soft">
        <div className="site-page-hero-card reveal-up">
          <h1 className="site-page-hero-title">{t("gallery.catalogTitle")}</h1>
          <p className="site-page-hero-subtitle">{t("gallery.catalogSubtitle")}</p>
        </div>
      </header>

      <main className="site-main px-4 sm:px-6 py-12 flex-grow w-full reveal-up stagger-1">
        <GalleryFilters
          search={search}
          setSearch={setSearch}
          activeType={activeType}
          setActiveType={setActiveType}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          sort={sort}
          setSort={setSort}
          discountOnly={discountOnly}
          setDiscountOnly={setDiscountOnly}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          categories={categories}
          productTypes={productTypes}
          sortOptions={sortOptions}
          allFilterValue={ALL_FILTER_VALUE}
          itemCount={items.length}
          t={t}
        />

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
              {items.map((item) => (
                <GalleryProductCard
                  key={item.id}
                  item={item}
                  isAdded={addedItemId === item.id}
                  isAdding={pendingAddIds.has(item.id)}
                  typeLabel={typeLabel}
                  t={t}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {items.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[2rem] border border-dashed border-[#d9e8e2]">
                <ImageIcon size={64} className="mx-auto mb-4 text-gray-200" />
                <h3 className="text-xl font-bold text-[#1b2c27]">
                  {t("gallery.noProductsTitle")}
                </h3>
                <p className="text-[#6b7f79] mt-2">{t("gallery.noProductsDesc")}</p>
              </div>
            )}
          </>
        )}
      </main>

      <AddedToCartToast
        visible={!!addedItemId}
        text={t("gallery.viewInCart")}
        onClick={() => navigate("/cart")}
      />

      <Footer />
    </div>
  );
}
