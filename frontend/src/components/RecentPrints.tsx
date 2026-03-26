import React, { useEffect, useState } from "react";
import { Shapes, Wrench, Settings2, Flower2, Box, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

// Helper to map the Category from the API to your design
const getPrintDesign = (category: string) => {
  switch (category) {
    case "Toys":
      return {
        icon: <Shapes size={48} />,
        color: "bg-blue-100",
        textColor: "text-blue-500",
      };
    case "Tools":
      return {
        icon: <Wrench size={48} />,
        color: "bg-stone-200",
        textColor: "text-stone-600",
      };
    case "Decor":
      return {
        icon: <Flower2 size={48} />,
        color: "bg-green-100",
        textColor: "text-green-600",
      };
    case "Tech":
      return {
        icon: <Settings2 size={48} />,
        color: "bg-orange-100",
        textColor: "text-orange-500",
      };
    default:
      return {
        icon: <Box size={48} />,
        color: "bg-gray-100",
        textColor: "text-gray-400",
      };
  }
};

export default function RecentPrints() {
  const [prints, setPrints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get("/products?limit=4");
        setPrints(res.data); // No more .slice() needed here!
      } catch (err) {
        console.error("Could not fetch recent prints", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Recent Prints</h3>
        <p className="text-gray-500 text-sm">
          Quality prints from satisfied customers
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {prints.map((print: any) => {
            const design = getPrintDesign(print.category);
            return (
              <Link
                key={print.id}
                to="/gallery"
                className="flex flex-col gap-3 group rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 p-1 -m-1"
              >
                <div
                  className={`aspect-square rounded-2xl ${design.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}
                >
                  <div className={design.textColor}>{design.icon}</div>
                </div>
                <p className="text-xs font-bold text-gray-800 text-center">
                  {print.name}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && prints.length === 0 && (
        <p className="text-gray-400 text-sm italic text-center py-4">
          No prints in the gallery yet.
        </p>
      )}
    </div>
  );
}
