import {
  CreditCard,
  Hash,
  Image as ImageIcon,
  Layers,
  Palette,
  Trash2,
} from "lucide-react";
import type { CartItem, Filament } from "../../types";
import { resolveAssetUrl } from "../../utils/assetUrl";

interface CartItemsSectionProps {
  cart: CartItem[];
  filaments: Filament[];
  materials: string[];
  t: (key: string) => string;
  onRemoveItem: (itemId: string) => void;
  onUpdate: (
    itemId: string,
    field: "material" | "color" | "count",
    value: string | number,
  ) => void;
}

export default function CartItemsSection({
  cart,
  filaments,
  materials,
  t,
  onRemoveItem,
  onUpdate,
}: CartItemsSectionProps) {
  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-6 uppercase tracking-wider text-sm">
          {t("cart.review")}
        </h3>
        <div className="space-y-6">
          {cart.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-gray-50 rounded-2xl border border-gray-200"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="bg-white w-full md:w-32 h-32 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={resolveAssetUrl(item.imageUrl)}
                      alt={item.productName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <ImageIcon className="text-gray-300" size={32} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{item.productName}</h4>
                      <p className="text-emerald-600 font-bold">€{item.price.toFixed(2)} / unit</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                        <Layers size={12} /> {t("cart.material")}
                      </label>
                      <select
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                        value={item.material}
                        onChange={(e) => onUpdate(item.id, "material", e.target.value)}
                      >
                        {materials.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                        <Palette size={12} /> {t("cart.color")}
                      </label>
                      <select
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                        value={item.color}
                        onChange={(e) => onUpdate(item.id, "color", e.target.value)}
                      >
                        {filaments
                          .filter((f) => f.material === item.material)
                          .map((f) => (
                            <option key={f.id} value={f.color}>
                              {f.color}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                        <Hash size={12} /> {t("cart.quantity")}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm"
                        value={item.count}
                        onChange={(e) =>
                          onUpdate(
                            item.id,
                            "count",
                            Math.min(100, parseInt(e.target.value, 10) || 1),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-6 uppercase tracking-wider text-sm">
          {t("cart.paymentMethod")}
        </h3>
        <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-emerald-500 text-white">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{t("cart.paymentOnline")}</p>
            <p className="text-xs text-gray-500">{t("cart.paymentOptions")}</p>
          </div>
        </div>
      </div>
    </>
  );
}
