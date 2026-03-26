import React, { useEffect, useState } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Navbar from "./Navbar";
import api from "../services/api";

interface Order {
  id: string;
  fileUrl: string;
  notes: string;
  status: string;
  createdAt: string;
}

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

  // Helper to style the status badges
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending_quote":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "printing":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-500">
              Track your 3D printing requests and orders.
            </p>
          </div>
          <Package size={40} className="text-emerald-600 opacity-20" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
            <p className="text-gray-500 font-medium">Fetching your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Upload your first 3D design to get a custom quote from our
              experts.
            </p>
            <a
              href="/upload"
              className="bg-[#133827] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1c4d37] transition-colors"
            >
              Start a New Project
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Info Section */}
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-50 p-3 rounded-xl">
                    <BoxIcon status={order.status} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 truncate max-w-[200px] md:max-w-xs">
                      {order.fileUrl.split("/").pop()}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      Requested on{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(order.status)} uppercase tracking-wider`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Progress Notes */}
                <div className="flex-1 md:px-8 border-l border-gray-100 hidden md:block">
                  <p className="text-sm text-gray-500 italic">
                    "{order.notes || "No extra instructions provided."}"
                  </p>
                </div>

                {/* Action */}
                <button className="flex items-center gap-2 text-emerald-700 font-bold text-sm hover:underline">
                  View Details <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Dynamic Icon based on status
function BoxIcon({ status }: { status: string }) {
  if (status === "printing") return <Clock className="text-blue-600" />;
  if (status === "completed")
    return <CheckCircle className="text-emerald-600" />;
  if (status === "shipped") return <Truck className="text-purple-600" />;
  return <FileText className="text-amber-600" />;
}
