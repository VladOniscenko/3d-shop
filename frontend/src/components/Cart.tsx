import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import {
  Trash2,
  MapPin,
  Phone as PhoneIcon,
  Loader2,
  Layers,
  Palette,
  Hash,
  ArrowRight,
  ShoppingCart,
  Image as ImageIcon,
  Truck,
  CreditCard,
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

  const DELIVERY_PRICE = 6.95;
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.count, 0);
  const total = subtotal + DELIVERY_PRICE;

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
      // Map the cart to match the C# CartItemDto
      const payload = {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        addressLine1: address.addressLine1,
        city: address.city,
        postalCode: address.postalCode,
        totalAmount: total.toFixed(2), // String format for Mollie
        items: cart.map((item) => ({
          productId: item.productId, // This now works with the interface update
          count: item.count,
          material: item.material,
          color: item.color,
        })),
      };

      // 1. Create Order & Get Mollie URL from Backend
      const res = await api.post("/payments/create", payload);

      // 2. Clear Cart locally
      clearCart();

      // 3. Redirect to Mollie Secure Checkout
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Something went wrong. Please check your address and try again.");
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
          Finalize Order
        </h2>

        <form
          onSubmit={handleCheckout}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            {/* Review Items */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6 uppercase tracking-wider text-sm">
                Review Items
              </h3>
              <div className="space-y-6">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-gray-50 rounded-2xl border border-gray-200"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
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
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">
                              {item.fileName}
                            </h4>
                            <p className="text-emerald-600 font-bold">
                              €{item.price.toFixed(2)} / unit
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(idx)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                              <Layers size={12} /> Material
                            </label>
                            <select
                              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
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
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                              <Palette size={12} /> Color
                            </label>
                            <select
                              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
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
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                              <Hash size={12} /> Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm"
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

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6 uppercase tracking-wider text-sm">
                Payment Method
              </h3>
              <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-emerald-500 text-white">
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    Online Payment (Mollie)
                  </p>
                  <p className="text-xs text-gray-500">
                    iDEAL, Credit Card, Bancontact, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Info */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="mb-8 space-y-3">
                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">
                  Summary
                </h3>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    €{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span className="flex items-center gap-2">
                    <Truck size={16} /> Delivery
                  </span>
                  <span className="font-medium text-gray-900">
                    €{DELIVERY_PRICE.toFixed(2)}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between">
                  <span className="font-black text-gray-900 text-lg">
                    Total
                  </span>
                  <span className="font-black text-emerald-600 text-lg">
                    €{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <hr className="mb-8 border-gray-100" />

              <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                <MapPin className="text-emerald-600" size={20} /> Shipping
              </h3>
              <div className="space-y-4">
                <input
                  required
                  placeholder="Full Name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
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
                    placeholder="Phone"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={address.phoneNumber}
                    onChange={(e) =>
                      setAddress({ ...address, phoneNumber: e.target.value })
                    }
                  />
                </div>
                <input
                  required
                  placeholder="Street"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
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
                className={`w-full mt-8 bg-[#133827] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 ${
                  isSubmitting ? "opacity-50" : "hover:bg-[#1c4d37]"
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ArrowRight size={20} />
                )}
                Pay with Mollie
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-4 uppercase font-bold tracking-widest">
                Secure 256-bit SSL Encryption
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
