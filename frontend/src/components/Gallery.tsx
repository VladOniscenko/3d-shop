import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import {
  Shapes,
  Wrench,
  Flower2,
  Gamepad2,
  Box,
  Loader2,
  ImageIcon,
  Check,
  ShoppingCart,
} from "lucide-react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { useI18n } from "../i18n/I18nContext";
import Footer from "./Footer";
import { useNotify } from "../context/NotifyContext";
import { resolveAssetUrl } from "../utils/assetUrl";

const getCategoryDesign = (category: string) => {
  switch (category) {
    case "Toys":
      return {
        icon: <Shapes size={40} />,
        color: "bg-blue-50",
        textColor: "text-blue-400",
      };
    case "Tools":
      return {
        icon: <Wrench size={40} />,
        color: "bg-orange-50",
        textColor: "text-orange-400",
      };
    case "Decor":
      return {
        icon: <Flower2 size={40} />,
        color: "bg-emerald-50",
        textColor: "text-emerald-400",
      };
    case "Tech":
      return {
        icon: <Gamepad2 size={40} />,
        color: "bg-indigo-50",
        textColor: "text-indigo-400",
      };
    default:
      return {
        icon: <Box size={40} />,
        color: "bg-gray-50",
        textColor: "text-gray-400",
      };
  }
};

const categories = ["All", "Toys", "Tools", "Decor", "Tech"];

export default function Gallery() {
  const { t } = useI18n();
  const { notifyError } = useNotify();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [items, setItems] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [pendingAddIds, setPendingAddIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const categoryParam = activeFilter === "All" ? "" : activeFilter;
        const res = await api.get(`/products?category=${categoryParam}`);
        setItems(res.data);
      } catch (err) {
        console.error("Failed to load gallery", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [activeFilter]);

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
      await addToCart(product.id, 1, "PLA", "Black");

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
          <h1 className="site-page-hero-title">{t("gallery.title")}</h1>
          <p className="site-page-hero-subtitle">{t("gallery.subtitle")}</p>
        </div>
      </header>

      <main className="site-main px-4 sm:px-6 py-12 flex-grow w-full reveal-up stagger-1">
        {/* Filter Navigation */}
        <div className="site-card reveal-up stagger-2 flex flex-wrap justify-center gap-2 mb-12 p-2.5 w-fit mx-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeFilter === category
                  ? "bg-[#0f766e] text-white shadow-lg shadow-emerald-900/20 scale-105"
                  : "bg-transparent text-[#5f726c] hover:text-[#1d2f28] hover:bg-[#f4faf7]"
              }`}
            >
              {category}
            </button>
          ))}
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
                const design = getCategoryDesign(item.category);
                const isAdded = addedItemId === item.id;
                const isAdding = pendingAddIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col reveal-up stagger-3"
                  >
                    <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-gray-100 shadow-sm border border-[#dbe8e2] transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-emerald-900/10 group-hover:-translate-y-1.5">
                      {item.imageUrl ? (
                        <img
                          src={resolveAssetUrl(item.imageUrl)}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center ${design.color}`}
                        >
                          <div
                            className={`${design.textColor} opacity-40 group-hover:scale-110 transition-transform duration-500`}
                          >
                            {design.icon}
                          </div>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#103a2e]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
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
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-black text-[#1b2c27] text-lg tracking-tight uppercase truncate">
                          {item.name}
                        </h3>
                        <span className="text-[#0f766e] font-black text-lg ml-2">
                          €{item.price?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[2rem] border border-dashed border-[#d9e8e2]">
                <ImageIcon size={64} className="mx-auto mb-4 text-gray-200" />
                <h3 className="text-xl font-bold text-[#1b2c27]">
                  {t("gallery.emptyTitle")}
                </h3>
                <p className="text-[#6b7f79] mt-2">{t("gallery.emptyDesc")}</p>
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
