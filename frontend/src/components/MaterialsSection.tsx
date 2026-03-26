import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface MaterialItem {
  name: string;
  desc: string;
  colorClass: string;
}

export default function MaterialsSection() {
  const materials: MaterialItem[] = [
    { name: "PLA", desc: "Classic & versatile", colorClass: "bg-[#86d8a7]" },
    { name: "PETG", desc: "Strong & durable", colorClass: "bg-[#2563eb]" },
    { name: "ABS", desc: "Heat resistant", colorClass: "bg-[#171717]" },
    { name: "TPU", desc: "Flexible", colorClass: "bg-[#f59e0b]" },
    { name: "Wood", desc: "Natural finish", colorClass: "bg-[#b48a60]" },
    { name: "Silk", desc: "Shiny finish", colorClass: "bg-[#a855f7]" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Materials & Colors</h3>
        <p className="text-gray-500 text-sm">
          Premium filaments for your perfect print
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {materials.map((mat) => (
          <div
            key={mat.name}
            className="flex items-center gap-4 bg-[#f3f4f6] p-4 rounded-xl hover:bg-white hover:shadow-md transition-all"
          >
            <div
              className={`w-8 h-8 rounded-full ${mat.colorClass} shadow-sm border border-black/5`}
            ></div>
            <div>
              <p className="font-bold text-sm">{mat.name}</p>
              <p className="text-xs text-gray-500">{mat.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <Link
        to="/materials"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#133827] hover:underline"
      >
        View All Materials <ArrowRight size={16} />
      </Link>
    </div>
  );
}
