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

      <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
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
