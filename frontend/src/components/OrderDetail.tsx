import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from "lucide-react";
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
import OrderItemsCard from "./order-detail/OrderItemsCard";
import OrderTimeline from "./order-detail/OrderTimeline";
import OrderSidebar from "./order-detail/OrderSidebar";
import ShippingModal from "./order-detail/ShippingModal";
import type { ShippingDetails, ShippingField } from "./order-detail/types";
import {
  buildPriceSummary,
  buildStatusSummary,
  getReachedDate,
} from "./order-detail/utils";
import { normalizeOrderStatus } from "../utils/orderStatus";

const EMPTY_SHIPPING_DETAILS: ShippingDetails = {
  fullName: "",
  phoneNumber: "",
  addressLine1: "",
  city: "",
  postalCode: "",
};

function getShippingDetailsFromOrder(order: Order | null): ShippingDetails {
  return {
    fullName: order?.fullName || "",
    phoneNumber: order?.phoneNumber || "",
    addressLine1: order?.addressLine1 || "",
    city: order?.city || "",
    postalCode: order?.postalCode || "",
  };
}

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
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>(
    EMPTY_SHIPPING_DETAILS,
  );
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
        setShippingDetails(getShippingDetailsFromOrder(res.data));
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

    setShippingDetails(getShippingDetailsFromOrder(order));
    setShippingErrors({});
    setShowShippingModal(true);
  };

  const handleShippingField = (field: ShippingField, value: string) => {
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

  const priceSummary = buildPriceSummary(order);
  const statusSummary = buildStatusSummary(order, t);
  const reachedDate = getReachedDate(order);

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

          {priceSummary.isPendingQuote && (
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

          {normalizeOrderStatus(order.status) === "quoted" && (
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
            <OrderItemsCard
              order={order}
              isPendingQuote={priceSummary.isPendingQuote}
              t={t}
            />
            <OrderTimeline
              statusStep={statusSummary.step}
              currentStatus={order.status}
              reachedDate={reachedDate}
              t={t}
            />
          </div>

          <OrderSidebar
            order={order}
            priceSummary={priceSummary}
            statusLabel={statusSummary.label}
            t={t}
          />
        </div>
      </main>

      <ShippingModal
        open={showShippingModal}
        shippingDetails={shippingDetails}
        shippingErrors={shippingErrors}
        isPaying={isPaying}
        t={t}
        onFieldChange={handleShippingField}
        onCancel={() => setShowShippingModal(false)}
        onCheckout={handleSaveAddressAndCheckout}
      />
      <Footer />
    </div>
  );
}
