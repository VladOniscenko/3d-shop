import { useEffect, useState } from "react";
import {
  Shapes,
  Wrench,
  Settings2,
  Flower2,
  Box,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

interface Print {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
}

const getPrintDesign = (category: string) => {
  switch (category) {
    case "Toys":
      return {
        icon: <Shapes size={32} />,
        color: "bg-blue-50",
        textColor: "text-blue-400",
      };
    case "Tools":
      return {
        icon: <Wrench size={32} />,
        color: "bg-stone-100",
        textColor: "text-stone-400",
      };
    case "Decor":
      return {
        icon: <Flower2 size={32} />,
        color: "bg-emerald-50",
        textColor: "text-emerald-400",
      };
    case "Tech":
      return {
        icon: <Settings2 size={32} />,
        color: "bg-orange-50",
        textColor: "text-orange-400",
      };
    default:
      return {
        icon: <Box size={32} />,
        color: "bg-gray-50",
        textColor: "text-gray-300",
      };
  }
};

export default function RecentPrints() {
  const [prints, setPrints] = useState<Print[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        // Fetching top 4 recent items from your products API
        const res = await api.get("/products?limit=4");
        setPrints(res.data);
      } catch (err) {
        console.error("Could not fetch recent prints", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            Recent Work
          </h3>
          <p className="text-gray-400 text-sm font-medium mt-1">
            Real projects delivered to our community
          </p>
        </div>
        <Link
          to="/gallery"
          className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:underline group"
        >
          View Full Gallery{" "}
          <ChevronRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Loader2 className="animate-spin text-emerald-600 mb-2" size={32} />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Loading Showcase
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {prints.map((print) => {
            const design = getPrintDesign(print.category);
            return (
              <Link
                key={print.id}
                to="/gallery"
                className="group flex flex-col gap-4"
              >
                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white shadow-sm border border-gray-100 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-emerald-900/10 group-hover:-translate-y-1">
                  {print.imageUrl ? (
                    <img
                      src={"http://localhost:5243" + print.imageUrl}
                      alt={print.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${design.color}`}
                    >
                      <div
                        className={`${design.textColor} opacity-50 group-hover:scale-110 transition-transform duration-500`}
                      >
                        {design.icon}
                      </div>
                    </div>
                  )}

                  {/* Subtle Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-md text-[10px] font-black px-3 py-1 rounded-full text-gray-900 uppercase tracking-tighter shadow-sm border border-gray-100">
                      {print.category}
                    </span>
                  </div>
                </div>

                <div className="px-1 text-center lg:text-left">
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate">
                    {print.name}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && prints.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic">
            Portfolio update in progress...
          </p>
        </div>
      )}
    </div>
  );
}
