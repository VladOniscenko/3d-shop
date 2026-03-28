import { Box, Hash, Layers, MessageSquare, Palette } from "lucide-react";
import type { OrderSectionProps } from "./types";

interface OrderItemsCardProps extends OrderSectionProps {
  isPendingQuote: boolean;
}

export default function OrderItemsCard({
  order,
  isPendingQuote,
  t,
}: OrderItemsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t("orderDetail.modelsInProject")}
      </h2>
      <div className="space-y-4">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="p-5 bg-gray-50 rounded-2xl border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <Box className="text-emerald-600" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-900 truncate">
                    {item.fileName}
                  </p>
                  {!isPendingQuote && item.price > 0 && (
                    <span className="font-bold text-emerald-700">
                      €{item.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <Layers size={12} /> {item.material}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded">
                    <Palette size={12} /> {item.color}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    <Hash size={12} /> x{item.count || 1}
                  </span>
                </div>
              </div>
            </div>
            {item.notes && (
              <div className="flex items-start gap-2 text-sm text-gray-500 italic bg-white/50 p-3 rounded-lg">
                <MessageSquare size={14} className="mt-1 shrink-0" />"
                {item.notes}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
