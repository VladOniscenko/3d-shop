import { Upload, Settings2, Printer, PackageCheck } from "lucide-react";
import { Link } from "react-router-dom"; // 1. Import Link
import type { StepItem } from "../types";
import { useI18n } from "../i18n/I18nContext";

export default function HowItWorks() {
  const { t } = useI18n();

  const steps: StepItem[] = [
    {
      number: 1,
      icon: <Upload size={32} />,
      title: t("how.step1.title"),
      desc: t("how.step1.desc"),
    },
    {
      number: 2,
      icon: <Settings2 size={32} />,
      title: t("how.step2.title"),
      desc: t("how.step2.desc"),
    },
    {
      number: 3,
      icon: <Printer size={32} />,
      title: t("how.step3.title"),
      desc: t("how.step3.desc"),
    },
    {
      number: 4,
      icon: <PackageCheck size={32} />,
      title: t("how.step4.title"),
      desc: t("how.step4.desc"),
    },
  ];

  return (
    <section>
      <h3 className="text-2xl font-bold mb-6">{t("how.title")}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => (
          /* 2. Changed div to Link and added 'block' and 'to' */
          <Link
            key={step.number}
            to="/how-it-works"
            className="block bg-[#f3f4f6] rounded-2xl p-6 relative group hover:bg-white hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="w-8 h-8 bg-[#133827] text-white rounded-full flex items-center justify-center font-bold text-sm absolute top-6 left-6">
              {step.number}
            </div>
            <div className="mt-12 mb-6 flex justify-center text-gray-800 group-hover:scale-110 transition-transform">
              {step.icon}
            </div>
            <h4 className="font-bold text-lg mb-2 text-gray-900">
              {step.title}
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
