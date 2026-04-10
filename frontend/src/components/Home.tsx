import Navbar from "./Navbar";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import ModelDiscoveryCards from "./ModelDiscoveryCards";
import MaterialsSection from "./MaterialsSection";
import RecentPrints from "./RecentPrints";
import Footer from "./Footer";
import { useI18n } from "../i18n/I18nContext";
import { ALLOWED_PRODUCT_ORDER } from "../constants";

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="site-shell font-sans text-gray-900 selection:bg-emerald-100">
      <Navbar />
      <main className="site-main px-2 sm:px-4 py-10 space-y-10">
        <Hero />
        <section className="px-1 sm:px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#517069]">
            {t("home.how.bridgeBadge")}
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold text-[#20362f]">
            {t("home.how.bridgeTitle")}
          </p>
          <p className="mt-1 text-sm text-[#5f736d]">
            {t("home.how.bridgeSubtitle")}
          </p>
        </section>
        <section className="site-section p-6 sm:p-8">
          <HowItWorks />
        </section>
        <section className="px-1 sm:px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#517069]">
            {t("home.modelFinder.bridgeBadge")}
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold text-[#20362f]">
            {t("home.modelFinder.bridgeTitle")}
          </p>
          <p className="mt-1 text-sm text-[#5f736d]">
            {t("home.modelFinder.bridgeSubtitle")}
          </p>
        </section>
        <ModelDiscoveryCards />
        <section className="px-1 sm:px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#517069]">
            {t("home.proof.bridgeBadge")}
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold text-[#20362f]">
            {t("home.proof.bridgeTitle")}
          </p>
          <p className="mt-1 text-sm text-[#5f736d]">
            {t("home.proof.bridgeSubtitle")}
          </p>
        </section>
        <section
          className={`grid grid-cols-1 gap-6 items-start pb-12 ${
            ALLOWED_PRODUCT_ORDER ? "lg:grid-cols-2" : ""
          }`}
        >
          <div className="site-section p-6 sm:p-8">
            <MaterialsSection />
          </div>
          {ALLOWED_PRODUCT_ORDER && (
            <div className="site-section p-6 sm:p-8">
              <RecentPrints />
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
