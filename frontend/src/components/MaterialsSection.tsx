import { useEffect, useState } from "react";
import { ArrowRight, Box, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Filament } from "../types"; // Import your main interface
import api from "../services/api";
import { useI18n } from "../i18n/I18nContext";

export default function MaterialsSection() {
  const { t } = useI18n();
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await api.get("/filaments");
        if (Array.isArray(response.data)) {
          setFilaments(response.data.slice(0, 6));
        } else {
          setFilaments([]);
        }
      } catch (error) {
        console.error("Could not load filament preview:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, []);

  // Helper to match API colors to UI bubbles
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
    <div className="space-y-6">
      <div>
        <h3 className="site-heading text-3xl font-black mb-2">
          {t("materials.title")}
        </h3>
        <p className="site-subheading text-sm">{t("materials.subtitle")}</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 py-4">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">{t("materials.loading")}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filaments.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-4 bg-[#f6fbf8] border border-[#d9e8e1] p-4 rounded-xl hover:bg-white hover:shadow-md transition-all group"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-black/5 transition-transform group-hover:scale-110 ${getColorStyle(f.color)}`}
              >
                <Box
                  size={16}
                  className={
                    f.color.toLowerCase() === "white"
                      ? "text-gray-300"
                      : "text-white/50"
                  }
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-[#1a2b25]">{f.name}</p>
                  <span className="text-[10px] font-black bg-white px-1.5 py-0.5 rounded text-[#60736d] border border-[#e2ece8]">
                    {f.material}
                  </span>
                </div>
                <p className="text-xs text-[#60736d] line-clamp-1">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/materials"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e] hover:gap-3 transition-all"
      >
        {t("materials.viewAll")} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
