import { useState, useEffect } from "react";
import {
  Upload,
  Trash2,
  Plus,
  Package,
  MapPin,
  Loader2,
  CheckCircle,
  Layers,
  Palette,
  MessageSquare,
  Phone,
  Hash,
} from "lucide-react";
import Navbar from "./Navbar";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import type { OrderItem, Filament } from "../types";
import {
  normalizeShippingInfo,
  validateShippingInfo,
} from "../utils/shippingValidation";
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

  const [address, setAddress] = useState({
    fullName: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    phoneNumber: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await api.post("/upload", formData);

      const defaultMat = availableMaterials[0] || "PLA";
      const defaultColor =
        filaments.find((f) => f.material === defaultMat)?.color || "Black";

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

    const errors = validateShippingInfo(address);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      notifyError(t("quote.invalidShipping"));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...normalizeShippingInfo(address), items };
      await api.post("/orders/quote", payload);
      navigate("/orders");
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        setValidationErrors(apiErrors);
      }

      const message = err?.response?.data?.message || t("quote.submitFailed");
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {t("quote.title")}
          </h2>
          <p className="text-gray-500 text-lg">{t("quote.subtitle")}</p>
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
                          {item.fileName}
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
                          <select
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            value={item.material}
                            onChange={(e) => {
                              const newMat = e.target.value;
                              const firstColor =
                                filaments.find((f) => f.material === newMat)
                                  ?.color || "";
                              const newItems = [...items];
                              newItems[idx] = {
                                ...item,
                                material: newMat,
                                color: firstColor,
                              };
                              setItems(newItems);
                            }}
                          >
                            {availableMaterials.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Palette size={12} /> {t("quote.color")}
                          </label>
                          <select
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            value={item.color}
                            onChange={(e) =>
                              updateItem(idx, "color", e.target.value)
                            }
                          >
                            {filaments
                              .filter((f) => f.material === item.material)
                              .map((f) => (
                                <option key={f.id} value={f.color}>
                                  {f.color} ({f.name})
                                </option>
                              ))}
                          </select>
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
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                <MapPin className="text-emerald-600" size={20} />
                {t("quote.shipping")}
              </h3>
              <div className="space-y-4">
                <input
                  required
                  placeholder={t("quote.fullName")}
                  className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${
                    validationErrors.fullName
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-200 focus:ring-emerald-500"
                  }`}
                  value={address.fullName}
                  onChange={(e) =>
                    setAddress({ ...address, fullName: e.target.value })
                  }
                />
                {validationErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.fullName}
                  </p>
                )}

                <div className="relative">
                  <Phone
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    required
                    type="tel"
                    placeholder={t("quote.phone")}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 ${
                      validationErrors.phoneNumber
                        ? "border-red-300 focus:ring-red-400"
                        : "border-gray-200 focus:ring-emerald-500"
                    }`}
                    value={address.phoneNumber}
                    onChange={(e) =>
                      setAddress({ ...address, phoneNumber: e.target.value })
                    }
                  />
                </div>
                {validationErrors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.phoneNumber}
                  </p>
                )}

                <input
                  required
                  placeholder={t("quote.street")}
                  className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${
                    validationErrors.addressLine1
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-200 focus:ring-emerald-500"
                  }`}
                  value={address.addressLine1}
                  onChange={(e) =>
                    setAddress({ ...address, addressLine1: e.target.value })
                  }
                />
                {validationErrors.addressLine1 && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.addressLine1}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      required
                      placeholder={t("quote.city")}
                      className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${
                        validationErrors.city
                          ? "border-red-300 focus:ring-red-400"
                          : "border-gray-200 focus:ring-emerald-500"
                      }`}
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                    />
                    {validationErrors.city && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      required
                      placeholder={t("quote.postalCode")}
                      className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 ${
                        validationErrors.postalCode
                          ? "border-red-300 focus:ring-red-400"
                          : "border-gray-200 focus:ring-emerald-500"
                      }`}
                      value={address.postalCode}
                      onChange={(e) =>
                        setAddress({ ...address, postalCode: e.target.value })
                      }
                    />
                    {validationErrors.postalCode && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.postalCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

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
