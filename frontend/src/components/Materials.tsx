import { useEffect, useState } from "react";
import { Box, Loader2, Database, Tag } from "lucide-react";
import Navbar from "./Navbar";
import type { Filament } from "../types"; // Use the new interface name
import api from "../services/api";
import { useI18n } from "../i18n/I18nContext";
import Footer from "./Footer";
import { getColorStyle } from "../utils/colors";

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
      </main>

      <Footer />
    </div>
  );
}
