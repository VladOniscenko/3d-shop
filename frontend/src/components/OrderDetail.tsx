import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  Box,
  Calendar,
  MessageSquare,
  Loader2,
  Layers,
  Palette,
  MapPin,
  User,
  XCircle,
  Phone,
  Hash,
  Truck,
  Tag,
} from "lucide-react";
import Navbar from "./Navbar";
import api from "../services/api";
import type { Order } from "../types";
import {
  normalizeShippingInfo,
  validateShippingInfo,
} from "../utils/shippingValidation";
import { useI18n } from "../i18n/I18nContext";
import Footer from "./Footer";
import { useNotify } from "../context/NotifyContext";

export default function OrderDetail() {
  const { t } = useI18n();
  const { notifyError, notifySuccess } = useNotify();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    city: "",
    postalCode: "",
  });
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
        setShippingDetails({
          fullName: res.data?.fullName || "",
          phoneNumber: res.data?.phoneNumber || "",
          addressLine1: res.data?.addressLine1 || "",
          city: res.data?.city || "",
          postalCode: res.data?.postalCode || "",
        });
      } catch (err) {
        console.error("Error fetching order", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrderDetails();
  }, [id]);

  const handleDeleteQuote = async () => {
    const confirmCancel = window.confirm(t("orderDetail.deleteQuote") + "?");

    if (!confirmCancel) return;

    setIsCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      notifySuccess(t("orderDetail.deleteQuote"));
      navigate("/orders");
    } catch (err) {
      notifyError(t("gallery.addFailed"));
      console.error(err);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmAndPay = async () => {
    if (!id) return;

    setShippingDetails({
      fullName: order?.fullName || "",
      phoneNumber: order?.phoneNumber || "",
      addressLine1: order?.addressLine1 || "",
      city: order?.city || "",
      postalCode: order?.postalCode || "",
    });
    setShippingErrors({});
    setShowShippingModal(true);
  };

  const handleShippingField = (
    field: "fullName" | "phoneNumber" | "addressLine1" | "city" | "postalCode",
    value: string,
  ) => {
    setShippingDetails((prev) => ({ ...prev, [field]: value }));
    if (shippingErrors[field]) {
      const next = { ...shippingErrors };
      delete next[field];
      setShippingErrors(next);
    }
  };

  const handleSaveAddressAndCheckout = async () => {
    if (!id) return;

    const errors = validateShippingInfo(shippingDetails);
    setShippingErrors(errors);
    if (Object.keys(errors).length > 0) {
      notifyError(t("quote.invalidShipping"));
      return;
    }

    setIsPaying(true);
    try {
      const shippingPayload = normalizeShippingInfo(shippingDetails);
      await api.put(`/orders/${id}/shipping`, shippingPayload);

      const res = await api.post(`/payments/orders/${id}/create`);
      if (res.data?.checkoutUrl) {
        setShowShippingModal(false);
        window.location.href = res.data.checkoutUrl;
        return;
      }

      throw new Error("No checkout URL received from server");
    } catch (err: any) {
      console.error("Quoted payment checkout error", err);

      const apiErrors = err?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        setShippingErrors(apiErrors);
      }

      notifyError(
        err?.response?.data?.message || t("orderDetail.paymentStartFailed"),
      );
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{t("orderDetail.notFound")}</h2>
        <button
          onClick={() => navigate("/orders")}
          className="text-emerald-700 font-bold underline"
        >
          {t("orderDetail.back")}
        </button>
      </div>
    );
  }

  const hasMissingPrice = order.items.some(
    (item) => item.price == null || item.price <= 0,
  );

  const totalPrice = hasMissingPrice
    ? 0
    : order.items.reduce((sum, item) => sum + item.price, 0) +
      (order.deliveryPrice ?? 0);

  const statusLabel = (() => {
    switch (order.status.toLowerCase()) {
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

  const displayTotal =
    order.quotedPrice && order.quotedPrice > 0 ? order.quotedPrice : totalPrice;

  const statusStep = (() => {
    switch (order.status.toLowerCase()) {
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

  const reachedDate = new Date(
    order.updatedAt || order.createdAt,
  ).toLocaleDateString();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            {t("orderDetail.back")}
          </button>

          {order.status === "pending_quote" && (
            <button
              onClick={handleDeleteQuote}
              disabled={isCancelling}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
            >
              {isCancelling ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <XCircle size={18} />
              )}
              {t("orderDetail.deleteQuote")}
            </button>
          )}

          {order.status === "quoted" && (
            <button
              onClick={handleConfirmAndPay}
              disabled={isPaying}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 border border-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
            >
              {isPaying ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              {t("orderDetail.confirmPay")}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Items List */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t("orderDetail.modelsInProject")}
              </h2>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                        <Box className="text-emerald-600" size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-gray-900 truncate">
                            {item.fileName}
                          </p>
                          {/* ITEM PRICE IF SET */}
                          {item.price > 0 && (
                            <span className="font-bold text-emerald-700">
                              €{item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <Layers size={12} /> {item.material}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded">
                            <Palette size={12} /> {item.color}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            <Hash size={12} /> x{item.count || 1}
                          </span>
                        </div>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="flex items-start gap-2 text-sm text-gray-500 italic bg-white/50 p-3 rounded-lg">
                        <MessageSquare size={14} className="mt-1 shrink-0" />"
                        {item.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-8">
                {t("orderDetail.timeline")}
              </h3>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:bg-gray-100">
                <TimelineItem
                  icon={<FileText size={16} />}
                  title={t("orderDetail.quoteRequested")}
                  date={
                    statusStep >= 1 ? reachedDate : t("orderDetail.pending")
                  }
                  active={statusStep >= 1}
                />
                <TimelineItem
                  icon={<Clock size={16} />}
                  title={t("orderStatus.quoted")}
                  date={
                    statusStep >= 2 ? reachedDate : t("orderDetail.pending")
                  }
                  active={statusStep >= 2}
                />
                <TimelineItem
                  icon={<CheckCircle2 size={16} />}
                  title={t("orderStatus.paid")}
                  date={
                    statusStep >= 3 ? reachedDate : t("orderDetail.pending")
                  }
                  active={statusStep >= 3}
                />
                <TimelineItem
                  icon={<Clock size={16} />}
                  title={t("orderDetail.printing")}
                  date={
                    statusStep >= 4 ? reachedDate : t("orderDetail.pending")
                  }
                  active={statusStep >= 4}
                />
                <TimelineItem
                  icon={<CheckCircle2 size={16} />}
                  title={t("orderDetail.completed")}
                  date={
                    statusStep >= 5 ? reachedDate : t("orderDetail.pending")
                  }
                  active={statusStep >= 5}
                />
                <TimelineItem
                  icon={<Truck size={16} />}
                  title={t("orderStatus.sent")}
                  date={
                    statusStep >= 6 ? reachedDate : t("orderDetail.pending")
                  }
                  active={statusStep >= 6}
                />
              </div>
            </div>
          </div>

          {/* Sidebar: Address & Pricing Info */}
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

                {/* PRICING SECTION IN SIDEBAR */}
                <div className="pt-6 mt-2 border-t border-white/10 space-y-3">
                  {/* Delivery Price (Assume DeliveryPrice exists in your Order model, otherwise replace with fixed value or condition) */}
                  <div className="flex justify-between items-center text-emerald-100/70">
                    <span className="flex items-center gap-2">
                      <Truck size={14} /> {t("orderDetail.delivery")}
                    </span>
                    <span>
                      {order.deliveryPrice && order.deliveryPrice > 0
                        ? "€" + order.deliveryPrice
                        : t("orderDetail.toBeCalculated")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xl font-bold text-white pt-2">
                    <span className="flex items-center gap-2">
                      <Tag size={18} className="text-emerald-400" />{" "}
                      {t("orderDetail.total")}
                    </span>
                    <span className="text-emerald-400">
                      {displayTotal > 0
                        ? `€${displayTotal.toFixed(2)}`
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
        </div>
      </main>

      {showShippingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("orderDetail.shippingModalTitle")}
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              {t("orderDetail.shippingModalSubtitle")}
            </p>

            <div className="space-y-3">
              <div>
                <input
                  placeholder={t("quote.fullName")}
                  className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${
                    shippingErrors.fullName
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-200 focus:ring-emerald-500"
                  }`}
                  value={shippingDetails.fullName}
                  onChange={(e) =>
                    handleShippingField("fullName", e.target.value)
                  }
                />
                {shippingErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {shippingErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="tel"
                  placeholder={t("quote.phone")}
                  className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${
                    shippingErrors.phoneNumber
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-200 focus:ring-emerald-500"
                  }`}
                  value={shippingDetails.phoneNumber}
                  onChange={(e) =>
                    handleShippingField("phoneNumber", e.target.value)
                  }
                />
                {shippingErrors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {shippingErrors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <input
                  placeholder={t("quote.street")}
                  className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${
                    shippingErrors.addressLine1
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-200 focus:ring-emerald-500"
                  }`}
                  value={shippingDetails.addressLine1}
                  onChange={(e) =>
                    handleShippingField("addressLine1", e.target.value)
                  }
                />
                {shippingErrors.addressLine1 && (
                  <p className="text-red-500 text-xs mt-1">
                    {shippingErrors.addressLine1}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    placeholder={t("quote.city")}
                    className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${
                      shippingErrors.city
                        ? "border-red-300 focus:ring-red-400"
                        : "border-gray-200 focus:ring-emerald-500"
                    }`}
                    value={shippingDetails.city}
                    onChange={(e) =>
                      handleShippingField("city", e.target.value)
                    }
                  />
                  {shippingErrors.city && (
                    <p className="text-red-500 text-xs mt-1">
                      {shippingErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    placeholder={t("quote.postalCode")}
                    className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${
                      shippingErrors.postalCode
                        ? "border-red-300 focus:ring-red-400"
                        : "border-gray-200 focus:ring-emerald-500"
                    }`}
                    value={shippingDetails.postalCode}
                    onChange={(e) =>
                      handleShippingField("postalCode", e.target.value)
                    }
                  />
                  {shippingErrors.postalCode && (
                    <p className="text-red-500 text-xs mt-1">
                      {shippingErrors.postalCode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isPaying}
                onClick={() => setShowShippingModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                disabled={isPaying}
                onClick={handleSaveAddressAndCheckout}
              >
                {isPaying
                  ? t("orderDetail.shippingModalStarting")
                  : t("orderDetail.shippingModalCheckout")}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

function TimelineItem({ icon, title, date, active }: any) {
  return (
    <div className="relative flex items-center gap-6">
      <div
        className={`z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${active ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"}`}
      >
        {icon}
      </div>
      <div>
        <p
          className={`font-bold text-sm ${active ? "text-gray-900" : "text-gray-400"}`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
  );
}
