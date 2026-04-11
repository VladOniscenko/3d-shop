import { Box, Hash, Layers, MessageSquare, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import type { OrderSectionProps } from "./types";
import { resolveAssetUrl } from "../../utils/assetUrl";

interface OrderItemsCardProps extends OrderSectionProps {
  isPendingQuote: boolean;
}

type ItemFile = {
  url: string;
  name: string;
  kind: "model" | "image" | "other";
};

function getFileTypeBadgeClass(kind: ItemFile["kind"]): string {
  if (kind === "model") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (kind === "image")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function getFileTypeBadgeLabel(
  kind: ItemFile["kind"],
  t: (key: string) => string,
): string {
  if (kind === "model") return t("orderDetail.fileTypeModel");
  if (kind === "image") return t("orderDetail.fileTypeImage");
  return t("orderDetail.fileTypeFile");
}

function getFileKindFromName(name?: string): "model" | "image" | "other" {
  const value = (name || "").toLowerCase();
  if (
    value.endsWith(".stl") ||
    value.endsWith(".obj") ||
    value.endsWith(".3mf") ||
    value.endsWith(".step") ||
    value.endsWith(".stp")
  ) {
    return "model";
  }

  if (
    value.endsWith(".png") ||
    value.endsWith(".jpg") ||
    value.endsWith(".jpeg") ||
    value.endsWith(".webp") ||
    value.endsWith(".gif")
  ) {
    return "image";
  }

  return "other";
}

function getItemFiles(item: {
  files?: Array<{
    url: string;
    name: string;
    kind?: "model" | "image" | "other";
  }>;
  fileUrl?: string;
  fileName?: string;
  imageUrl?: string;
}): ItemFile[] {
  const entries: ItemFile[] = [];

  for (const file of item.files || []) {
    if (!file?.url) continue;
    entries.push({
      url: file.url,
      name: file.name || "file",
      kind: file.kind || getFileKindFromName(file.name),
    });
  }

  if (item.fileUrl) {
    const exists = entries.some((file) => file.url === item.fileUrl);
    if (!exists) {
      entries.push({
        url: item.fileUrl,
        name: item.fileName || "model",
        kind: "model",
      });
    }
  }

  if (item.imageUrl) {
    const exists = entries.some((file) => file.url === item.imageUrl);
    if (!exists) {
      entries.push({
        url: item.imageUrl,
        name: "image",
        kind: "image",
      });
    }
  }

  return entries;
}

export default function OrderItemsCard({
  order,
  isPendingQuote,
  t,
}: OrderItemsCardProps) {
  const isCancelledOrder = (order.status || "").toLowerCase() === "cancelled";

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t("orderDetail.modelsInProject")}
      </h2>
      <div className="space-y-4">
        {order.items.map((item, idx) => {
          const itemFiles = getItemFiles(item);

          return (
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
                    <div className="flex items-center gap-2">
                      {itemFiles.length > 0 ? (
                        isCancelledOrder ? (
                          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            {t("orderDetail.filesRemovedDueCancellation")}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-[#3a5750] bg-white px-2 py-1 rounded border border-gray-200">
                            {itemFiles.length} files
                          </span>
                        )
                      ) : null}
                      {!isPendingQuote && item.price > 0 && (
                        <span className="font-bold text-emerald-700">
                          €{item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
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

              {!isCancelledOrder && itemFiles.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {itemFiles.map((file, fileIndex) => {
                    const isStl = file.url.toLowerCase().includes(".stl");

                    return (
                      <div
                        key={`${file.url}-${fileIndex}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1"
                      >
                        <span
                          className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getFileTypeBadgeClass(file.kind)}`}
                        >
                          {getFileTypeBadgeLabel(file.kind, t)}
                        </span>
                        <span className="max-w-[180px] truncate text-xs text-[#36504a]">
                          {file.name}
                        </span>
                        {isStl ? (
                          <Link
                            to={`/orders/${order.id}/models/${idx}?file=${fileIndex}`}
                            className="text-xs font-bold text-teal-700 hover:underline"
                          >
                            {t("orderDetail.viewModel")}
                          </Link>
                        ) : (
                          <a
                            href={resolveAssetUrl(file.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-teal-700 hover:underline"
                          >
                            {t("modelViewer.download")}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {item.notes && (
                <div className="flex items-start gap-2 text-sm text-gray-500 italic bg-white/50 p-3 rounded-lg">
                  <MessageSquare size={14} className="mt-1 shrink-0" />"
                  {item.notes}"
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
