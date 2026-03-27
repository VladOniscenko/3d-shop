import Navbar from "./Navbar";
import {
  Upload,
  Settings2,
  Printer,
  PackageCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import Footer from "./Footer";

export default function HowItWorksPage() {
  const { t } = useI18n();
  const detailedSteps = [
    {
      number: 1,
      icon: <Upload size={40} className="text-emerald-600" />,
      title: t("how.pageStep1Title"),
      desc: t("how.pageStep1Desc"),
    },
    {
      number: 2,
      icon: <Settings2 size={40} className="text-emerald-600" />,
      title: t("how.pageStep2Title"),
      desc: t("how.pageStep2Desc"),
    },
    {
      number: 3,
      icon: <Printer size={40} className="text-emerald-600" />,
      title: t("how.pageStep3Title"),
      desc: t("how.pageStep3Desc"),
    },
    {
      number: 4,
      icon: <PackageCheck size={40} className="text-emerald-600" />,
      title: t("how.pageStep4Title"),
      desc: t("how.pageStep4Desc"),
    },
  ];

  return (
    <div className="site-shell font-sans text-gray-900 flex flex-col">
      <Navbar />

      {/* Page Header */}
      <header className="site-page-hero reveal-soft">
        <div className="site-page-hero-card reveal-up">
          <h1 className="site-page-hero-title">{t("how.pageTitle")}</h1>
          <p className="site-page-hero-subtitle">{t("how.pageSubtitle")}</p>
        </div>
      </header>

      <main className="site-main max-w-5xl px-4 sm:px-6 py-12 flex-grow reveal-up stagger-1">
        {/* The Step-by-Step List */}
        <div className="space-y-7">
          {detailedSteps.map((step) => (
            <div
              key={step.number}
              className="site-card reveal-up stagger-2 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-start gap-7"
            >
              {/* Icon & Number Circle */}
              <div className="shrink-0 relative">
                <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                  {step.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#0f766e] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                  {step.number}
                </div>
              </div>

              {/* Text Content */}
              <div>
                <h2 className="text-2xl font-bold text-[#1b2c27] mb-3">
                  {step.title}
                </h2>
                <p className="text-[#5f726c] leading-relaxed text-lg">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quality Guarantee Box */}
        <div className="site-card reveal-up stagger-3 mt-12 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border-[#d4e5de] bg-gradient-to-r from-[#f8fdfa] to-[#eef7f3]">
          <div className="shrink-0 bg-white p-4 rounded-full shadow-sm border border-[#deebe6]">
            <CheckCircle2 size={48} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2 text-[#1b2c27]">
              {t("how.promiseTitle")}
            </h3>
            <p className="text-[#5f726c] mb-6">{t("how.promiseDesc")}</p>
            <Link to="/quote" className="site-btn-primary gap-2">
              {t("how.promiseCta")} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
