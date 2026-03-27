import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import AdminBreadcrumb from "./AdminBreadcrumb";
import api from "../services/api";
import type { Order } from "../types";

interface Summary {
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  recentOrders: Order[];
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/admin/summary");
        setSummary(res.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load admin summary. Are you authorized?");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <AdminBreadcrumb
          title="Admin Dashboard"
          items={[{ label: "Admin" }]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm text-gray-500">Total Users</h2>
            <p className="text-3xl font-bold">{summary.totalUsers}</p>
          </div>
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm text-gray-500">Total Orders</h2>
            <p className="text-3xl font-bold">{summary.totalOrders}</p>
          </div>
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm text-gray-500">Pending Orders</h2>
            <p className="text-3xl font-bold">{summary.pendingOrders}</p>
          </div>
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm text-gray-500">Quick Actions</h2>
            <Link
              to="/admin/orders"
              className="block text-emerald-700 hover:underline mt-2"
            >
              Manage Orders
            </Link>
            <Link
              to="/admin/users"
              className="block text-emerald-700 hover:underline mt-1"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/products"
              className="block text-emerald-700 hover:underline mt-1"
            >
              Manage Products
            </Link>
            <Link
              to="/admin/filaments"
              className="block text-emerald-700 hover:underline mt-1"
            >
              Manage Filaments
            </Link>
          </div>
        </div>

        <section className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          {summary.recentOrders.length === 0 ? (
            <p className="text-gray-500">No recent orders found.</p>
          ) : (
            <div className="space-y-3">
              {summary.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="block bg-gray-50 p-3 rounded-xl border border-gray-100 hover:bg-emerald-50"
                >
                  <div className="flex justify-between">
                    <span className="font-bold">
                      Project #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.fullName} • {order.status.replace("_", " ")}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
