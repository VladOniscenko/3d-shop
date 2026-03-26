import { useEffect, useState } from "react";
import {
  ArrowRight,
  Shield,
  Sun,
  Droplets,
  Zap,
  Box,
  Loader2,
} from "lucide-react";
import Navbar from "./Navbar";
import type { MaterialItem } from "../types";
import api from "../services/api"; // Import the axios client we made

// --- Default Static Data (Fallback) ---
const defaultMaterials: MaterialItem[] = [
  {
    name: "PLA",
    tagline: "Classic & Versatile",
    description:
      "The standard choice for most prints. It is easy to print, comes in many colors, and is perfect for models.",
    colorClass: "bg-[#86d8a7]",
    icon: <Box size={24} className="text-[#133827]" />,
    tags: ["Beginner Friendly", "Decorative"],
  },
];

export default function Materials() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch from .NET API ---
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await api.get("/filaments");

        // If the API has data, use it. Otherwise, use our static list.
        if (response.data && response.data.length > 0) {
          setMaterials(response.data);
        } else {
          setMaterials(defaultMaterials);
        }
      } catch (error) {
        console.error("API Error, falling back to static data:", error);
        setMaterials(defaultMaterials);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900">
      <Navbar />

      {/* Header Section */}
      <header className="bg-[#133827] py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Materials Library
          </h1>
          <p className="text-emerald-50/80 text-lg">
            Choosing the right plastic is the secret to a great 3D print. Browse
            our selection below to find the perfect fit for your next project.
          </p>
        </div>
      </header>

      {/* Materials Grid */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-800">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-medium">Loading materials...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((mat) => (
              <div
                key={mat.name}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <div className="flex items-start gap-4 mb-4">
                  {/* Material Color Bubble */}
                  <div
                    className={`w-14 h-14 rounded-2xl ${mat.colorClass || "bg-gray-200"} flex items-center justify-center shrink-0 shadow-inner`}
                  >
                    {/* If API doesn't provide an icon, we show a default Box */}
                    {mat.icon || <Box size={24} className="text-gray-400" />}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {mat.name}
                    </h2>
                    <p className="text-emerald-700 font-medium text-sm">
                      {mat.tagline}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                  {mat.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {mat.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action at the bottom */}
        <div className="mt-16 bg-emerald-50 rounded-2xl p-8 text-center border border-emerald-100">
          <h3 className="text-2xl font-bold mb-2">Not sure what you need?</h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Tell us what you are trying to build, and we will recommend the best
            material for the job.
          </p>
          <a
            href="/quote"
            className="inline-flex items-center gap-2 bg-[#133827] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1c4d37] transition-colors"
          >
            Ask for a Recommendation <ArrowRight size={18} />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 text-center text-gray-500 text-sm">
        <p>© 2026 PrintCraft Collective. All rights reserved.</p>
      </footer>
    </div>
  );
}
