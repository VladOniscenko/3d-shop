import type { Order } from "../../types";
import type { PriceSummary, StatusSummary, TranslateFn } from "./types";

export function buildPriceSummary(order: Order): PriceSummary {
  const hasMissingPrice = order.items.some(
    (item) => item.price == null || item.price <= 0,
  );

  const isPendingQuote = order.status.toLowerCase() === "pending_quote";
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
    orderDiscount,
    displayTotal,
  };
}

export function buildStatusSummary(order: Order, t: TranslateFn): StatusSummary {
  const status = order.status.toLowerCase();

  const label = (() => {
    switch (status) {
      case "pending_quote":
        return t("orderStatus.pendingQuote");
      case "printing":
        return t("orderStatus.printing");
      case "quoted":
        return t("orderStatus.quoted");
      case "pending_payment":
        return t("orderStatus.pendingPayment");
      case "completed":
        return t("orderStatus.completed");
      case "paid":
        return t("orderStatus.paid");
      case "shipped":
        return t("orderStatus.shipped");
      case "sent":
        return t("orderStatus.sent");
      case "delivered":
        return t("orderStatus.delivered");
      default:
        return order.status;
    }
  })();

  const step = (() => {
    switch (status) {
      case "pending_quote":
        return 1;
      case "quoted":
      case "pending_payment":
        return 2;
      case "paid":
        return 3;
      case "printing":
        return 4;
      case "completed":
        return 5;
      case "sent":
      case "delivered":
        return 6;
      default:
        return 1;
    }
  })();

  return { label, step };
}

export function getReachedDate(order: Order): string {
  return new Date(order.updatedAt || order.createdAt).toLocaleDateString();
}
