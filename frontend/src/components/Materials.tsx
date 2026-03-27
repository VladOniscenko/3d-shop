import { useEffect, useState } from "react";
import { ArrowRight, Box, Loader2, Database, Tag, Info } from "lucide-react";
import Navbar from "./Navbar";
import type { Filament } from "../types"; // Use the new interface name
import api from "../services/api";
import { useI18n } from "../i18n/I18nContext";

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

  // Helper to map color names to Tailwind classes
  const getColorClass = (color: string) => {
    const c = color.toLowerCase();
    if (c === "black") return "bg-gray-900 text-white";
    if (c === "white") return "bg-white border border-gray-200 text-gray-400";
    if (c === "red") return "bg-red-500 text-white";
    if (c === "blue") return "bg-blue-500 text-white";
    if (c === "green") return "bg-emerald-500 text-white";
    if (c === "grey" || c === "gray") return "bg-gray-400 text-white";
    return "bg-emerald-100 text-emerald-700"; // Fallback
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900">
      <Navbar />

      <header className="bg-[#133827] py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("materials.pageTitle")}
          </h1>
          <p className="text-emerald-50/80 text-lg">
            {t("materials.pageSubtitle")}
          </p>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-800">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-medium">{t("materials.pageLoading")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filaments.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-center gap-4 mb-6">
                  {/* Visual Color Bubble */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${getColorClass(f.color)}`}
                  >
                    <Box size={24} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                      {f.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {f.material}
                      </span>
                      <span className="text-xs text-gray-400">
                        €{f.pricePerGram}/g
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed">
                  {f.description}
                </p>

                {/* Metadata Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Database size={12} /> {f.stockQuantity}g{" "}
                    {t("materials.stock")}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Tag size={12} /> {f.color}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full mb-4">
            <Info size={24} />
          </div>
          <h3 className="text-2xl font-bold mb-2">{t("materials.ctaTitle")}</h3>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            {t("materials.ctaDesc")}
          </p>
          <a
            href="/quote"
            className="inline-flex items-center gap-2 bg-[#133827] text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/10"
          >
            {t("materials.ctaButton")} <ArrowRight size={18} />
          </a>
        </div>
      </main>

      <footer className="py-12 text-center text-gray-400 text-xs">
        <p>{t("materials.footer")}</p>
      </footer>
    </div>
  );
}
