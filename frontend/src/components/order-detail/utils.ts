import type { Order } from "../../types";
import type { PriceSummary, StatusSummary, TranslateFn } from "./types";
import {
  formatOrderStatusLabel,
  getOrderStatusTimelineStep,
  getOrderStatusTranslationKey,
  normalizeOrderStatus,
} from "../../utils/orderStatus";

export function buildPriceSummary(order: Order): PriceSummary {
  const hasMissingPrice = order.items.some(
    (item) => item.price == null || item.price <= 0,
  );

  const isPendingQuote = normalizeOrderStatus(order.status) === "pending_quote";
  const fallbackSubtotal = hasMissingPrice
    ? null
    : order.items.reduce((sum, item) => sum + item.price, 0);

  const subtotalPrice =
    order.subtotalAmount != null ? order.subtotalAmount : fallbackSubtotal;
  const orderDiscount = Math.max(
    order.discountAmount ?? order.orderDiscountAmount ?? 0,
    0,
  );
  const deliveryPrice = Math.max(order.deliveryPrice ?? 0, 0);
  const serviceFeePrice = Math.max(order.serviceFeePrice ?? 0, 0);

  const calculatedTotal =
    subtotalPrice == null
      ? null
      : Math.max(subtotalPrice + deliveryPrice - orderDiscount, 0);

  const finalTotal =
    order.finalTotalAmount != null
      ? Math.max(order.finalTotalAmount, 0)
      : calculatedTotal;

  const displayTotal = isPendingQuote
    ? 0
    : finalTotal != null
      ? finalTotal
      : order.quotedPrice && order.quotedPrice > 0
        ? order.quotedPrice
        : 0;

  return {
    isPendingQuote,
    subtotalPrice,
    deliveryPrice,
    serviceFeePrice,
    orderDiscount,
    displayTotal,
  };
}

export function buildStatusSummary(
  order: Order,
  t: TranslateFn,
): StatusSummary {
  const translationKey = getOrderStatusTranslationKey(order.status);
  const label = translationKey
    ? t(translationKey)
    : formatOrderStatusLabel(order.status);

  const step = getOrderStatusTimelineStep(order.status);

  return { label, step };
}

export function getReachedDate(order: Order): string {
  return new Date(order.updatedAt || order.createdAt).toLocaleDateString();
}
