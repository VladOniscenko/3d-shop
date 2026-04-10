import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Mail, Search } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../services/api";
import type { Order } from "../types";
import { useI18n } from "../i18n/I18nContext";
import {
  formatOrderStatusLabel,
  getOrderStatusBadgeClass,
  getOrderStatusTranslationKey,
} from "../utils/orderStatus";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const RESEND_COOLDOWN_SECONDS = 60;

function buildCooldownKey(orderId: string, email: string) {
  return `pc_guest_quote_access_resend:${orderId.trim().toLowerCase()}:${email
    .trim()
    .toLowerCase()}`;
}

export default function GuestQuoteAccess() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const initialOrderId = searchParams.get("orderId") || "";
  const initialEmail = searchParams.get("email") || "";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [email, setEmail] = useState(initialEmail);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isRequestingLink, setIsRequestingLink] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [accessError, setAccessError] = useState("");
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null);
  const [cooldownNow, setCooldownNow] = useState(() => Date.now());

  const cooldownKey = useMemo(() => {
    if (!orderId.trim() || !email.trim()) return null;
    return buildCooldownKey(orderId, email);
  }, [email, orderId]);

  const cooldownRemainingSeconds = useMemo(() => {
    if (!cooldownEndsAt) return 0;
    return Math.max(0, Math.ceil((cooldownEndsAt - cooldownNow) / 1000));
  }, [cooldownEndsAt, cooldownNow]);

  const canRequestAccessLink =
    !isRequestingLink && cooldownRemainingSeconds === 0;

  useEffect(() => {
    if (!cooldownKey) {
      setCooldownEndsAt(null);
      return;
    }

    const stored = window.localStorage.getItem(cooldownKey);
    if (!stored) {
      setCooldownEndsAt(null);
      return;
    }

    const parsed = Number.parseInt(stored, 10);
    if (!Number.isFinite(parsed) || parsed <= Date.now()) {
      window.localStorage.removeItem(cooldownKey);
      setCooldownEndsAt(null);
      return;
    }

    setCooldownEndsAt(parsed);
  }, [cooldownKey]);

  useEffect(() => {
    if (!cooldownEndsAt) return;

    setCooldownNow(Date.now());
    const timerId = window.setInterval(() => {
      setCooldownNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [cooldownEndsAt]);

  useEffect(() => {
    const loadOrderByToken = async () => {
      if (!token) return;

      setIsLoadingOrder(true);
      setAccessError("");
      setRequestMessage("");

      try {
        const res = await api.get<Order>("/orders/guest/access", {
          params: { token },
        });
        setOrder(res.data);
      } catch (err: any) {
        setOrder(null);
        setAccessError(
          err?.response?.data?.message || t("quote.guestAccessInvalid"),
        );
      } finally {
        setIsLoadingOrder(false);
      }
    };

    void loadOrderByToken();
  }, [token, t]);

  const statusLabel = useMemo(() => {
    if (!order?.status) return "";
    const translationKey = getOrderStatusTranslationKey(order.status);
    return translationKey
      ? t(translationKey)
      : formatOrderStatusLabel(order.status);
  }, [order?.status, t]);

  const requestAccessLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId.trim()) {
      setRequestMessage(t("quote.guestTrackOrderIdRequired"));
      return;
    }

    if (!email.trim()) {
      setRequestMessage(t("quote.guestTrackEmailRequired"));
      return;
    }

    if (!isValidEmail(email.trim())) {
      setRequestMessage(t("quote.guestTrackEmailInvalid"));
      return;
    }

    setIsRequestingLink(true);
    setRequestMessage("");

    try {
      const res = await api.post("/orders/guest/access-link", {
        orderId: orderId.trim(),
        email: email.trim(),
      });
      const endsAt = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
      if (cooldownKey) {
        window.localStorage.setItem(cooldownKey, String(endsAt));
        setCooldownEndsAt(endsAt);
        setCooldownNow(Date.now());
      }
      setRequestMessage(
        res?.data?.message || t("quote.guestTrackLinkSentGeneric"),
      );
    } catch (err: any) {
      setRequestMessage(
        err?.response?.data?.message || t("quote.guestTrackLinkFailed"),
      );
    } finally {
      setIsRequestingLink(false);
    }
  };

  return (
    <div className="site-shell">
      <Navbar />

      <main className="site-main px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <section className="site-section p-6 sm:p-8">
            <h1 className="site-heading text-3xl font-black">
              {t("quote.guestTrackTitle")}
            </h1>
            <p className="site-subheading mt-2 text-sm sm:text-base">
              {t("quote.guestTrackSubtitle")}
            </p>

            <form
              onSubmit={requestAccessLink}
              className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={t("quote.guestTrackOrderIdPlaceholder")}
                className="md:col-span-1 p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("quote.guestTrackEmailPlaceholder")}
                className="md:col-span-1 p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!canRequestAccessLink}
                className="md:col-span-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0f766e] text-white font-semibold hover:bg-[#0c5b54] disabled:opacity-60"
              >
                {isRequestingLink ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Mail size={16} />
                )}
                {cooldownRemainingSeconds > 0
                  ? t("quote.guestTrackResendWait").replace(
                      "{seconds}",
                      String(cooldownRemainingSeconds),
                    )
                  : t("quote.guestTrackSendLink")}
              </button>
            </form>

            {cooldownRemainingSeconds > 0 && (
              <p className="mt-3 text-xs text-[#60736d]">
                {t("quote.guestTrackResendHint").replace(
                  "{seconds}",
                  String(cooldownRemainingSeconds),
                )}
              </p>
            )}

            {requestMessage && (
              <p className="mt-4 text-sm text-[#1f4339]">{requestMessage}</p>
            )}
          </section>

          <section className="site-section p-6 sm:p-8">
            {isLoadingOrder ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="animate-spin" size={16} />
                <span>{t("quote.guestTrackLoading")}</span>
              </div>
            ) : order ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[#60736d]">
                      {t("quote.guestTrackReference")}
                    </p>
                    <p className="font-bold text-[#163128]">{order.id}</p>
                  </div>
                  <span
                    className={`text-xs font-black px-2 py-1 rounded-md border uppercase ${getOrderStatusBadgeClass(order.status)}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#314941]">
                  <p>
                    <span className="font-semibold">
                      {t("orders.placedOn")}:
                    </span>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">{t("orders.models")}:</span>{" "}
                    {order.items?.length || 0}
                  </p>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div
                      key={item.id || `${item.fileName}-${idx}`}
                      className="rounded-xl border border-[#dce8e2] bg-white p-3"
                    >
                      <p className="font-semibold text-sm text-[#17342b]">
                        {item.fileName || t("quote.textDescription")}
                      </p>
                      <p className="text-xs text-[#5f736d] mt-1">
                        {item.material} · {item.color} · {t("quote.quantity")}:{" "}
                        {item.count}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-[#4e635c] mt-1">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-[#5f736d] flex items-center gap-2">
                <Search size={16} />
                {accessError || t("quote.guestTrackNoActiveSession")}
              </div>
            )}
          </section>

          <p className="text-center text-xs text-[#60736d]">
            <Link
              to="/quote"
              className="text-[#0f766e] font-semibold hover:underline"
            >
              {t("quote.title")}
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
