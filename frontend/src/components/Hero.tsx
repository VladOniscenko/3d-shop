import { Upload, Box, Clock, Leaf } from "lucide-react";
import { Link } from "react-router-dom"; // 1. Add this import
import { useI18n } from "../i18n/I18nContext";

export default function Hero() {
  const { t } = useI18n();
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <section className="rounded-[2rem] p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden bg-gradient-to-br from-[#12382b] via-[#0f5144] to-[#0a645e] shadow-[0_28px_50px_rgba(12,56,43,0.28)]">
      {/* Left Content */}
      <div className="lg:w-1/2 text-white z-10 space-y-8">
        <div className="space-y-4 max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
            {t("hero.titleLine1")}
            <br />
            {t("hero.titleLine2")}
          </h1>
          <p className="text-emerald-50/85 text-lg leading-relaxed max-w-md">
            {t("hero.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* 2. Changed to Link and pointed to /upload */}
          <Link
            to={isLoggedIn ? "/quote" : "/signup"}
            className="site-btn-primary gap-2"
          >
            <Upload size={20} />{" "}
            {isLoggedIn ? t("hero.ctaQuote") : t("nav.getStarted")}
          </Link>
        </div>

        {/* ... The rest of your Hero code (Clock, Box, Leaf) stays exactly the same ... */}
        <div className="flex flex-wrap gap-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-emerald-400" />
            <div>
              <p className="font-semibold text-sm">
                {t("hero.fastTurnaround")}
              </p>
              <p className="text-xs text-white/60">
                {t("hero.fastTurnaroundValue")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Box size={24} className="text-emerald-400" />
            <div>
              <p className="font-semibold text-sm">{t("hero.highQuality")}</p>
              <p className="text-xs text-white/60">
                {t("hero.highQualityValue")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Leaf size={24} className="text-emerald-400" />
            <div>
              <p className="font-semibold text-sm">{t("hero.eco")}</p>
              <p className="text-xs text-white/60">{t("hero.ecoValue")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Illustration */}
      <div className="lg:w-1/2 w-full h-[300px] lg:h-[400px] relative z-10 flex justify-center items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl"></div>
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full max-w-md drop-shadow-2xl"
        >
          <rect
            x="150"
            y="20"
            width="220"
            height="240"
            rx="16"
            fill="#e5e7eb"
          />
          <rect x="160" y="30" width="200" height="220" rx="8" fill="#d1d5db" />
          <rect x="175" y="60" width="170" height="150" rx="4" fill="#374151" />
          <rect x="175" y="40" width="60" height="12" rx="4" fill="#1f2937" />
          <circle cx="350" cy="45" r="4" fill="#10b981" />
          <rect x="185" y="190" width="150" height="10" rx="2" fill="#9ca3af" />
          <path d="M 230,190 L 290,190 L 280,160 L 240,160 Z" fill="#10b981" />
          <rect x="245" y="60" width="30" height="40" rx="4" fill="#9ca3af" />
          <rect x="255" y="100" width="10" height="10" fill="#6b7280" />
          <path
            d="M 280,280 Q 290,200 310,200 Q 330,200 340,280 Z"
            fill="#059669"
          />
          <path d="M 340,280 L 390,280 L 370,180 L 350,180 Z" fill="#e7e5e4" />
          <circle cx="230" cy="240" r="30" fill="#9ca3af" />
          <path
            d="M 120,280 Q 150,220 180,260 Q 170,180 130,150 Q 100,180 110,220 Q 80,250 120,280 Z"
            fill="#10b981"
          />
        </svg>
      </div>
    </section>
  );
}
