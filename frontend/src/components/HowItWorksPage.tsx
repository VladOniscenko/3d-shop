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
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 flex flex-col">
      <Navbar />

      {/* Page Header */}
      <header className="bg-[#133827] py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("how.pageTitle")}
          </h1>
          <p className="text-emerald-50/80 text-lg">{t("how.pageSubtitle")}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 flex-grow">
        {/* The Step-by-Step List */}
        <div className="space-y-12">
          {detailedSteps.map((step) => (
            <div
              key={step.number}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start gap-8"
            >
              {/* Icon & Number Circle */}
              <div className="shrink-0 relative">
                <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                  {step.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#133827] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                  {step.number}
                </div>
              </div>

              {/* Text Content */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quality Guarantee Box */}
        <div className="mt-16 bg-stone-100 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-stone-200">
          <div className="shrink-0 bg-white p-4 rounded-full shadow-sm">
            <CheckCircle2 size={48} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">{t("how.promiseTitle")}</h3>
            <p className="text-gray-600 mb-6">{t("how.promiseDesc")}</p>
            <Link
              to="/quote"
              className="inline-flex items-center gap-2 font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              {t("how.promiseCta")} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 text-center text-gray-500 text-sm">
        <p>© 2026 PrintCraft Collective. All rights reserved.</p>
      </footer>
    </div>
  );
}
