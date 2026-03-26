import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import {
  Shapes,
  Wrench,
  Settings2,
  Flower2,
  Gamepad2,
  Box,
  Loader2,
} from "lucide-react";
import api from "../services/api";

// Helper to map Category names to your specific Design tokens
const getCategoryDesign = (category: string) => {
  switch (category) {
    case "Toys":
      return {
        icon: <Shapes size={56} />,
        color: "bg-blue-100",
        textColor: "text-blue-500",
      };
    case "Tools":
      return {
        icon: <Wrench size={56} />,
        color: "bg-red-100",
        textColor: "text-red-500",
      };
    case "Decor":
      return {
        icon: <Flower2 size={56} />,
        color: "bg-green-100",
        textColor: "text-green-600",
      };
    case "Tech":
      return {
        icon: <Gamepad2 size={56} />,
        color: "bg-purple-100",
        textColor: "text-purple-500",
      };
    default:
      return {
        icon: <Box size={56} />,
        color: "bg-gray-100",
        textColor: "text-gray-500",
      };
  }
};

const categories = ["All", "Toys", "Tools", "Decor", "Tech"];

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // This runs every time activeFilter changes
  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        // We pass the category to the API.
        // The API handles "All" by returning everything.
        const res = await api.get(`/products?category=${activeFilter}`);
        setItems(res.data);
      } catch (err) {
        console.error("Failed to load gallery", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [activeFilter]); // Trigger refetch on filter change

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 flex flex-col">
      <Navbar />

      {/* Header Section */}
      <header className="bg-[#133827] py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Print Gallery</h1>
          <p className="text-emerald-50/80 text-lg">
            Explore some of our favorite recent projects from our database.
          </p>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 flex-grow w-full">
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                activeFilter === category
                  ? "bg-[#133827] text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-700" size={48} />
            <p className="mt-4 text-gray-500 font-medium">
              Updating gallery...
            </p>
          </div>
        ) : (
          <>
            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item: any) => {
                const design = getCategoryDesign(item.category);
                return (
                  <div key={item.id} className="group cursor-pointer">
                    {/* Image Box */}
                    <div
                      className={`aspect-square rounded-2xl ${design.color} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-[1.02] transition-all duration-300 mb-4`}
                    >
                      <div
                        className={`${design.textColor} group-hover:scale-110 transition-transform duration-300`}
                      >
                        {design.icon}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="px-2">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-emerald-700 font-medium">
                        {item.category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {items.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <Box size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg">No prints found in this category yet!</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 text-center text-gray-500 text-sm mt-auto">
        <p>© 2026 PrintCraft Collective. All rights reserved.</p>
      </footer>
    </div>
  );
}
