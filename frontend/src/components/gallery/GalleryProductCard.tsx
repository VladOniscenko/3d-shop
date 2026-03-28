import {
  Box,
  Check,
  Layers,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../types";
import { resolveAssetUrl } from "../../utils/assetUrl";
import {
  PRODUCT_TYPES,
  productImages,
  productInventoryParts,
  productPriceParts,
} from "../../utils/products";

interface GalleryProductCardProps {
  item: Product;
  isAdded: boolean;
  isAdding: boolean;
  typeLabel: (type: string) => string;
  t: (key: string) => string;
  onAddToCart: (product: Product) => void;
}

export default function GalleryProductCard({
  item,
  isAdded,
  isAdding,
  typeLabel,
  t,
  onAddToCart,
}: GalleryProductCardProps) {
  const images = productImages(item);
  const leadImage = images[0] || "";
  const priceParts = productPriceParts(item);
  const inventory = productInventoryParts(item);

  return (
    <div className="group relative flex flex-col reveal-up stagger-3">
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

        <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#103a2e]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <Link
            to={`/products/${item.id}`}
            className="w-full mb-2 py-2 rounded-xl font-bold text-sm bg-white/90 text-[#103328] text-center hover:bg-white"
          >
            {t("gallery.viewDetails")}
          </Link>
          <button
            onClick={() => onAddToCart(item)}
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
                <Loader2 size={18} className="animate-spin" /> {t("gallery.adding")}
              </>
            ) : (
              <>
                <ShoppingCart size={18} /> {t("gallery.addToCart")}
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
            <span className="text-[#0f766e] font-black text-lg ml-2">€{priceParts.current.toFixed(2)}</span>
            {priceParts.hasDiscount && (
              <p className="text-xs text-gray-400 line-through">€{priceParts.original.toFixed(2)}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 flex-wrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{item.category}</p>
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
          <p className="mt-2 text-sm text-[#60736d] line-clamp-2">{item.description}</p>
        )}
      </div>
    </div>
  );
}
