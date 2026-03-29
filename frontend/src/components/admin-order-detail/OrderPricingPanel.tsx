import type { Dispatch, SetStateAction } from "react";
import type { Order } from "../../types";
import { resolveAssetUrl } from "../../utils/assetUrl";
import { CURRENCY_CODE, formatCurrencyAmount } from "../../utils/currency";

interface OrderPricingPanelProps {
  order: Order;
  t: (key: string) => string;
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
  t,
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
      <h2 className="font-bold mb-2 text-[#1b2b25]">
        {t("admin.orderDetail.modelFilesTitle")}
      </h2>
      {order.items.length === 0 ? (
        <p className="admin-note">{t("admin.orderDetail.noItemsMessage")}</p>
      ) : (
        <div className="space-y-5">
          {order.items.map((item, idx) => (
            <div
              key={item.id || item.fileName}
              className="rounded-xl border border-[#d9e4df] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header with item number */}
              <div className="bg-gradient-to-r from-[#eef4f1] to-[#f7fcf9] px-5 py-3 border-b border-[#d9e4df]">
                <h3 className="font-bold text-[#1b2b25] text-sm">
                  {t("admin.orderDetail.itemLabel")} #{idx + 1}
                </h3>
              </div>

              {/* Content area */}
              <div className="p-5">
                {/* File info */}
                <div className="mb-4">
                  <p className="text-xs uppercase text-[#6c817a] font-semibold mb-1">
                    {t("admin.orderDetail.fileLabel")}
                  </p>
                  <p className="text-sm font-medium text-[#1b2b25] break-all">
                    {item.fileName ?? item.fileUrl ?? "—"}
                  </p>
                  {item.fileUrl && (
                    <a
                      href={resolveAssetUrl(item.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline mt-1 inline-block"
                    >
                      ↓ {t("admin.orderDetail.downloadFile")}
                    </a>
                  )}
                </div>

                {/* Specs grid */}
                <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b border-[#eef4f1]">
                  <div>
                    <p className="text-xs uppercase text-[#6c817a] font-semibold mb-2">
                      {t("admin.orderDetail.materialLabel")}
                    </p>
                    <p className="text-sm font-medium text-[#22342f]">
                      {item.material}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-[#6c817a] font-semibold mb-2">
                      {t("admin.orderDetail.colorLabel")}
                    </p>
                    <p className="text-sm font-medium text-[#22342f]">
                      {item.color}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-[#6c817a] font-semibold mb-2">
                      {t("admin.orderDetail.qtyLabel")}
                    </p>
                    <p className="text-sm font-bold text-[#1b2b25]">
                      {item.count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-[#6c817a] font-semibold mb-2">
                      {t("admin.orderDetail.priceLabel")}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#6c817a]">
                        {CURRENCY_CODE}
                      </span>
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
                        className="admin-field w-20 h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Instructions section */}
                {item.notes && (
                  <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
                    <p className="text-xs font-bold uppercase text-amber-900 mb-2">
                      {t("admin.orderDetail.instructionsLabel")}
                    </p>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      {item.notes}
                    </p>
                  </div>
                )}

                {/* Save button for price */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={
                      !item.id || savingItemId === item.id || pricingLocked
                    }
                    onClick={() =>
                      item.id &&
                      updateItemPrice(item.id, itemPrices[item.id] || 0)
                    }
                    className="admin-btn admin-btn-primary text-sm px-4 py-2"
                  >
                    {savingItemId === item.id
                      ? t("admin.orderDetail.savingButton")
                      : t("admin.orderDetail.saveButton")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delivery Cost Section */}
      <div className="mt-6 rounded-xl border border-[#d9e4df] bg-white overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#eef4f1] to-[#f7fcf9] px-5 py-3 border-b border-[#d9e4df]">
          <h3 className="font-bold text-[#1b2b25] text-sm">
            {t("admin.orderDetail.deliveryLabel")}
          </h3>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs uppercase text-[#6c817a] font-semibold mb-3">
                {`${t("admin.orderDetail.deliveryLabel")} (${CURRENCY_CODE})`}
              </label>
              <input
                type="number"
                value={deliveryPrice}
                disabled={pricingLocked}
                onChange={(e) => {
                  const newPrice = parseFloat(e.target.value) || 0;
                  setDeliveryPrice(newPrice);
                }}
                className="admin-field w-full"
              />
            </div>
            <button
              type="button"
              disabled={savingDelivery || pricingLocked}
              onClick={() => updateDeliveryPrice(deliveryPrice)}
              className="admin-btn admin-btn-primary mt-6"
            >
              {savingDelivery
                ? t("admin.orderDetail.savingButton")
                : t("admin.orderDetail.saveButton")}
            </button>
          </div>
        </div>
      </div>

      {/* Order Discount Section */}
      <div className="mt-4 rounded-xl border border-[#d9e4df] bg-white overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#eef4f1] to-[#f7fcf9] px-5 py-3 border-b border-[#d9e4df]">
          <h3 className="font-bold text-[#1b2b25] text-sm">
            {t("admin.orderDetail.orderDiscountLabel")}
          </h3>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs uppercase text-[#6c817a] font-semibold mb-3">
                {`${t("admin.orderDetail.orderDiscountLabel")} (${CURRENCY_CODE})`}
              </label>
              <input
                type="number"
                min="0"
                value={orderDiscountAmount}
                disabled={pricingLocked}
                onChange={(e) => {
                  const newDiscount = parseFloat(e.target.value) || 0;
                  setOrderDiscountAmount(newDiscount);
                }}
                className="admin-field w-full"
              />
            </div>
            <button
              type="button"
              disabled={savingOrderDiscount || pricingLocked}
              onClick={() => updateOrderDiscount(orderDiscountAmount)}
              className="admin-btn admin-btn-primary mt-6"
            >
              {savingOrderDiscount
                ? t("admin.orderDetail.savingButton")
                : t("admin.orderDetail.saveButton")}
            </button>
          </div>
        </div>
      </div>

      {/* Order Summary Section */}
      <div className="mt-5 rounded-xl border border-[#1b2b25] bg-gradient-to-b from-[#1b2b25] to-[#2a3d37] overflow-hidden shadow-md">
        <div className="px-5 py-4">
          {pricingLocked && (
            <p className="text-xs text-amber-300 mb-3 font-semibold">
              ⚠ {t("admin.orderDetail.pricingLockedMessage")}
            </p>
          )}
          <div className="space-y-2 text-white">
            <div className="flex justify-between items-center">
              <span className="text-sm">
                {t("admin.orderDetail.subtotalLabel")}:
              </span>
              <span className="font-semibold">
                {formatCurrencyAmount(subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">
                {t("admin.orderDetail.deliveryLabel")}:
              </span>
              <span className="font-semibold">
                {formatCurrencyAmount(deliveryPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">
                {t("admin.orderDetail.orderDiscountLabel")}:
              </span>
              <span className="font-semibold">
                {formatCurrencyAmount(orderDiscountAmount)}
              </span>
            </div>
            <div className="border-t border-white/20 my-3 pt-3 flex justify-between items-center">
              <span className="text-base font-bold">
                {t("admin.orderDetail.totalIncludingDeliveryLabel")}:
              </span>
              <span className="text-lg font-bold text-teal-300">
                {formatCurrencyAmount(totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
