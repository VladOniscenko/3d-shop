import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import {
  Trash2,
  MapPin,
  Phone as PhoneIcon,
  CheckCircle,
  Loader2,
  Layers,
  Palette,
  Hash,
  ArrowRight,
  ShoppingCart,
  Image as ImageIcon,
} from "lucide-react";
import Navbar from "./Navbar";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import type { Filament, OrderItem } from "../types";

export default function Cart() {
  const { cart, removeFromCart, clearCart, updateCartItem } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filaments, setFilaments] = useState<Filament[]>([]);

  const [address, setAddress] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    city: "",
    postalCode: "",
  });

  // Fetch filaments to populate the dropdowns
  useEffect(() => {
    const fetchFilaments = async () => {
      try {
        const res = await api.get("/filaments");
        setFilaments(res.data);
      } catch (err) {
        console.error("Failed to fetch filaments", err);
      }
    };
    fetchFilaments();
  }, []);

  const materials = Array.from(new Set(filaments.map((f) => f.material)));

  const handleUpdate = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItem = { ...cart[index], [field]: value };

    // If material changes, reset color to the first available for that material
    if (field === "material") {
      const firstColor =
        filaments.find((f) => f.material === value)?.color || "";
      updatedItem.color = firstColor;
    }

    updateCartItem(index, updatedItem);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty.");

    setIsSubmitting(true);
    try {
      const payload = { ...address, items: cart };
      await api.post("/orders/quote", payload);
      clearCart();
      navigate("/orders");
    } catch (err) {
      alert("Checkout failed. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="bg-white p-12 rounded-3xl border border-gray-200 shadow-sm inline-block">
            <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cart is empty
            </h2>
            <p className="text-gray-500 mb-8">
              Browse the gallery to find something to print.
            </p>
            <button
              onClick={() => navigate("/gallery")}
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 mx-auto"
            >
              Go to Gallery <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingCart className="text-emerald-600" size={32} />
          Your Selection
        </h2>

        <form
          onSubmit={handleCheckout}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6">Gallery Items</h3>
              <div className="space-y-6">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-gray-50 rounded-2xl border border-gray-200"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image Preview */}
                      <div className="bg-white w-full md:w-32 h-32 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.fileName}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <ImageIcon className="text-gray-300" size={32} />
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {item.fileName}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeFromCart(idx)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Material Dropdown */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                              <Layers size={12} /> Material
                            </label>
                            <select
                              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                              value={item.material}
                              onChange={(e) =>
                                handleUpdate(idx, "material", e.target.value)
                              }
                            >
                              {materials.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Color Dropdown */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                              <Palette size={12} /> Color
                            </label>
                            <select
                              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                              value={item.color}
                              onChange={(e) =>
                                handleUpdate(idx, "color", e.target.value)
                              }
                            >
                              {filaments
                                .filter((f) => f.material === item.material)
                                .map((f) => (
                                  <option key={f.id} value={f.color}>
                                    {f.color}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* Quantity Input */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                              <Hash size={12} /> Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                              value={item.count}
                              onChange={(e) =>
                                handleUpdate(
                                  idx,
                                  "count",
                                  parseInt(e.target.value) || 1,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                <MapPin className="text-emerald-600" size={20} />
                Shipping Info
              </h3>
              <div className="space-y-4">
                <input
                  required
                  placeholder="Full Name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={address.fullName}
                  onChange={(e) =>
                    setAddress({ ...address, fullName: e.target.value })
                  }
                />
                <div className="relative">
                  <PhoneIcon
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <input
                    required
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={address.phoneNumber}
                    onChange={(e) =>
                      setAddress({ ...address, phoneNumber: e.target.value })
                    }
                  />
                </div>
                <input
                  required
                  placeholder="Street Address"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={address.addressLine1}
                  onChange={(e) =>
                    setAddress({ ...address, addressLine1: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="City"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                  />
                  <input
                    required
                    placeholder="Zip"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none"
                    value={address.postalCode}
                    onChange={(e) =>
                      setAddress({ ...address, postalCode: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-8 bg-[#133827] text-white font-bold py-4 rounded-2xl hover:bg-[#1c4d37] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle size={20} />
                )}
                Place Order Request
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
