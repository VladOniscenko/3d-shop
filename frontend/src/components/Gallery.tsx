import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import {
  Shapes,
  Wrench,
  Flower2,
  Gamepad2,
  Box,
  Loader2,
  ImageIcon,
} from "lucide-react";
import api from "../services/api";

interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
}

const getCategoryDesign = (category: string) => {
  switch (category) {
    case "Toys":
      return {
        icon: <Shapes size={40} />,
        color: "bg-blue-50",
        textColor: "text-blue-400",
      };
    case "Tools":
      return {
        icon: <Wrench size={40} />,
        color: "bg-orange-50",
        textColor: "text-orange-400",
      };
    case "Decor":
      return {
        icon: <Flower2 size={40} />,
        color: "bg-emerald-50",
        textColor: "text-emerald-400",
      };
    case "Tech":
      return {
        icon: <Gamepad2 size={40} />,
        color: "bg-indigo-50",
        textColor: "text-indigo-400",
      };
    default:
      return {
        icon: <Box size={40} />,
        color: "bg-gray-50",
        textColor: "text-gray-400",
      };
  }
};

const categories = ["All", "Toys", "Tools", "Decor", "Tech"];

export default function Gallery() {
  const [items, setItems] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        // Handle "All" by sending empty string or specific param your API expects
        const categoryParam = activeFilter === "All" ? "" : activeFilter;
        const res = await api.get(`/products?category=${categoryParam}`);
        setItems(res.data);
      } catch (err) {
        console.error("Failed to load gallery", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-[#fcfdfd] flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <header className="relative bg-[#133827] py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-200 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Print <span className="text-emerald-400">Showcase</span>
          </h1>
          <p className="text-emerald-100/70 text-xl max-w-2xl mx-auto leading-relaxed">
            A curated collection of high-quality 3D prints delivered to our
            community.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex-grow w-full">
        {/* Modern Filter Pill Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-16 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeFilter === category
                  ? "bg-[#133827] text-white shadow-lg shadow-emerald-900/20 scale-105"
                  : "bg-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
            <p className="text-gray-400 font-medium tracking-wide uppercase text-xs">
              Syncing Gallery
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {items.map((item) => {
                const design = getCategoryDesign(item.category);
                return (
                  <div key={item.id} className="group relative flex flex-col">
                    {/* Media Container */}
                    <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-100 shadow-sm border border-gray-100 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-emerald-900/10 group-hover:-translate-y-2">
                      {item.imageUrl ? (
                        <img
                          src={"http://localhost:5243" + item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center ${design.color}`}
                        >
                          <div
                            className={`${design.textColor} opacity-40 group-hover:scale-110 transition-transform duration-500`}
                          >
                            {design.icon}
                          </div>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#133827]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <button className="bg-white text-[#133827] w-full py-3 rounded-xl font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          Order Similar Print
                        </button>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="mt-5 px-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-black text-gray-900 text-lg tracking-tight uppercase">
                          {item.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
                <ImageIcon size={64} className="mx-auto mb-4 text-gray-200" />
                <h3 className="text-xl font-bold text-gray-900">
                  Archive Empty
                </h3>
                <p className="text-gray-400 mt-2">
                  Check back later for new {activeFilter} prints.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-50 py-12 text-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          © 2026 PrintCraft Collective • Built for Creators
        </p>
      </footer>
    </div>
  );
}
