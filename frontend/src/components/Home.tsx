import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import ModelDiscoveryCards from "./ModelDiscoveryCards";
import MaterialsSection from "./MaterialsSection";
import RecentPrints from "./RecentPrints";
import Footer from "./Footer";
import api from "../services/api";
import { useI18n } from "../i18n/I18nContext";
import type { ActiveQuotePromotion } from "../types";

export default function Home() {
  const { language, t } = useI18n();
  const [promotion, setPromotion] = useState<ActiveQuotePromotion | null>(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const res = await api.get<ActiveQuotePromotion>(
          "/promotions/quote/active",
        );
        if (res.data?.isActive) {
          setPromotion(res.data);
        } else {
          setPromotion(null);
        }
      } catch {
        setPromotion(null);
      }
    };

    fetchPromotion();
  }, []);

  const bannerText =
    language === "nl"
      ? promotion?.bannerTextNl || promotion?.bannerTextEn
      : promotion?.bannerTextEn || promotion?.bannerTextNl;

  return (
    <div className="site-shell font-sans text-gray-900 selection:bg-emerald-100">
      <Navbar />
      <main className="site-main px-2 sm:px-4 py-10 space-y-10">
        <Hero />
        <ModelDiscoveryCards />
        {promotion?.isActive && bannerText ? (
          <section className="rounded-2xl border border-[#bfd8cc] bg-gradient-to-r from-[#eaf8f1] via-[#f3fbf7] to-[#e8f5ff] p-4 sm:p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] font-semibold text-[#2b5a47]">
              {t("home.promo.badge")}
            </p>
            <p className="mt-1 text-sm sm:text-base font-semibold text-[#163128]">
              {bannerText}
            </p>
          </section>
        ) : null}
        <section className="site-section p-6 sm:p-8">
          <HowItWorks />
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-12">
          <div className="site-section p-6 sm:p-8">
            <MaterialsSection />
          </div>
          <div className="site-section p-6 sm:p-8">
            <RecentPrints />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
