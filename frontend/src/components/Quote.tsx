import { useState, useEffect } from "react";
import {
  Upload,
  Trash2,
  Plus,
  Package,
  Loader2,
  CheckCircle,
  Layers,
  Palette,
  MessageSquare,
  Hash,
} from "lucide-react";
import Navbar from "./Navbar";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import type { OrderItem, Filament } from "../types";
import { useI18n } from "../i18n/I18nContext";
import Footer from "./Footer";
import { useNotify } from "../context/NotifyContext";

export default function Quote() {
  const { t } = useI18n();
  const { notifyError } = useNotify();
  const navigate = useNavigate();

  const [items, setItems] = useState<OrderItem[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFilaments = async () => {
      try {
        const res = await api.get("/filaments");
        if (Array.isArray(res.data)) {
          setFilaments(res.data);
        } else {
          setFilaments([]);
        }
      } catch (err) {
        console.error("Failed to fetch filaments", err);
      }
    };
    fetchFilaments();
  }, []);

  const availableMaterials = Array.from(
    new Set(filaments.map((f) => f.material)),
  );
  const availableColors = Array.from(new Set(filaments.map((f) => f.color)));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await api.post("/upload", formData);

      const defaultMat = availableMaterials[0] || "Custom";
      const defaultColor = availableColors[0] || "Custom";

      const newItem: OrderItem = {
        fileUrl: res.data.url,
        fileName: file.name,
        notes: "",
        imageUrl: "",
        material: defaultMat,
        color: defaultColor,
        price: 0,
        count: 1,
      };
      setItems([...items, newItem]);
    } catch (err) {
      notifyError(t("quote.uploadFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addTextOnlyItem = () => {
    const defaultMat = availableMaterials[0] || "Custom";
    const defaultColor = availableColors[0] || "Custom";

    const newItem: OrderItem = {
      fileUrl: "",
      fileName: "",
      notes: "",
      imageUrl: "",
      material: defaultMat,
      color: defaultColor,
      price: 0,
      count: 1,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      notifyError(t("quote.noFiles"));
      return;
    }

    // Validate each item has either a file or notes
    if (items.some(item => !item.fileUrl && !item.notes)) {
      notifyError("Each item must have either a file or description.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/orders/quote", { items });
      navigate("/orders");
    } catch (err: any) {
      const message = err?.response?.data?.message || t("quote.submitFailed");
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="site-shell">
      <Navbar />

      <main className="site-main px-4 sm:px-6 py-12">
        <div className="mb-10 text-center">
          <h2 className="site-heading text-4xl font-bold mb-2">
            {t("quote.title")}
          </h2>
          <p className="site-subheading text-lg">{t("quote.subtitle")}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <Package className="text-emerald-600" size={20} />
                  {t("quote.models")}
                </h3>
                <div className="flex gap-2">
                  <label className="cursor-pointer bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2">
                    {isUploading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                    {t("quote.addFile")}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={addTextOnlyItem}
                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Description
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl py-12 text-center">
                  <Upload className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-400">{t("quote.noFiles")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 border border-gray-200 rounded-xl bg-gray-50/50"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-gray-800 truncate max-w-[300px]">
                          {item.fileName || "Text Description"}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Layers size={12} /> {t("quote.material")}
                          </label>
                          <input
                            list="quote-material-suggestions"
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            value={item.material}
                            onChange={(e) =>
                              updateItem(idx, "material", e.target.value)
                            }
                            placeholder="PLA, PETG, ABS, Nylon..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Palette size={12} /> {t("quote.color")}
                          </label>
                          <input
                            list="quote-color-suggestions"
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            value={item.color}
                            onChange={(e) =>
                              updateItem(idx, "color", e.target.value)
                            }
                            placeholder="Black, White, Red, Transparent..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Hash size={12} /> {t("quote.quantity")}
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            value={item.count}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "count",
                                parseInt(e.target.value) || 1,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <MessageSquare
                          className="absolute left-3 top-3 text-gray-300"
                          size={16}
                        />
                        <textarea
                          placeholder={t("quote.notesPlaceholder")}
                          className="w-full p-3 pl-10 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                          value={item.notes}
                          onChange={(e) =>
                            updateItem(idx, "notes", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <datalist id="quote-material-suggestions">
              {availableMaterials.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <datalist id="quote-color-suggestions">
              {availableColors.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600">
                {t("quote.shippingLaterNotice")}
              </p>

              <p className="mt-3 text-xs leading-relaxed text-[#5e7069]">
                {t("quote.pricingDisclaimer")}{" "}
                <Link
                  to="/terms"
                  className="font-semibold text-[#0f766e] hover:underline"
                >
                  {t("footer.terms")}
                </Link>
              </p>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full mt-8 bg-[#133827] text-white font-bold py-4 rounded-xl hover:bg-[#1c4d37] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle size={20} />
                )}
                {t("quote.submit")}
              </button>
              <p className="mt-4 text-[10px] text-gray-400 text-center uppercase tracking-widest">
                {t("quote.secure")}
              </p>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
