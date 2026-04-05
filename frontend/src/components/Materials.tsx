import { useEffect, useState } from "react";
import { ArrowRight, Box, Loader2, Database, Tag, Info } from "lucide-react";
import Navbar from "./Navbar";
import type { Filament } from "../types"; // Use the new interface name
import api from "../services/api";
import { useI18n } from "../i18n/I18nContext";
import Footer from "./Footer";
import { Link } from "react-router-dom";

export default function Materials() {
  const { t } = useI18n();
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await api.get("/filaments");
        if (Array.isArray(response.data)) {
          setFilaments(response.data);
        } else {
          setFilaments([]);
        }
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const getColorStyle = (hex: string) => {
    // Handle invalid or transparent
    if (!hex || hex.toLowerCase() === "transparent") {
      return { backgroundColor: "transparent", color: "#111827" }; // dark text on transparent
    }

    // Validate hex format (#RRGGBB or #RGB)
    const isValidHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
    if (!isValidHex) {
      return { backgroundColor: "#D1FAE5", color: "#111827" }; // fallback color
    }

    // Compute text color using YIQ
    const textColor = getContrastYIQ(hex);
    return { backgroundColor: hex, color: textColor };
  };

  // YIQ contrast function
  const getContrastYIQ = (hex: string) => {
    let r: number, g: number, b: number;

    if (hex.length === 4) {
      // #RGB format
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else {
      // #RRGGBB format
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }

    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#111827" : "#FFFFFF";
  };

  return (
    <div className="site-shell font-sans text-gray-900">
      <Navbar />

      <header className="site-page-hero reveal-soft">
        <div className="site-page-hero-card reveal-up">
          <h1 className="site-page-hero-title">{t("materials.pageTitle")}</h1>
          <p className="site-page-hero-subtitle">
            {t("materials.pageSubtitle")}
          </p>
        </div>
      </header>

      <main className="site-main px-4 sm:px-6 py-12 reveal-up stagger-1">
        {loading ? (
          <div className="site-card flex flex-col items-center justify-center py-24 text-emerald-800">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-medium">{t("materials.pageLoading")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filaments.map((f) => (
              <div
                key={f.id}
                className="site-card reveal-up rounded-2xl p-6 hover:-translate-y-0.5 hover:shadow-xl transition-all flex flex-col"
              >
                <div className="flex items-center gap-4 mb-6">
                  {/* Visual Color Bubble */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={getColorStyle(f.color)}
                  >
                    <Box size={24} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[#1d2c27] leading-tight">
                      {f.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="site-chip uppercase">{f.material}</span>
                      <span className="text-xs text-[#60736d]">
                        €{f.pricePerGram}/g
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[#5f726c] mb-6 flex-grow text-sm leading-relaxed">
                  {f.description}
                </p>

                {/* Metadata Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-[#e5eeea]">
                  <div className="site-chip">
                    <Database size={12} /> {f.stockQuantity}g{" "}
                    {t("materials.stock")}
                  </div>
                  <div className="site-chip">
                    <Tag size={12} /> {f.color}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="site-card reveal-up stagger-2 mt-14 rounded-3xl p-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#e4f5ef] text-[#0f766e] rounded-full mb-4">
            <Info size={24} />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-[#1b2c27]">
            {t("materials.ctaTitle")}
          </h3>
          <p className="text-[#5f726c] mb-8 max-w-xl mx-auto">
            {t("materials.ctaDesc")}
          </p>
          <Link to="/quote" className="site-btn-primary gap-2 px-8 py-4">
            {t("materials.ctaButton")} <ArrowRight size={18} />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
