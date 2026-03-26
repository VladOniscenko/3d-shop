import React, { useState } from "react";
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
} from "lucide-react";
import Navbar from "./Navbar";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

// 1. Updated Interface to match .NET model
interface OrderItem {
  fileUrl: string;
  fileName: string;
  notes: string;
  material: string;
  color: string;
}

const MATERIALS = ["PLA", "ABS", "PETG", "Resin", "Nylon"];
const COLORS = ["Black", "White", "Grey", "Red", "Blue", "Green", "Silver"];

export default function Quote() {
  const navigate = useNavigate();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    addressLine1: "",
    city: "",
    postalCode: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await api.post("/upload", formData);
      // 2. Add defaults for material and color
      const newItem: OrderItem = {
        fileUrl: res.data.url,
        fileName: file.name,
        notes: "",
        material: "PLA",
        color: "Black",
      };
      setItems([...items, newItem]);
    } catch (err) {
      alert("Upload failed. Are you logged in?");
    } finally {
      setIsUploading(false);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Helper to update specific fields in the items array
  const updateItem = (index: number, field: keyof OrderItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0)
      return alert("Please upload at least one 3D model.");

    setIsSubmitting(true);
    try {
      const payload = { ...address, items };
      await api.post("/orders/quote", payload);
      navigate("/orders");
    } catch (err) {
      alert("Failed to submit quote.");
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
            Request a Quote
          </h2>
          <p className="text-gray-500 text-lg">
            Customize each print with materials and colors.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Package className="text-emerald-600" size={20} />
                  Your 3D Models
                </h3>
                <label className="cursor-pointer bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2">
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  Add File
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
                  <p className="text-gray-400">No files added yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 border border-gray-200 rounded-xl bg-gray-50/50"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-gray-800 truncate">
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

                      {/* 3. New Material and Color Selectors */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Layers size={12} /> Material
                          </label>
                          <select
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={item.material}
                            onChange={(e) =>
                              updateItem(idx, "material", e.target.value)
                            }
                          >
                            {MATERIALS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Palette size={12} /> Color
                          </label>
                          <select
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={item.color}
                            onChange={(e) =>
                              updateItem(idx, "color", e.target.value)
                            }
                          >
                            {COLORS.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <textarea
                        placeholder="Additional instructions (Infill, layer height, etc.)"
                        className="w-full p-3 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        value={item.notes}
                        onChange={(e) =>
                          updateItem(idx, "notes", e.target.value)
                        }
                      />
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
                Shipping Info
              </h3>

              <div className="space-y-4">
                <input
                  required
                  placeholder="Full Name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={address.fullName}
                  onChange={(e) =>
                    setAddress({ ...address, fullName: e.target.value })
                  }
                />
                <input
                  required
                  placeholder="Street Address"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={address.addressLine1}
                  onChange={(e) =>
                    setAddress({ ...address, addressLine1: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    placeholder="City"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                  />
                  <input
                    required
                    placeholder="Postal Code"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={address.postalCode}
                    onChange={(e) =>
                      setAddress({ ...address, postalCode: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full mt-8 bg-[#133827] text-white font-bold py-4 rounded-xl hover:bg-[#1c4d37] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle size={20} />
                )}
                Submit Order Request
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
