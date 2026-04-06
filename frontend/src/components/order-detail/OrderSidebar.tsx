import {
  Calendar,
  MapPin,
  Phone,
  Tag,
  Truck,
  User,
  Receipt,
} from "lucide-react";
import type { OrderSectionProps, PriceSummary } from "./types";

interface OrderSidebarProps extends OrderSectionProps {
  priceSummary: PriceSummary;
  statusLabel: string;
}

export default function OrderSidebar({
  order,
  priceSummary,
  statusLabel,
  t,
}: OrderSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#133827] text-white rounded-2xl p-8 shadow-lg">
        <h3 className="font-bold mb-6 flex items-center gap-2 text-emerald-400">
          <MapPin size={20} />
          {t("orderDetail.shippingDetails")}
        </h3>
        <div className="space-y-4 text-sm">
          <div className="flex gap-3">
            <User size={16} className="text-emerald-500 shrink-0" />
            <p className="font-bold">{order.fullName}</p>
          </div>

          <div className="flex gap-3">
            <Phone size={16} className="text-emerald-500 shrink-0" />
            <p className="text-emerald-50/80">
              {order.phoneNumber || t("orderDetail.noPhone")}
            </p>
          </div>

          <div className="flex gap-3">
            <MapPin size={16} className="text-emerald-500 shrink-0" />
            <div className="text-emerald-50/80">
              {order.addressLine1 && order.city && order.postalCode ? (
                <>
                  <p>{order.addressLine1}</p>
                  <p>
                    {order.city}, {order.postalCode}
                  </p>
                </>
              ) : (
                <p>{t("orderDetail.pending")}</p>
              )}
            </div>
          </div>

          <div className="pt-6 mt-2 border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center text-emerald-100/70">
              <span>{t("orderDetail.subtotal")}</span>
              <span>
                {!priceSummary.isPendingQuote &&
                priceSummary.subtotalPrice != null
                  ? `€${priceSummary.subtotalPrice.toFixed(2)}`
                  : t("orderDetail.toBeCalculated")}
              </span>
            </div>

            <div className="flex justify-between items-center text-emerald-100/70">
              <span className="flex items-center gap-2">
                <Truck size={14} /> {t("orderDetail.delivery")}
              </span>
              <span>
                {!priceSummary.isPendingQuote && priceSummary.deliveryPrice > 0
                  ? `€${priceSummary.deliveryPrice.toFixed(2)}`
                  : t("orderDetail.toBeCalculated")}
              </span>
            </div>

            <div className="flex justify-between items-center text-emerald-100/70">
              <span className="flex items-center gap-2">
                <Receipt size={14} /> {t("orderDetail.serviceFee")}
              </span>
              <span>
                {!priceSummary.isPendingQuote &&
                priceSummary.serviceFeePrice > 0
                  ? `€${priceSummary.serviceFeePrice.toFixed(2)}`
                  : t("orderDetail.toBeCalculated")}
              </span>
            </div>

            {!priceSummary.isPendingQuote && priceSummary.orderDiscount > 0 && (
              <div className="flex justify-between items-center text-emerald-200">
                <span className="flex items-center gap-2">
                  <Tag size={14} /> {t("orderDetail.discount")}
                </span>
                <span>-€{priceSummary.orderDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-xl font-bold text-white pt-2">
              <span className="flex items-center gap-2">
                <Tag size={18} className="text-emerald-400" />{" "}
                {t("orderDetail.total")}
              </span>
              <span className="text-emerald-400">
                {priceSummary.displayTotal > 0
                  ? `€${priceSummary.displayTotal.toFixed(2)}`
                  : t("orderDetail.pendingQuote")}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-emerald-100/40 text-xs uppercase font-bold tracking-widest mb-1">
              {t("orderDetail.status")}
            </p>
            <p className="text-xl font-bold text-emerald-400 uppercase tracking-tight">
              {statusLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h4 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
          <Calendar size={16} className="text-emerald-600" />{" "}
          {t("orderDetail.referenceId")}
        </h4>
        <p className="text-[10px] font-mono text-gray-400 break-all">
          {order.id}
        </p>
      </div>
    </div>
  );
}
