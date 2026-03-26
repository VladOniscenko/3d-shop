import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  Truck,
  Box,
  Calendar,
  MessageSquare,
  Loader2,
} from "lucide-react";
import Navbar from "./Navbar";
import api from "../services/api";

export default function OrderDetail() {
  const { id } = useParams(); // Gets the ID from the URL
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Order not found</h2>
        <button
          onClick={() => navigate("/orders")}
          className="text-emerald-700 font-bold underline"
        >
          Go back to my orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Projects
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Details (Left Side) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Project Details
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                  {order.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <Box className="text-emerald-600" size={32} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      Design File
                    </p>
                    <p className="font-bold text-gray-900 break-all">
                      {order.fileUrl.split("/").pop()}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-900 font-bold mb-2">
                    <MessageSquare size={18} className="text-emerald-600" />
                    <h3>Your Instructions</h3>
                  </div>
                  <div className="p-4 bg-white border border-gray-100 rounded-xl text-gray-600 leading-relaxed italic">
                    {order.notes ||
                      "No special instructions provided for this project."}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline / Progress Section */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Project Timeline</h3>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:bg-gray-100">
                <TimelineItem
                  icon={<FileText size={16} />}
                  title="Quote Requested"
                  date={new Date(order.createdAt).toLocaleDateString()}
                  active={true}
                />
                <TimelineItem
                  icon={<Clock size={16} />}
                  title="Printing in Progress"
                  date="Pending"
                  active={order.status === "printing"}
                />
                <TimelineItem
                  icon={<CheckCircle2 size={16} />}
                  title="Completed & Ready"
                  date="Pending"
                  active={order.status === "completed"}
                />
              </div>
            </div>
          </div>

          {/* Sidebar (Right Side) */}
          <div className="space-y-6">
            <div className="bg-[#133827] text-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Calendar size={18} />
                Order Info
              </h3>
              <div className="space-y-4 text-sm">
                <div className="border-b border-white/10 pb-2">
                  <div className="text-emerald-100/60">Order ID</div>
                  <span className="font-mono">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-100/60">
                    Estimated Delivery
                  </span>
                  <span>TBD</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                Need help with this project? Contact our support team quoting
                your Project ID.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Small helper for the timeline steps
function TimelineItem({ icon, title, date, active }: any) {
  return (
    <div className="relative flex items-center gap-6">
      <div
        className={`z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${active ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"}`}
      >
        {icon}
      </div>
      <div>
        <p
          className={`font-bold text-sm ${active ? "text-gray-900" : "text-gray-400"}`}
        >
          {title}
        </p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
  );
}
