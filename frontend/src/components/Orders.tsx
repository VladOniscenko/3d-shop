import { useEffect, useState } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  FileText,
  ChevronRight,
  Loader2,
  Box,
  MapPin,
} from "lucide-react";
import Navbar from "./Navbar";
import type { Order } from "../types";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending_quote":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "printing":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "shipped":
        return "bg-purple-50 text-purple-700 border-purple-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              My Projects
            </h1>
            <p className="text-gray-500 mt-1">
              Track your 3D printing requests and shipping status.
            </p>
          </div>
          <div className="hidden sm:block p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Package size={32} className="text-emerald-600" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
            <p className="font-medium">Loading your order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Box className="text-gray-300" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
              Upload your 3D designs to get a custom price quote from our shop.
            </p>
            <Link
              to="/quote"
              className="inline-block bg-[#133827] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1c4d37] transition-all shadow-lg shadow-emerald-900/10"
            >
              Start New Project
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Status & Date */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-4 rounded-2xl border ${getStatusStyle(order.status)}`}
                    >
                      <BoxIcon status={order.status} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">
                          Project #{order.id.slice(0, 8)}
                        </h3>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase ${getStatusStyle(order.status)}`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString(
                          undefined,
                          { dateStyle: "long" },
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Summary of items */}
                  <div className="flex-1 lg:px-10 border-gray-100 lg:border-x">
                    <div className="flex items-center gap-2 text-gray-600 mb-1 text-sm font-bold">
                      <Package size={14} />
                      {order.items?.length || 0}{" "}
                      {order.items?.length === 1 ? "Model" : "Models"}
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={12} /> Shipping to {order.city}
                    </p>
                  </div>

                  {/* View Button */}
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex items-center justify-center gap-2 bg-gray-50 text-gray-900 px-6 py-3 rounded-xl font-bold text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all"
                  >
                    Manage Project <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Icon Logic
function BoxIcon({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "printing") return <Clock size={24} />;
  if (s === "completed") return <CheckCircle size={24} />;
  if (s === "shipped") return <Truck size={24} />;
  return <FileText size={24} />;
}
