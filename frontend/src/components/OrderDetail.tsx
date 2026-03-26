import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  Box,
  Calendar,
  MessageSquare,
  Loader2,
  Layers,
  Palette,
  MapPin,
  User,
} from "lucide-react";
import Navbar from "./Navbar";
import api from "../services/api";
import type { Order } from "../types"; // Import your updated Order interface

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
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
    if (id) fetchOrderDetails();
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
          Go back to my projects
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 3. Items List (Supporting Multiple Models) */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                3D Models in this Project
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
                        <p className="font-bold text-gray-900 truncate">
                          {item.fileName}
                        </p>
                        <div className="flex gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <Layers size={12} /> {item.material}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded">
                            <Palette size={12} /> {item.color}
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

            {/* Timeline */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-8">Project Timeline</h3>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:bg-gray-100">
                <TimelineItem
                  icon={<FileText size={16} />}
                  title="Quote Requested"
                  date={new Date(order.createdAt).toLocaleDateString()}
                  active={true}
                />
                <TimelineItem
                  icon={<Clock size={16} />}
                  title="Printing"
                  date="Pending"
                  active={order.status === "printing"}
                />
                <TimelineItem
                  icon={<CheckCircle2 size={16} />}
                  title="Completed"
                  date="Pending"
                  active={order.status === "completed"}
                />
              </div>
            </div>
          </div>

          {/* Sidebar: Address & Info */}
          <div className="space-y-6">
            <div className="bg-[#133827] text-white rounded-2xl p-8 shadow-lg">
              <h3 className="font-bold mb-6 flex items-center gap-2 text-emerald-400">
                <MapPin size={20} />
                Shipping Details
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <User size={16} className="text-emerald-500 shrink-0" />
                  <p className="font-bold">{order.fullName}</p>
                </div>
                <div className="flex gap-3">
                  <MapPin size={16} className="text-emerald-500 shrink-0" />
                  <div className="text-emerald-50/80">
                    <p>{order.addressLine1}</p>
                    <p>
                      {order.city}, {order.postalCode}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-emerald-100/40 text-xs uppercase font-bold tracking-widest mb-1">
                    Status
                  </p>
                  <p className="text-xl font-bold text-emerald-400 uppercase tracking-tight">
                    {order.status.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h4 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" /> Reference ID
              </h4>
              <p className="text-[10px] font-mono text-gray-400 break-all">
                {order.id}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

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
