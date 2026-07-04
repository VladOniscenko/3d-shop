import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AdminBreadcrumb from "./AdminBreadcrumb";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import type { Order, OrderNote, PaymentAttempt } from "../../types";
import { useNotify } from "../../context/NotifyContext";
import { useI18n } from "../../i18n/I18nContext";
import type {
  OrderCommunication,
  OrderStatusHistoryEntry,
} from "./../admin-order-detail/types";
import OrderPricingPanel from "./../admin-order-detail/OrderPricingPanel";
import OrderHistoryPanel from "./../admin-order-detail/OrderHistoryPanel";
import {
  ADMIN_ORDER_STATUS_OPTIONS,
  canTransitionOrderStatus,
  formatOrderStatusLabel,
  getOrderStatusPillClass,
  isOrderPricingLocked,
  normalizeOrderStatus,
} from "../../utils/orderStatus";
import { formatCurrencyAmount } from "../../utils/currency";

export default function AdminOrderDetail() {
  const { notifyError, notifySuccess } = useNotify();
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalNoteInput, setInternalNoteInput] = useState("");
  const [customerNoteInput, setCustomerNoteInput] = useState("");
  const [addingInternalNote, setAddingInternalNote] = useState(false);
  const [addingCustomerNote, setAddingCustomerNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [fullName, setFullName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [itemPrices, setItemPrices] = useState<{ [key: string]: number }>({});
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [orderDiscountAmount, setOrderDiscountAmount] = useState(0);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [savingServiceFee, setSavingServiceFee] = useState(false);
  const [savingOrderDiscount, setSavingOrderDiscount] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailType, setEmailType] = useState("quote_requested");
  const [paymentFlow, setPaymentFlow] = useState("stripe");
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
  const [reconcilingPayments, setReconcilingPayments] = useState(false);
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
      setServiceFee(data.serviceFeePrice || 0);
      setOrderDiscountAmount(data.orderDiscountAmount || 0);
      setSelectedStatus(data.status || "pending");
      setPaymentFlow(data.paymentFlow || "stripe");
      setTrackingCode(data.trackingCode || "");
      setTrackingUrl(data.trackingUrl || "");
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
      notifySuccess(t("admin.order.statusUpdated"));
    } catch (err: any) {
      console.error(err);
      notifyError(
        err?.response?.data?.message || t("admin.order.statusUpdateFailed"),
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
    setPaymentFlow(res.data.paymentFlow || "stripe");
    setCommunications(commsRes.data || []);
    setStatusHistory(statusRes.data || []);
    setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
  };

  const saveTracking = async () => {
    if (!id) return;
    if (!trackingCode.trim()) {
      notifyError(t("admin.order.trackingRequired"));
      return;
    }

    setSavingTracking(true);
    try {
      await api.patch(`/admin/orders/${id}/tracking`, {
        trackingCode: trackingCode.trim(),
        trackingUrl: trackingUrl.trim() || null,
      });
      await refresh();
      notifySuccess(t("admin.order.trackingSaved"));
    } catch (err) {
      console.error(err);
      notifyError(t("admin.order.trackingSaveFailed"));
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
      notifySuccess(t("admin.order.itemPriceUpdated"));
    } catch (err) {
      console.error(err);
      notifyError(t("admin.order.itemPriceUpdateFailed"));
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
      notifySuccess(t("admin.order.deliveryPriceUpdated"));
    } catch (err) {
      console.error(err);
      notifyError(t("admin.order.deliveryPriceUpdateFailed"));
    } finally {
      setSavingDelivery(false);
    }
  };

  const updateServiceFee = async (fee: number) => {
    if (!id) return;
    setSavingServiceFee(true);
    try {
      await api.patch(`/admin/orders/${id}/service-fee`, {
        serviceFeePrice: fee,
      });
      await refresh();
      notifySuccess(
        t("admin.order.serviceFeeUpdated") || "Service fee updated",
      );
    } catch (err) {
      console.error(err);
      notifyError(
        t("admin.order.serviceFeeUpdateFailed") ||
          "Failed to update service fee",
      );
    } finally {
      setSavingServiceFee(false);
    }
  };

  const updateOrderDiscount = async (discount: number) => {
    if (!id) return;
    if (discount < 0) {
      notifyError(t("admin.order.discountNegative"));
      return;
    }

    setSavingOrderDiscount(true);
    try {
      await api.patch(`/admin/orders/${id}/order-discount`, {
        orderDiscountAmount: discount,
      });
      await refresh();
      notifySuccess(t("admin.order.discountUpdated"));
    } catch (err) {
      console.error(err);
      notifyError(t("admin.order.discountUpdateFailed"));
    } finally {
      setSavingOrderDiscount(false);
    }
  };

  const deleteOrder = async () => {
    if (!id) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      notifySuccess(t("admin.order.deleted"));
      navigate("/admin/orders");
    } catch (err: any) {
      console.error(err);
      notifyError(
        err?.response?.data?.message || t("admin.order.deleteFailed"),
      );
    }
  };

  const addNote = async (visibility: "internal" | "customer") => {
    if (!id) return;

    const content =
      visibility === "internal" ? internalNoteInput : customerNoteInput;

    if (!content.trim()) {
      notifyError(t("admin.order.noteContentRequired"));
      return;
    }

    if (visibility === "internal") {
      setAddingInternalNote(true);
    } else {
      setAddingCustomerNote(true);
    }

    try {
      await api.post(`/admin/orders/${id}/notes`, {
        content: content.trim(),
        visibility,
      });
      await refresh();
      if (visibility === "internal") {
        setInternalNoteInput("");
      } else {
        setCustomerNoteInput("");
      }
      notifySuccess(t("admin.order.noteAdded"));
    } catch (err) {
      console.error(err);
      notifyError(t("admin.order.noteAddFailed"));
    } finally {
      if (visibility === "internal") {
        setAddingInternalNote(false);
      } else {
        setAddingCustomerNote(false);
      }
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!id) return;

    setDeletingNoteId(noteId);
    try {
      await api.delete(`/admin/orders/${id}/notes/${noteId}`);
      await refresh();
      notifySuccess(t("admin.order.noteDeleted"));
    } catch (err) {
      console.error(err);
      notifyError(t("admin.order.noteDeleteFailed"));
    } finally {
      setDeletingNoteId(null);
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
      notifySuccess(t("admin.order.customerUpdated"));
    } catch (err: any) {
      console.error(err);
      notifyError(
        err?.response?.data?.message || t("admin.order.customerUpdateFailed"),
      );
    }
  };

  const sendCustomerEmail = async () => {
    if (!id) return;

    if (emailType === "order_sent_tracking" && !trackingCode.trim()) {
      notifyError(t("admin.order.trackingRequiredForEmail"));
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
        paymentFlow:
          emailType === "quote_confirmation" ? paymentFlow : null,
      });
      notifySuccess(t("admin.order.emailSent"));
    } catch (err: any) {
      console.error(err);
      notifyError(
        err?.response?.data?.message || t("admin.order.emailSendFailed"),
      );
    } finally {
      setSendingEmail(false);
    }
  };

  const reconcileOrderPayments = async () => {
    if (!id) return;

    setReconcilingPayments(true);
    try {
      const res = await api.post<{ started: boolean; message: string }>(
        `/admin/orders/${id}/payments/reconcile`,
      );
      await refresh();

      if (res.data?.started) {
        notifySuccess(
          res.data?.message || t("admin.order.reconcilePaymentsSuccess"),
        );
      } else {
        notifyError(
          res.data?.message || t("admin.order.reconcilePaymentsAlreadyRunning"),
        );
      }
    } catch (err: any) {
      console.error(err);
      notifyError(
        err?.response?.data?.message ||
          t("admin.order.reconcilePaymentsFailed"),
      );
    } finally {
      setReconcilingPayments(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-shell flex items-center justify-center">
        {t("admin.order.loading")}
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
    subtotal + deliveryPrice + serviceFee - orderDiscountAmount,
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
  const allOrderNotes = Array.isArray(order.notes) ? order.notes : [];
  const internalNotes = allOrderNotes
    .filter((note) => note.visibility === "internal")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const customerNotes = allOrderNotes
    .filter((note) => note.visibility === "customer")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const hasLegacyInternalNote =
    internalNotes.length === 0 &&
    String(order.internalNotes || "").trim().length > 0;
  const hasLegacyCustomerNote =
    customerNotes.length === 0 &&
    String(order.customerNotes || "").trim().length > 0;
  const hasTrackingInfo =
    String(trackingCode || order.trackingCode || "").trim().length > 0;
  const hasPaymentAttempts = payments.length > 0;
  const hasPaidPayment =
    !!order.isPaid ||
    payments.some(
      (payment) => String(payment.status || "").toLowerCase() === "paid",
    );
  const actionFlow = buildAdminActionFlow(
    {
      status: currentStatus,
      hasUnpricedItems,
      hasShippingInfo,
      hasQuoteMessage,
      hasPaymentAttempts,
      hasPaidPayment,
      hasTrackingInfo,
    },
    t,
  );

  return (
    <AdminLayout>
      <AdminBreadcrumb
        title={`${t("admin.order.titlePrefix")} ${order.id.slice(0, 8)}`}
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
            {formatCurrencyAmount(totalPrice)}
          </p>
        </article>
        <article className="admin-panel p-4">
          <p className="text-xs uppercase text-[#6c817a]">
            {t("admin.order.quoteExpires")}
          </p>
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
            serviceFee={serviceFee}
            setServiceFee={setServiceFee}
            savingServiceFee={savingServiceFee}
            updateServiceFee={updateServiceFee}
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
                {t("admin.order.actionFlowTitle")}
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
                    {check.ok
                      ? t("admin.order.checkOk")
                      : t("admin.order.checkTodo")}{" "}
                    - {check.label}
                  </p>
                ))}
              </div>

              <p className="mt-3 text-xs text-[#5f736d]">
                {t("admin.order.suggestedNextStatus")}:{" "}
                <strong>{actionFlow.suggestedStatus}</strong>
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
                <>
                  <div>
                    <label className="block text-xs uppercase text-[#6c817a]">
                      {t("admin.order.paymentFlowLabel")}
                    </label>
                    <select
                      value={paymentFlow}
                      onChange={(e) => setPaymentFlow(e.target.value)}
                      className="admin-select"
                    >
                      <option value="stripe">
                        {t("admin.order.paymentFlowStripe")}
                      </option>
                      <option value="bank_transfer">
                        {t("admin.order.paymentFlowBankTransfer")}
                      </option>
                    </select>
                  </div>
                  <p className="text-sm text-[#5b706a]">
                    {paymentFlow === "bank_transfer"
                      ? t("admin.order.emailBankTransferNote")
                      : t("admin.order.emailConfirmationNote")}
                  </p>
                </>
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
                <label className="block text-xs font-semibold text-[#5f736d]">
                  {t("admin.order.internalNotesLabel")}
                </label>
                <textarea
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  rows={3}
                  className="admin-textarea"
                  placeholder={t("admin.order.internalNotesPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => addNote("internal")}
                  disabled={addingInternalNote}
                  className="admin-btn admin-btn-secondary mt-2"
                >
                  {addingInternalNote
                    ? t("admin.order.savingButton")
                    : t("admin.order.addInternalNoteButton")}
                </button>
              </div>

              {internalNotes.length === 0 ? (
                hasLegacyInternalNote ? (
                  <div className="rounded-lg border border-[#dce7e2] bg-[#f7fbf9] p-3">
                    <p className="text-sm text-[#2e423d] whitespace-pre-wrap">
                      {order.internalNotes}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-[#6c817a]">
                        {t("admin.order.legacyNoteLabel")}
                      </p>
                      <button
                        type="button"
                        onClick={() => deleteNote("legacy-internal")}
                        disabled={deletingNoteId === "legacy-internal"}
                        className="text-xs text-rose-700 hover:underline disabled:opacity-60"
                      >
                        {t("admin.order.deleteNoteButton")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#5f736d]">
                    {t("admin.order.noInternalNotes")}
                  </p>
                )
              ) : (
                <div className="space-y-2">
                  {internalNotes.map((note: OrderNote) => (
                    <div
                      key={note.id}
                      className="rounded-lg border border-[#dce7e2] bg-[#f7fbf9] p-3"
                    >
                      <p className="text-sm text-[#2e423d] whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-[#6c817a]">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                        {note.id !== "00000000-0000-0000-0000-000000000000" && (
                          <button
                            type="button"
                            onClick={() => deleteNote(note.id)}
                            disabled={deletingNoteId === note.id}
                            className="text-xs text-rose-700 hover:underline disabled:opacity-60"
                          >
                            {t("admin.order.deleteNoteButton")}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#5f736d]">
                  {t("admin.order.customerNotesLabel")}
                </label>
                <textarea
                  value={customerNoteInput}
                  onChange={(e) => setCustomerNoteInput(e.target.value)}
                  rows={3}
                  className="admin-textarea"
                  placeholder={t("admin.order.customerNotesPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => addNote("customer")}
                  disabled={addingCustomerNote}
                  className="admin-btn admin-btn-primary mt-2"
                >
                  {addingCustomerNote
                    ? t("admin.order.savingButton")
                    : t("admin.order.addCustomerNoteButton")}
                </button>
              </div>

              {customerNotes.length === 0 ? (
                hasLegacyCustomerNote ? (
                  <div className="rounded-lg border border-[#dce7e2] bg-[#f7fbf9] p-3">
                    <p className="text-sm text-[#2e423d] whitespace-pre-wrap">
                      {order.customerNotes}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-[#6c817a]">
                        {t("admin.order.legacyNoteLabel")}
                      </p>
                      <button
                        type="button"
                        onClick={() => deleteNote("legacy-customer")}
                        disabled={deletingNoteId === "legacy-customer"}
                        className="text-xs text-rose-700 hover:underline disabled:opacity-60"
                      >
                        {t("admin.order.deleteNoteButton")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#5f736d]">
                    {t("admin.order.noCustomerNotes")}
                  </p>
                )
              ) : (
                <div className="space-y-2">
                  {customerNotes.map((note: OrderNote) => (
                    <div
                      key={note.id}
                      className="rounded-lg border border-[#dce7e2] bg-[#f7fbf9] p-3"
                    >
                      <p className="text-sm text-[#2e423d] whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-[#6c817a]">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                        {note.id !== "00000000-0000-0000-0000-000000000000" && (
                          <button
                            type="button"
                            onClick={() => deleteNote(note.id)}
                            disabled={deletingNoteId === note.id}
                            className="text-xs text-rose-700 hover:underline disabled:opacity-60"
                          >
                            {t("admin.order.deleteNoteButton")}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">
              {t("admin.order.paymentAttempts")}
            </h3>
            <p className="mb-3 text-xs text-[#5f736d]">
              {t("admin.order.paymentAttemptsHelp")}
            </p>
            <button
              type="button"
              onClick={reconcileOrderPayments}
              disabled={reconcilingPayments}
              className="admin-btn admin-btn-secondary mb-3"
            >
              {reconcilingPayments ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  {t("admin.order.reconcilingPayments")}
                </span>
              ) : (
                t("admin.order.checkPaymentStatusButton")
              )}
            </button>
            <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              <input
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="admin-field"
                placeholder={t("admin.order.paymentSearchPlaceholder")}
              />
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">{t("admin.payments.status.all")}</option>
                <option value="paid">{t("admin.payments.status.paid")}</option>
                <option value="failed">
                  {t("admin.payments.status.failed")}
                </option>
                <option value="expired">
                  {t("admin.payments.status.expired")}
                </option>
                <option value="canceled">
                  {t("admin.payments.status.canceled")}
                </option>
                <option value="pending">
                  {t("admin.payments.status.pending")}
                </option>
                <option value="open">{t("admin.payments.status.open")}</option>
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
              <p className="text-sm text-[#5b706a]">
                {t("admin.order.noPaymentAttempts")}
              </p>
            ) : filteredPayments.length === 0 ? (
              <p className="text-sm text-[#5b706a]">
                {t("admin.order.noPaymentAttemptsFiltered")}
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
                      {`${payment.currency || ""} ${Number(payment.amount || 0).toFixed(2)}`.trim()}
                    </p>
                    <p className="text-xs text-[#6c817a] mt-1">
                      {t("admin.order.webhookAttempts")}:{" "}
                      {payment.webhookAttemptCount || 0}
                    </p>
                    {payment.providerPaymentId && (
                      <p className="text-xs text-[#6c817a] mt-1 break-all">
                        {t("admin.order.providerId")}:{" "}
                        {payment.providerPaymentId}
                      </p>
                    )}
                    {payment.lastWebhookPayloadHash && (
                      <p className="text-xs text-[#6c817a] mt-1 break-all">
                        {t("admin.order.payloadHash")}:{" "}
                        {payment.lastWebhookPayloadHash}
                      </p>
                    )}
                    {payment.lastWebhookError && (
                      <p className="text-xs text-rose-700 mt-1 break-words">
                        {t("admin.order.lastError")}: {payment.lastWebhookError}
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
              {internalNotes.length > 0
                ? internalNotes[0].content
                : order.internalNotes || t("admin.order.noneValue")}
            </p>
            <p className="text-sm text-[#5b706a]">
              {t("admin.order.customerNotesLabel")}:{" "}
              {customerNotes.length > 0
                ? customerNotes[0].content
                : order.customerNotes || t("admin.order.noneValue")}
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

function buildAdminActionFlow(
  input: AdminActionFlowInput,
  t: (key: string) => string,
): AdminActionFlow {
  const baseChecks = [
    {
      label: t("admin.order.actionFlow.checks.allItemPricesSet"),
      ok: !input.hasUnpricedItems,
    },
    {
      label: t("admin.order.actionFlow.checks.shippingDetailsComplete"),
      ok: input.hasShippingInfo,
    },
    {
      label: t("admin.order.actionFlow.checks.quoteMessagePresent"),
      ok: input.hasQuoteMessage,
    },
    {
      label: t("admin.order.actionFlow.checks.paymentAttemptExists"),
      ok: input.hasPaymentAttempts,
    },
    {
      label: t("admin.order.actionFlow.checks.paidPaymentConfirmed"),
      ok: input.hasPaidPayment,
    },
    {
      label: t("admin.order.actionFlow.checks.trackingCodeAdded"),
      ok: input.hasTrackingInfo,
    },
  ];

  switch (input.status) {
    case "pending_quote":
      return {
        title: t("admin.order.actionFlow.pendingQuote.title"),
        steps: [
          t("admin.order.actionFlow.pendingQuote.steps.reviewModels"),
          t("admin.order.actionFlow.pendingQuote.steps.setItemPrice"),
          t("admin.order.actionFlow.pendingQuote.steps.setDeliveryPrice"),
          t("admin.order.actionFlow.pendingQuote.steps.addQuoteMessage"),
          t("admin.order.actionFlow.pendingQuote.steps.sendQuoteConfirmation"),
        ],
        checks: [baseChecks[0], baseChecks[2]],
        suggestedStatus: "quoted",
      };

    case "quoted":
      return {
        title: t("admin.order.actionFlow.quoted.title"),
        steps: [
          t("admin.order.actionFlow.quoted.steps.keepPricingStable"),
          t("admin.order.actionFlow.quoted.steps.monitorExpiry"),
          t("admin.order.actionFlow.quoted.steps.waitForPayment"),
          t("admin.order.actionFlow.quoted.steps.repriceIfChanged"),
        ],
        checks: [baseChecks[3], baseChecks[4]],
        suggestedStatus: input.hasPaidPayment ? "paid" : "quoted",
      };

    case "expired_quote":
      return {
        title: t("admin.order.actionFlow.expiredQuote.title"),
        steps: [
          t("admin.order.actionFlow.expiredQuote.steps.noFulfillment"),
          t("admin.order.actionFlow.expiredQuote.steps.requestRefresh"),
          t("admin.order.actionFlow.expiredQuote.steps.recalculate"),
        ],
        checks: [baseChecks[0], baseChecks[2]],
        suggestedStatus: "pending_quote",
      };

    case "pending_payment":
      return {
        title: t("admin.order.actionFlow.pendingPayment.title"),
        steps: [
          t("admin.order.actionFlow.pendingPayment.steps.checkAttempts"),
          t("admin.order.actionFlow.pendingPayment.steps.proceedWhenPaid"),
          t("admin.order.actionFlow.pendingPayment.steps.returnToQuote"),
        ],
        checks: [baseChecks[3], baseChecks[4]],
        suggestedStatus: input.hasPaidPayment ? "paid" : "pending_payment",
      };

    case "paid":
      return {
        title: t("admin.order.actionFlow.paid.title"),
        steps: [
          t("admin.order.actionFlow.paid.steps.confirmPayment"),
          t("admin.order.actionFlow.paid.steps.confirmCapacity"),
          t("admin.order.actionFlow.paid.steps.startProduction"),
        ],
        checks: [baseChecks[4]],
        suggestedStatus: "printing",
      };

    case "printing":
      return {
        title: t("admin.order.actionFlow.printing.title"),
        steps: [
          t("admin.order.actionFlow.printing.steps.completeQualityChecks"),
          t("admin.order.actionFlow.printing.steps.createLabel"),
          t("admin.order.actionFlow.printing.steps.sendTracking"),
        ],
        checks: [baseChecks[5]],
        suggestedStatus: input.hasTrackingInfo ? "sent" : "printing",
      };

    case "sent":
    case "shipped":
      return {
        title: t("admin.order.actionFlow.shipped.title"),
        steps: [
          t("admin.order.actionFlow.shipped.steps.verifyTracking"),
          t("admin.order.actionFlow.shipped.steps.monitorCarrier"),
          t("admin.order.actionFlow.shipped.steps.markDelivered"),
        ],
        checks: [baseChecks[5]],
        suggestedStatus: "delivered",
      };

    case "delivered":
      return {
        title: t("admin.order.actionFlow.delivered.title"),
        steps: [
          t("admin.order.actionFlow.delivered.steps.confirmDelivery"),
          t("admin.order.actionFlow.delivered.steps.handleSupport"),
          t("admin.order.actionFlow.delivered.steps.closeOrder"),
        ],
        checks: [baseChecks[5]],
        suggestedStatus: "completed",
      };

    case "completed":
      return {
        title: t("admin.order.actionFlow.completed.title"),
        steps: [
          t("admin.order.actionFlow.completed.steps.noActionRequired"),
          t("admin.order.actionFlow.completed.steps.reopenIfNeeded"),
        ],
        checks: [],
        suggestedStatus: "completed",
      };

    case "failed":
      return {
        title: t("admin.order.actionFlow.failed.title"),
        steps: [
          t("admin.order.actionFlow.failed.steps.reviewErrors"),
          t("admin.order.actionFlow.failed.steps.contactCustomer"),
          t("admin.order.actionFlow.failed.steps.returnFlow"),
        ],
        checks: [baseChecks[3]],
        suggestedStatus: "pending_quote",
      };

    case "cancelled":
      return {
        title: t("admin.order.actionFlow.cancelled.title"),
        steps: [
          t("admin.order.actionFlow.cancelled.steps.noFulfillment"),
          t("admin.order.actionFlow.cancelled.steps.documentReason"),
        ],
        checks: [],
        suggestedStatus: "cancelled",
      };

    default:
      return {
        title: t("admin.order.actionFlow.default.title"),
        steps: [
          t("admin.order.actionFlow.default.steps.checkDetails"),
          t("admin.order.actionFlow.default.steps.selectAfterChecks"),
        ],
        checks: [baseChecks[0], baseChecks[3], baseChecks[4]],
        suggestedStatus: "pending_quote",
      };
  }
}
