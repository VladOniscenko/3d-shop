import { useEffect, useState } from "react";
import { ArrowRight, Box, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Filament } from "../types"; // Import your main interface
import api from "../services/api";

export default function MaterialsSection() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await api.get("/filaments");
        // We only show the first 6 for the homepage preview
        setFilaments(response.data.slice(0, 6));
      } catch (error) {
        console.error("Could not load filament preview:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, []);

  // Helper to match API colors to UI bubbles
  const getColorClass = (color: string) => {
    const c = color.toLowerCase();
    const map: Record<string, string> = {
      black: "bg-gray-900",
      white: "bg-white border border-gray-200",
      red: "bg-red-500",
      blue: "bg-blue-600",
      green: "bg-emerald-500",
      grey: "bg-gray-400",
      gray: "bg-gray-400",
      orange: "bg-orange-500",
      yellow: "bg-yellow-400",
      silver: "bg-slate-300",
    };
    return map[c] || "bg-emerald-100";
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Materials & Colors</h3>
        <p className="text-gray-500 text-sm">
          Premium filaments for your perfect print
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 py-4">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading options...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filaments.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-4 bg-[#f3f4f6] p-4 rounded-xl hover:bg-white hover:shadow-md transition-all group"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-black/5 transition-transform group-hover:scale-110 ${getColorClass(f.color)}`}
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
                  <p className="font-bold text-sm text-gray-900">{f.name}</p>
                  <span className="text-[10px] font-black bg-white/50 px-1.5 py-0.5 rounded text-gray-500">
                    {f.material}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/materials"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#133827] hover:gap-3 transition-all"
      >
        View Full Library <ArrowRight size={16} />
      </Link>
    </div>
  );
}
