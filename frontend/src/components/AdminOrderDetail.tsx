import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminBreadcrumb from "./AdminBreadcrumb";
import AdminLayout from "./AdminLayout";
import api from "../services/api";
import type { Order, PaymentAttempt } from "../types";
import { useNotify } from "../context/NotifyContext";
import { useI18n } from "../i18n/I18nContext";
import type {
  OrderCommunication,
  OrderStatusHistoryEntry,
} from "./admin-order-detail/types";
import OrderPricingPanel from "./admin-order-detail/OrderPricingPanel";
import OrderHistoryPanel from "./admin-order-detail/OrderHistoryPanel";
import {
  ADMIN_ORDER_STATUS_OPTIONS,
  canTransitionOrderStatus,
  formatOrderStatusLabel,
  getOrderStatusPillClass,
  isOrderPricingLocked,
  normalizeOrderStatus,
} from "../utils/orderStatus";

export default function AdminOrderDetail() {
  const { notifyError, notifySuccess } = useNotify();
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalNotes, setInternalNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [fullName, setFullName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [itemPrices, setItemPrices] = useState<{ [key: string]: number }>({});
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [orderDiscountAmount, setOrderDiscountAmount] = useState(0);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [savingOrderDiscount, setSavingOrderDiscount] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailType, setEmailType] = useState("quote_requested");
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);
  const [communications, setCommunications] = useState<OrderCommunication[]>(
    [],
  );
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistoryEntry[]>(
    [],
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [payments, setPayments] = useState<PaymentAttempt[]>([]);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentFromDate, setPaymentFromDate] = useState("");
  const [paymentToDate, setPaymentToDate] = useState("");
  // Status dropdown state
  const [selectedStatus, setSelectedStatus] = useState("pending");

  useEffect(() => {
    if (!id) return;

    const applyOrderData = (data: Order) => {
      setOrder(data);
      setFullName(data.fullName);
      setAddressLine1(data.addressLine1);
      setAddressLine2(data.addressLine2 || "");
      setCity(data.city);
      setPostalCode(data.postalCode);
      setPhoneNumber(data.phoneNumber);

      const prices: { [key: string]: number } = {};
      data.items.forEach((item: any) => {
        if (item.id) prices[item.id] = item.price || 0;
      });

      setItemPrices(prices);
      setDeliveryPrice(data.deliveryPrice || 0);
      setOrderDiscountAmount(data.orderDiscountAmount || 0);
      setSelectedStatus(data.status || "pending");
      setTrackingCode(data.trackingCode || "");
      setTrackingUrl(data.trackingUrl || "");
      setInternalNotes(data.internalNotes || "");
      setCustomerNotes(data.customerNotes || "");
    };

    const getOrder = async () => {
      try {
        const [res, commsRes, statusRes, paymentsRes] = await Promise.all([
          api.get(`/admin/orders/${id}`),
          api.get(`/admin/orders/${id}/communications`),
          api.get(`/admin/orders/${id}/status-history`),
          api.get(`/admin/orders/${id}/payments`),
        ]);
        applyOrderData(res.data);
        setCommunications(commsRes.data || []);
        setStatusHistory(statusRes.data || []);
        setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getOrder();
  }, [id]);
  const updateOrderStatus = async () => {
    if (!id) return;
    try {
      await api.patch(`/admin/orders/${id}/status`, {
        status: selectedStatus,
      });
      await refresh();
      notifySuccess("Order status updated.");
    } catch (err: any) {
      console.error(err);
      notifyError(
        err?.response?.data?.message || "Could not update order status.",
      );
    }
  };

  const refresh = async () => {
    if (!id) return;
    const [res, commsRes, statusRes, paymentsRes] = await Promise.all([
      api.get(`/admin/orders/${id}`),
      api.get(`/admin/orders/${id}/communications`),
      api.get(`/admin/orders/${id}/status-history`),
      api.get(`/admin/orders/${id}/payments`),
    ]);
    setOrder(res.data);
    setTrackingCode(res.data.trackingCode || "");
    setTrackingUrl(res.data.trackingUrl || "");
    setCommunications(commsRes.data || []);
    setStatusHistory(statusRes.data || []);
    setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
  };

  const saveTracking = async () => {
    if (!id) return;
    if (!trackingCode.trim()) {
      notifyError("Tracking code is required.");
      return;
    }

    setSavingTracking(true);
    try {
      await api.patch(`/admin/orders/${id}/tracking`, {
        trackingCode: trackingCode.trim(),
        trackingUrl: trackingUrl.trim() || null,
      });
      await refresh();
      notifySuccess("Tracking saved on order.");
    } catch (err) {
      console.error(err);
      notifyError("Could not save tracking details.");
    } finally {
      setSavingTracking(false);
    }
  };

  const updateItemPrice = async (itemId: string, price: number) => {
    if (!id) return;
    setSavingItemId(itemId);
    try {
      await api.put(`/admin/orders/${id}/items/${itemId}`, { price });
      await refresh();
      notifySuccess("Item price updated.");
    } catch (err) {
      console.error(err);
      notifyError("Could not update item price.");
    } finally {
      setSavingItemId(null);
    }
  };

  const updateDeliveryPrice = async (price: number) => {
    if (!id) return;
    setSavingDelivery(true);
    try {
      await api.patch(`/admin/orders/${id}/delivery-price`, {
        deliveryPrice: price,
      });
      await refresh();
      notifySuccess("Delivery price updated.");
    } catch (err) {
      console.error(err);
      notifyError("Could not update delivery price.");
    } finally {
      setSavingDelivery(false);
    }
  };

  const updateOrderDiscount = async (discount: number) => {
    if (!id) return;
    if (discount < 0) {
      notifyError("Order discount cannot be negative.");
      return;
    }

    setSavingOrderDiscount(true);
    try {
      await api.patch(`/admin/orders/${id}/order-discount`, {
        orderDiscountAmount: discount,
      });
      await refresh();
      notifySuccess("Order discount updated.");
    } catch (err) {
      console.error(err);
      notifyError("Could not update order discount.");
    } finally {
      setSavingOrderDiscount(false);
    }
  };

  const deleteOrder = async () => {
    if (!id) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      notifySuccess("Order deleted.");
      navigate("/admin/orders");
    } catch (err: any) {
      console.error(err);
      notifyError(err?.response?.data?.message || "Could not delete order.");
    }
  };

  const saveNotes = async () => {
    if (!id) return;
    try {
      await api.put(`/admin/orders/${id}/notes`, {
        internalNotes,
        customerNotes,
      });
      await refresh();
      notifySuccess("Notes saved.");
    } catch (err) {
      console.error(err);
      notifyError("Could not save notes.");
    }
  };

  const saveCustomerInfo = async () => {
    if (!id) return;
    try {
      await api.patch(`/admin/orders/${id}/customer`, {
        fullName,
        addressLine1,
        addressLine2,
        city,
        postalCode,
        phoneNumber,
      });
      await refresh();
      setEditingCustomer(false);
      notifySuccess("Customer info updated.");
    } catch (err: any) {
      console.error(err);
      notifyError(
        err?.response?.data?.message || "Could not update customer info.",
      );
    }
  };

  const sendCustomerEmail = async () => {
    if (!id) return;

    if (emailType === "order_sent_tracking" && !trackingCode.trim()) {
      notifyError("Tracking code is required for sent email.");
      return;
    }

    setSendingEmail(true);
    try {
      await api.post(`/admin/orders/${id}/email`, {
        type: emailType,
        price: null,
        message: null,
        trackingCode:
          emailType === "order_sent_tracking" ? trackingCode.trim() : null,
        trackingUrl:
          emailType === "order_sent_tracking" ? trackingUrl.trim() : null,
      });
      notifySuccess("Email sent to customer.");
    } catch (err: any) {
      console.error(err);
      notifyError(
        err?.response?.data?.message || "Could not send customer email.",
      );
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-shell flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-shell flex flex-col items-center justify-center">
        <p>{t("admin.order.notFoundTitle")}</p>
        <Link to="/admin/orders" className="mt-2 text-teal-700 underline">
          {t("admin.order.notFoundLink")}
        </Link>
      </div>
    );
  }

  const subtotal =
    order.items.reduce((sum, item) => {
      const key = item.id ?? "";
      return (
        sum +
        (key && itemPrices[key] !== undefined
          ? itemPrices[key]
          : item.price || 0) *
          (item.count ?? 1)
      );
    }, 0) || 0;

  const totalPrice = Math.max(
    0,
    subtotal + deliveryPrice - orderDiscountAmount,
  );
  const pricingLocked = isOrderPricingLocked(order.status, !!order.isPaid);
  const allowedStatusOptions = ADMIN_ORDER_STATUS_OPTIONS.filter((option) =>
    canTransitionOrderStatus(order.status, option.value, !!order.isPaid),
  );
  const currentStatus = normalizeOrderStatus(order.status);
  const hasCurrentStatusOption = allowedStatusOptions.some(
    (option) => option.value === currentStatus,
  );
  const statusOptionsForSelect = hasCurrentStatusOption
    ? allowedStatusOptions
    : [
        {
          value: currentStatus,
          label: formatOrderStatusLabel(currentStatus),
        },
        ...allowedStatusOptions,
      ];
  const isStatusUnchanged =
    normalizeOrderStatus(selectedStatus) === normalizeOrderStatus(order.status);
  const quoteExpiresAt = order.quoteExpiresAt
    ? new Date(order.quoteExpiresAt)
    : null;
  const hasQuoteExpiry =
    quoteExpiresAt instanceof Date && !Number.isNaN(quoteExpiresAt.getTime());
  const normalizedPaymentSearch = paymentSearch.trim().toLowerCase();
  const filteredPayments = payments.filter((payment) => {
    const statusMatch =
      paymentStatusFilter === "all" ||
      String(payment.status || "").toLowerCase() === paymentStatusFilter;

    const searchMatch =
      normalizedPaymentSearch.length === 0 ||
      String(payment.reference || "")
        .toLowerCase()
        .includes(normalizedPaymentSearch) ||
      String(payment.providerPaymentId || "")
        .toLowerCase()
        .includes(normalizedPaymentSearch);

    const createdDate = new Date(payment.createdAt);
    const fromMatch =
      !paymentFromDate ||
      createdDate >= new Date(`${paymentFromDate}T00:00:00`);
    const toMatch =
      !paymentToDate || createdDate <= new Date(`${paymentToDate}T23:59:59`);

    return statusMatch && searchMatch && fromMatch && toMatch;
  });

  const hasUnpricedItems = order.items.some((item) => {
    const key = item.id ?? "";
    const price =
      key && itemPrices[key] !== undefined ? itemPrices[key] : item.price || 0;
    return price <= 0;
  });
  const hasShippingInfo = [
    order.fullName,
    order.addressLine1,
    order.city,
    order.postalCode,
    order.phoneNumber,
  ].every((value) => String(value || "").trim().length > 0);
  const hasQuoteMessage = String(order.quoteMessage || "").trim().length > 0;
  const hasTrackingInfo =
    String(trackingCode || order.trackingCode || "").trim().length > 0;
  const hasPaymentAttempts = payments.length > 0;
  const hasPaidPayment =
    !!order.isPaid ||
    payments.some((payment) => String(payment.status || "").toLowerCase() === "paid");
  const actionFlow = buildAdminActionFlow({
    status: currentStatus,
    hasUnpricedItems,
    hasShippingInfo,
    hasQuoteMessage,
    hasPaymentAttempts,
    hasPaidPayment,
    hasTrackingInfo,
  });

  return (
    <AdminLayout>
      <AdminBreadcrumb
        title={`Order ${order.id.slice(0, 8)}`}
        items={[
          { label: t("breadcrumb.admin"), to: "/admin" },
          { label: t("breadcrumb.orders"), to: "/admin/orders" },
          { label: order.id.slice(0, 8) },
        ]}
      />

      <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <article className="admin-panel p-4">
          <p className="text-xs uppercase text-[#6c817a]">
            {t("admin.orderDetail.statusLabel")}
          </p>
          <p className={`${getOrderStatusPillClass(order.status)} mt-2 w-fit`}>
            {formatOrderStatusLabel(order.status)}
          </p>
        </article>
        <article className="admin-panel p-4">
          <p className="text-xs uppercase text-[#6c817a]">
            {t("admin.orderDetail.createdLabel")}
          </p>
          <p className="mt-2 text-sm text-[#2e423d]">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </article>
        <article className="admin-panel p-4">
          <p className="text-xs uppercase text-[#6c817a]">
            {t("admin.orderDetail.itemsLabel")}
          </p>
          <p className="mt-2 text-xl font-semibold text-[#1b2b25]">
            {order.items.length}
          </p>
        </article>
        <article className="admin-panel p-4">
          <p className="text-xs uppercase text-[#6c817a]">
            {t("admin.orderDetail.totalLabel")}
          </p>
          <p className="mt-2 text-xl font-semibold text-[#1b2b25]">
            EUR {totalPrice.toFixed(2)}
          </p>
        </article>
        <article className="admin-panel p-4">
          <p className="text-xs uppercase text-[#6c817a]">Quote Expires</p>
          <p className="mt-2 text-sm text-[#2e423d]">
            {hasQuoteExpiry ? quoteExpiresAt.toLocaleString() : "-"}
          </p>
        </article>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <OrderPricingPanel
            order={order}
            t={t}
            itemPrices={itemPrices}
            setItemPrices={setItemPrices}
            savingItemId={savingItemId}
            updateItemPrice={updateItemPrice}
            deliveryPrice={deliveryPrice}
            setDeliveryPrice={setDeliveryPrice}
            savingDelivery={savingDelivery}
            updateDeliveryPrice={updateDeliveryPrice}
            orderDiscountAmount={orderDiscountAmount}
            setOrderDiscountAmount={setOrderDiscountAmount}
            savingOrderDiscount={savingOrderDiscount}
            updateOrderDiscount={updateOrderDiscount}
            subtotal={subtotal}
            totalPrice={totalPrice}
            pricingLocked={pricingLocked}
          />

          <OrderHistoryPanel
            t={t}
            statusHistory={statusHistory}
            communications={communications}
          />
        </div>

        <div className="space-y-5">
          <article className="admin-panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-bold text-[#1b2b25]">
                {t("admin.order.customerInfoTitle")}
              </h2>
              <button
                onClick={() => setEditingCustomer(!editingCustomer)}
                className="text-sm text-teal-700 hover:underline"
              >
                {editingCustomer
                  ? t("admin.order.customerCancel")
                  : t("admin.order.customerEdit")}
              </button>
            </div>
            {editingCustomer ? (
              <div className="space-y-2">
                <label className="admin-label">
                  <span className="font-semibold">
                    {t("admin.order.fullNameLabel")}
                  </span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("admin.order.fullNamePlaceholder")}
                    className="admin-field"
                  />
                </label>
                <label className="admin-label">
                  <span className="font-semibold">
                    {t("admin.order.addressLine1Label")}
                  </span>
                  <input
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder={t("admin.order.addressLine1Placeholder")}
                    className="admin-field"
                  />
                </label>
                <label className="admin-label">
                  <span className="font-semibold">
                    {t("admin.order.addressLine2Label")}
                  </span>
                  <input
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder={t("admin.order.addressLine2Placeholder")}
                    className="admin-field"
                  />
                </label>
                <label className="admin-label">
                  <span className="font-semibold">
                    {t("admin.order.cityLabel")}
                  </span>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t("admin.order.cityPlaceholder")}
                    className="admin-field"
                  />
                </label>
                <label className="admin-label">
                  <span className="font-semibold">
                    {t("admin.order.postalCodeLabel")}
                  </span>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder={t("admin.order.postalCodePlaceholder")}
                    className="admin-field"
                  />
                </label>
                <label className="admin-label">
                  <span className="font-semibold">
                    {t("admin.order.phoneNumberLabel")}
                  </span>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t("admin.order.phoneNumberPlaceholder")}
                    className="admin-field"
                  />
                </label>
                <button
                  onClick={saveCustomerInfo}
                  className="admin-btn admin-btn-primary"
                >
                  {t("admin.order.saveButton")}
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-[#2e423d]">
                <p>{order.fullName}</p>
                <p>
                  {order.addressLine1}
                  {order.addressLine2 ? `, ${order.addressLine2}` : ""}
                </p>
                <p>
                  {order.city}, {order.postalCode}
                </p>
                <p>{order.phoneNumber}</p>
              </div>
            )}
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">
              {t("admin.order.orderActionsTitle")}
            </h3>

            <div className="mb-4 rounded-xl border border-[#dce7e2] bg-[#f7fbf9] p-3">
              <p className="text-xs uppercase tracking-wide text-[#5f736d]">
                Recommended Action Flow
              </p>
              <p className="mt-1 text-sm font-semibold text-[#1b2b25]">
                {actionFlow.title}
              </p>

              <ul className="mt-2 space-y-1 text-sm text-[#2e423d]">
                {actionFlow.steps.map((step, index) => (
                  <li key={`${index}-${step}`} className="flex gap-2">
                    <span className="text-[#5f736d]">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 space-y-1">
                {actionFlow.checks.map((check) => (
                  <p
                    key={check.label}
                    className={`text-xs ${check.ok ? "text-emerald-700" : "text-amber-700"}`}
                  >
                    {check.ok ? "OK" : "TODO"} - {check.label}
                  </p>
                ))}
              </div>

              <p className="mt-3 text-xs text-[#5f736d]">
                Suggested next status: <strong>{actionFlow.suggestedStatus}</strong>
              </p>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="admin-select"
                >
                  {statusOptionsForSelect.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={updateOrderStatus}
                  disabled={isStatusUnchanged}
                >
                  {t("admin.order.updateStatusButton")}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="admin-btn admin-btn-danger"
              >
                {t("admin.order.deleteOrderButton")}
              </button>
              {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="admin-panel w-full max-w-sm p-6">
                    <p className="mb-4 font-semibold">
                      {t("admin.order.deleteConfirmMessage")}
                    </p>
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        {t("admin.order.cancelButton")}
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={async () => {
                          setShowDeleteConfirm(false);
                          await deleteOrder();
                        }}
                      >
                        {t("admin.order.deleteConfirmButton")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">
              {t("admin.order.trackingTitle")}
            </h3>
            <div className="grid gap-3">
              <div>
                <label className="block text-xs uppercase text-[#6c817a]">
                  {t("admin.order.trackingCodeLabel")}
                </label>
                <input
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="admin-field"
                  placeholder={t("admin.order.trackingCodePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-[#6c817a]">
                  {t("admin.order.trackingUrlLabel")}
                </label>
                <input
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="admin-field"
                  placeholder={t("admin.order.trackingUrlPlaceholder")}
                />
              </div>
              <button
                type="button"
                onClick={saveTracking}
                disabled={savingTracking}
                className="admin-btn admin-btn-secondary w-fit"
              >
                {savingTracking
                  ? t("admin.order.savingButton")
                  : t("admin.order.saveTrackingButton")}
              </button>
            </div>
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">Quote Validity</h3>
            {hasQuoteExpiry ? (
              <p className="text-sm text-[#2e423d]">
                Expires on {quoteExpiresAt.toLocaleString()}
              </p>
            ) : (
              <p className="text-sm text-[#5b706a]">
                No quote expiry date recorded.
              </p>
            )}
            {normalizeOrderStatus(order.status) === "expired_quote" && (
              <p className="mt-2 text-sm text-rose-700">
                Quote expired after 7 days. Set status to Pending Quote for a
                refreshed quote cycle.
              </p>
            )}
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">
              {t("admin.order.communicationTitle")}
            </h3>
            <div className="grid gap-3">
              <div>
                <label className="block text-xs uppercase text-[#6c817a]">
                  {t("admin.order.emailTypeLabel")}
                </label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="admin-select"
                >
                  <option value="quote_requested">
                    {t("admin.order.emailTypeQuote")}
                  </option>
                  <option value="quote_confirmation">
                    {t("admin.order.emailTypeConfirmation")}
                  </option>
                  <option value="order_sent_tracking">
                    {t("admin.order.emailTypeTracking")}
                  </option>
                </select>
              </div>

              {emailType === "quote_confirmation" && (
                <p className="text-sm text-[#5b706a]">
                  {t("admin.order.emailConfirmationNote")}
                </p>
              )}

              {emailType === "order_sent_tracking" && (
                <p className="text-sm text-[#5b706a]">
                  {t("admin.order.emailTrackingNote")}
                </p>
              )}

              <button
                type="button"
                onClick={sendCustomerEmail}
                disabled={sendingEmail}
                className="admin-btn admin-btn-primary w-fit"
              >
                {sendingEmail
                  ? t("admin.order.sendingButton")
                  : t("admin.order.sendEmailButton")}
              </button>
            </div>
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">
              {t("admin.order.notesTitle")}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#5f736d]">
                  {t("admin.order.internalNotesLabel")}
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  className="admin-textarea"
                />
              </div>
              <div>
                <label className="block text-xs text-[#5f736d]">
                  {t("admin.order.customerNotesLabel")}
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                  className="admin-textarea"
                />
              </div>
              <button
                onClick={saveNotes}
                className="admin-btn admin-btn-primary"
              >
                {t("admin.order.saveNotesButton")}
              </button>
            </div>
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">Payment Attempts</h3>
            <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              <input
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="admin-field"
                placeholder="Search reference or provider ID"
              />
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="expired">Expired</option>
                <option value="canceled">Canceled</option>
                <option value="pending">Pending</option>
                <option value="open">Open</option>
              </select>
              <input
                type="date"
                value={paymentFromDate}
                onChange={(e) => setPaymentFromDate(e.target.value)}
                className="admin-field"
              />
              <input
                type="date"
                value={paymentToDate}
                onChange={(e) => setPaymentToDate(e.target.value)}
                className="admin-field"
              />
            </div>
            {payments.length === 0 ? (
              <p className="text-sm text-[#5b706a]">No payment attempts yet.</p>
            ) : filteredPayments.length === 0 ? (
              <p className="text-sm text-[#5b706a]">
                No payment attempts match current filters.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-lg border border-[#dce7e2] bg-[#f7fbf9] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[#2e423d]">
                        {payment.reference}
                      </p>
                      <span className="text-xs uppercase rounded-full bg-white border border-[#c9d8d1] px-2 py-0.5 text-[#29433a]">
                        {payment.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#2e423d]">
                      {payment.currency}{" "}
                      {Number(payment.amount || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-[#6c817a] mt-1">
                      Attempts: {payment.webhookAttemptCount || 0}
                    </p>
                    {payment.providerPaymentId && (
                      <p className="text-xs text-[#6c817a] mt-1 break-all">
                        Provider ID: {payment.providerPaymentId}
                      </p>
                    )}
                    {payment.lastWebhookPayloadHash && (
                      <p className="text-xs text-[#6c817a] mt-1 break-all">
                        Payload hash: {payment.lastWebhookPayloadHash}
                      </p>
                    )}
                    {payment.lastWebhookError && (
                      <p className="text-xs text-rose-700 mt-1 break-words">
                        Last error: {payment.lastWebhookError}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">
              {t("admin.order.messagingTitle")}
            </h3>
            <p className="text-sm text-[#5b706a]">
              {t("admin.order.quoteLabel")}:{" "}
              {order.quoteMessage || t("admin.order.noneValue")}
            </p>
            <p className="text-sm text-[#5b706a]">
              {t("admin.order.internalNotesLabel")}:{" "}
              {order.internalNotes || t("admin.order.noneValue")}
            </p>
            <p className="text-sm text-[#5b706a]">
              {t("admin.order.customerNotesLabel")}:{" "}
              {order.customerNotes || t("admin.order.noneValue")}
            </p>
          </article>
        </div>
      </div>
    </AdminLayout>
  );
}

type AdminActionFlowInput = {
  status: string;
  hasUnpricedItems: boolean;
  hasShippingInfo: boolean;
  hasQuoteMessage: boolean;
  hasPaymentAttempts: boolean;
  hasPaidPayment: boolean;
  hasTrackingInfo: boolean;
};

type AdminActionFlow = {
  title: string;
  steps: string[];
  checks: Array<{ label: string; ok: boolean }>;
  suggestedStatus: string;
};

function buildAdminActionFlow(input: AdminActionFlowInput): AdminActionFlow {
  const baseChecks = [
    { label: "All item prices set", ok: !input.hasUnpricedItems },
    { label: "Shipping details complete", ok: input.hasShippingInfo },
    { label: "Quote message present", ok: input.hasQuoteMessage },
    { label: "Payment attempt exists", ok: input.hasPaymentAttempts },
    { label: "Paid payment confirmed", ok: input.hasPaidPayment },
    { label: "Tracking code added", ok: input.hasTrackingInfo },
  ];

  switch (input.status) {
    case "pending_quote":
      return {
        title: "Prepare quote before customer confirmation",
        steps: [
          "Review uploaded model files and customer instructions carefully.",
          "Set price per item based on complexity, print time, and material.",
          "Set delivery price and apply discount only if needed.",
          "Add a clear quote message and verify shipping details.",
          "Send quote confirmation and update status to Quoted.",
        ],
        checks: [baseChecks[0], baseChecks[1], baseChecks[2]],
        suggestedStatus: "quoted",
      };

    case "quoted":
      return {
        title: "Await customer payment",
        steps: [
          "Keep pricing stable unless customer requests a revision.",
          "Monitor quote expiry date and payment attempts.",
          "Do not start production before payment is confirmed.",
          "If changes are requested, move back to Pending Quote and reprice.",
        ],
        checks: [baseChecks[3], baseChecks[4]],
        suggestedStatus: input.hasPaidPayment ? "paid" : "quoted",
      };

    case "expired_quote":
      return {
        title: "Quote expired, request refresh",
        steps: [
          "Do not print or ship while quote is expired.",
          "Ask customer to request a new quote from their order page.",
          "Re-check model scope, recalculate pricing, and send updated quote.",
        ],
        checks: [baseChecks[0], baseChecks[1]],
        suggestedStatus: "pending_quote",
      };

    case "pending_payment":
      return {
        title: "Payment in progress",
        steps: [
          "Check payment attempts and webhook result in payment history.",
          "If paid is confirmed, move forward with production flow.",
          "If payment fails or expires, return to quote flow.",
        ],
        checks: [baseChecks[3], baseChecks[4]],
        suggestedStatus: input.hasPaidPayment ? "paid" : "pending_payment",
      };

    case "paid":
      return {
        title: "Ready to start production",
        steps: [
          "Confirm payment amount/reference and selected print specs.",
          "Confirm printer availability and material stock.",
          "Start production and update status to Printing.",
        ],
        checks: [baseChecks[4]],
        suggestedStatus: "printing",
      };

    case "printing":
      return {
        title: "Production and shipment prep",
        steps: [
          "Complete print and quality checks before packaging.",
          "Create shipping label and enter track and trace.",
          "Send tracking email and update status to Sent or Shipped.",
        ],
        checks: [baseChecks[5]],
        suggestedStatus: input.hasTrackingInfo ? "sent" : "printing",
      };

    case "sent":
    case "shipped":
      return {
        title: "In transit follow-up",
        steps: [
          "Ensure tracking code and URL are correct.",
          "Monitor carrier updates and delivery confirmation.",
          "Update status to Delivered when handoff is confirmed.",
        ],
        checks: [baseChecks[5]],
        suggestedStatus: "delivered",
      };

    case "delivered":
      return {
        title: "Post-delivery completion",
        steps: [
          "Confirm delivery with tracking evidence.",
          "Handle support issues if customer reports problems.",
          "Close order as Completed when no pending actions remain.",
        ],
        checks: [baseChecks[5]],
        suggestedStatus: "completed",
      };

    case "completed":
      return {
        title: "Order closed",
        steps: [
          "No operational action required.",
          "Only reopen status if a verified correction is needed.",
        ],
        checks: [],
        suggestedStatus: "completed",
      };

    case "failed":
      return {
        title: "Resolve payment or process failure",
        steps: [
          "Review payment errors and communication history.",
          "Contact customer with clear next steps.",
          "If customer retries, move back to quote/payment flow.",
        ],
        checks: [baseChecks[3]],
        suggestedStatus: "pending_quote",
      };

    case "cancelled":
      return {
        title: "Order cancelled",
        steps: [
          "No fulfillment action should be taken.",
          "Keep cancellation reason documented in notes.",
        ],
        checks: [],
        suggestedStatus: "cancelled",
      };

    default:
      return {
        title: "Review order before next action",
        steps: [
          "Check order details, pricing, and payment history.",
          "Select the next status only after prerequisites are verified.",
        ],
        checks: [baseChecks[0], baseChecks[3], baseChecks[4]],
        suggestedStatus: "pending_quote",
      };
  }
}
