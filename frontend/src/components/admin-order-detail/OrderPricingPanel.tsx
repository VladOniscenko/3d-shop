import type { Dispatch, SetStateAction } from "react";
import type { Order } from "../../types";
import { resolveAssetUrl } from "../../utils/assetUrl";

interface OrderPricingPanelProps {
  order: Order;
  itemPrices: Record<string, number>;
  setItemPrices: Dispatch<SetStateAction<Record<string, number>>>;
  savingItemId: string | null;
  updateItemPrice: (itemId: string, price: number) => Promise<void>;
  deliveryPrice: number;
  setDeliveryPrice: Dispatch<SetStateAction<number>>;
  savingDelivery: boolean;
  updateDeliveryPrice: (price: number) => Promise<void>;
  orderDiscountAmount: number;
  setOrderDiscountAmount: Dispatch<SetStateAction<number>>;
  savingOrderDiscount: boolean;
  updateOrderDiscount: (discount: number) => Promise<void>;
  subtotal: number;
  totalPrice: number;
  pricingLocked: boolean;
}

export default function OrderPricingPanel({
  order,
  itemPrices,
  setItemPrices,
  savingItemId,
  updateItemPrice,
  deliveryPrice,
  setDeliveryPrice,
  savingDelivery,
  updateDeliveryPrice,
  orderDiscountAmount,
  setOrderDiscountAmount,
  savingOrderDiscount,
  updateOrderDiscount,
  subtotal,
  totalPrice,
  pricingLocked,
}: OrderPricingPanelProps) {
  return (
    <article className="admin-panel p-4">
      <h2 className="font-bold mb-2 text-[#1b2b25]">Model files & specs</h2>
      {order.items.length === 0 ? (
        <p className="admin-note">No items in this order.</p>
      ) : (
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li
              key={item.id || item.fileName}
              className="rounded-lg border border-[#d9e4df] bg-[#f7fcf9] p-2"
            >
              <p className="font-semibold text-[#22342f]">
                {item.fileName ?? item.fileUrl}
              </p>
              <p className="text-xs text-[#5c716b]">
                Material: {item.material}, Color: {item.color}, Qty:{" "}
                {item.count}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[#304843]">Price: EUR</span>
                <input
                  type="number"
                  value={item.id ? itemPrices[item.id] || 0 : 0}
                  disabled={!item.id || pricingLocked}
                  onChange={(e) => {
                    if (!item.id) return;
                    const newPrice = parseFloat(e.target.value) || 0;
                    setItemPrices((prev) => ({
                      ...prev,
                      [item.id!]: newPrice,
                    }));
                  }}
                  className="admin-field w-24"
                />
                <button
                  type="button"
                  disabled={
                    !item.id || savingItemId === item.id || pricingLocked
                  }
                  onClick={() =>
                    item.id &&
                    updateItemPrice(item.id, itemPrices[item.id] || 0)
                  }
                  className="admin-btn admin-btn-primary"
                >
                  {savingItemId === item.id ? "Saving..." : "Save"}
                </button>
              </div>
              {item.fileUrl && (
                <a
                  href={resolveAssetUrl(item.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-teal-700 hover:underline"
                >
                  Download/Preview file
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex items-center justify-end gap-2">
        <span className="text-[#304843]">Delivery: EUR</span>
        <input
          type="number"
          value={deliveryPrice}
          disabled={pricingLocked}
          onChange={(e) => {
            const newPrice = parseFloat(e.target.value) || 0;
            setDeliveryPrice(newPrice);
          }}
          className="admin-field w-24"
        />
        <button
          type="button"
          disabled={savingDelivery || pricingLocked}
          onClick={() => updateDeliveryPrice(deliveryPrice)}
          className="admin-btn admin-btn-primary"
        >
          {savingDelivery ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="mt-2 flex items-center justify-end gap-2">
        <span className="text-[#304843]">Order discount: EUR</span>
        <input
          type="number"
          min="0"
          value={orderDiscountAmount}
          disabled={pricingLocked}
          onChange={(e) => {
            const newDiscount = parseFloat(e.target.value) || 0;
            setOrderDiscountAmount(newDiscount);
          }}
          className="admin-field w-24"
        />
        <button
          type="button"
          disabled={savingOrderDiscount || pricingLocked}
          onClick={() => updateOrderDiscount(orderDiscountAmount)}
          className="admin-btn admin-btn-primary"
        >
          {savingOrderDiscount ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="mt-1 text-right">
        {pricingLocked && (
          <p className="text-xs text-amber-700 mb-1">
            Pricing is locked after payment or production progress.
          </p>
        )}
        <p className="text-sm text-[#5f736d]">
          Subtotal: EUR {subtotal.toFixed(2)} | Delivery: EUR{" "}
          {deliveryPrice.toFixed(2)}| Discount: EUR{" "}
          {orderDiscountAmount.toFixed(2)}
        </p>
        <span className="font-bold">
          Total (including delivery): EUR {totalPrice.toFixed(2)}
        </span>
      </div>
    </article>
  );
}
