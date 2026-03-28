import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminBreadcrumb from "./AdminBreadcrumb";
import AdminLayout from "./AdminLayout";
import api from "../services/api";
import type { Filament, Order, Product } from "../types";
import { formatOrderStatusLabel } from "../utils/orderStatus";

interface Summary {
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  recentOrders: Order[];
}

interface OrdersResponse {
  results: Order[];
  totalCount: number;
}

type DashboardData = {
  summary: Summary;
  orders: Order[];
  usersCount: number;
  products: Product[];
  filaments: Filament[];
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="admin-kpi-card">
      <h2 className="admin-kpi-label">{label}</h2>
      <p className="admin-kpi-value">{value}</p>
      {hint ? <p className="admin-kpi-hint">{hint}</p> : null}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, ordersRes, usersRes, productsRes, filamentsRes] =
          await Promise.all([
            api.get<Summary>("/admin/summary"),
            api.get<OrdersResponse>(
              "/admin/orders?page=1&pageSize=5000&sortBy=createdAt&sortDir=desc",
            ),
            api.get<{ totalCount: number }>("/admin/users?page=1&pageSize=1"),
            api.get<Product[]>("/products"),
            api.get<Filament[]>("/filaments"),
          ]);

        setData({
          summary: summaryRes.data,
          orders: ordersRes.data.results || [],
          usersCount: usersRes.data.totalCount || 0,
          products: Array.isArray(productsRes.data) ? productsRes.data : [],
          filaments: Array.isArray(filamentsRes.data) ? filamentsRes.data : [],
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load admin dashboard data. Are you authorized?");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="admin-shell flex items-center justify-center">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-shell flex items-center justify-center text-rose-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { summary, orders, usersCount, products, filaments } = data;

  const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
    const key = order.status || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const paidOrders = orders.filter(
    (order) => order.isPaid || order.status === "paid",
  ).length;
  const cancelledOrders = statusCounts.cancelled || 0;
  const quotedOrders = statusCounts.quoted || 0;
  const printingOrders = statusCounts.printing || 0;
  const sentOrders = statusCounts.sent || 0;
  const deliveredOrders = statusCounts.delivered || 0;
  const completedOrders = statusCounts.completed || 0;

  const quotedRevenue = orders.reduce(
    (sum, order) => sum + (order.quotedPrice || 0),
    0,
  );
  const paidRevenue = orders
    .filter((order) => order.isPaid || order.status === "paid")
    .reduce((sum, order) => sum + (order.quotedPrice || 0), 0);

  const ordersWithQuote = orders.filter(
    (order) => (order.quotedPrice || 0) > 0,
  );
  const averageQuotedValue =
    ordersWithQuote.length > 0 ? quotedRevenue / ordersWithQuote.length : 0;

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const ordersToday = orders.filter(
    (order) => new Date(order.createdAt) >= dayAgo,
  ).length;
  const ordersThisWeek = orders.filter(
    (order) => new Date(order.createdAt) >= weekAgo,
  ).length;
  const ordersThisMonth = orders.filter(
    (order) => new Date(order.createdAt) >= monthAgo,
  ).length;

  const uniqueCustomers = new Set(orders.map((o) => o.userId)).size;
  const totalOrderItems = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((inner, item) => inner + (item.count || 0), 0),
    0,
  );
  const avgItemsPerOrder =
    orders.length > 0 ? totalOrderItems / orders.length : 0;

  const lowStockFilaments = filaments.filter(
    (f) => (f.stockQuantity || 0) > 0 && (f.stockQuantity || 0) <= 100,
  ).length;
  const outOfStockFilaments = filaments.filter(
    (f) => (f.stockQuantity || 0) <= 0,
  ).length;
  const inStockFilaments = filaments.filter(
    (f) => (f.stockQuantity || 0) > 0,
  ).length;
  const uniqueMaterials = new Set(filaments.map((f) => f.material)).size;
  const averageFilamentPrice =
    filaments.length > 0
      ? filaments.reduce((sum, f) => sum + (f.pricePerGram || 0), 0) /
        filaments.length
      : 0;

  return (
    <AdminLayout>
      <AdminBreadcrumb title="Admin Dashboard" items={[{ label: "Admin" }]} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={usersCount || summary.totalUsers}
          hint="Registered accounts"
        />
        <StatCard
          label="Total Orders"
          value={summary.totalOrders}
          hint="All time"
        />
        <StatCard
          label="Pending Orders"
          value={summary.pendingOrders}
          hint="Needs review/action"
        />
        <StatCard
          label="Paid Orders"
          value={paidOrders}
          hint="Confirmed payments"
        />
        <StatCard
          label="Quoted Orders"
          value={quotedOrders}
          hint="Quote sent"
        />
        <StatCard
          label="Printing Orders"
          value={printingOrders}
          hint="In production"
        />
        <StatCard label="Sent Orders" value={sentOrders} hint="Shipped" />
        <StatCard
          label="Delivered Orders"
          value={deliveredOrders}
          hint="Reached customer"
        />
        <StatCard
          label="Completed Orders"
          value={completedOrders}
          hint="Completed lifecycle"
        />
        <StatCard
          label="Cancelled Orders"
          value={cancelledOrders}
          hint="Cancelled by admin/user"
        />
        <StatCard label="Orders (24h)" value={ordersToday} hint="Last day" />
        <StatCard label="Orders (7d)" value={ordersThisWeek} hint="Last week" />
        <StatCard
          label="Orders (30d)"
          value={ordersThisMonth}
          hint="Last month"
        />
        <StatCard
          label="Unique Customers"
          value={uniqueCustomers}
          hint="Customers with orders"
        />
        <StatCard
          label="Total Item Qty"
          value={totalOrderItems}
          hint="Units across all orders"
        />
        <StatCard
          label="Avg Items / Order"
          value={avgItemsPerOrder.toFixed(2)}
          hint="Operational complexity"
        />
        <StatCard
          label="Quoted Revenue"
          value={`EUR ${quotedRevenue.toFixed(2)}`}
          hint="Sum of quoted prices"
        />
        <StatCard
          label="Paid Revenue"
          value={`EUR ${paidRevenue.toFixed(2)}`}
          hint="Revenue from paid orders"
        />
        <StatCard
          label="Avg Quote Value"
          value={`EUR ${averageQuotedValue.toFixed(2)}`}
          hint="Average quoted order"
        />
        <StatCard
          label="Products"
          value={products.length}
          hint="Catalog size"
        />
        <StatCard
          label="Filament SKUs"
          value={filaments.length}
          hint="Material-color entries"
        />
        <StatCard
          label="In-stock Filaments"
          value={inStockFilaments}
          hint="Available right now"
        />
        <StatCard
          label="Low-stock Filaments"
          value={lowStockFilaments}
          hint="1-100 units"
        />
        <StatCard
          label="Out-of-stock Filaments"
          value={outOfStockFilaments}
          hint="Needs restock"
        />
        <StatCard
          label="Materials"
          value={uniqueMaterials}
          hint="Distinct filament materials"
        />
        <StatCard
          label="Avg Filament Price/g"
          value={`EUR ${averageFilamentPrice.toFixed(4)}`}
          hint="Across filament SKUs"
        />
      </div>

      <section className="admin-panel p-6">
        <h2 className="text-xl font-semibold mb-4 text-[#16251f]">
          Recent Orders
        </h2>
        {summary.recentOrders.length === 0 ? (
          <p className="admin-note">No recent orders found.</p>
        ) : (
          <div className="space-y-3">
            {summary.recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="block rounded-xl border border-[#dbe7e2] bg-[#f7fcf9] p-3 transition-colors hover:bg-[#eaf6f2]"
              >
                <div className="flex justify-between">
                  <span className="font-bold text-[#1f312b]">
                    Project #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-sm text-[#5f736d]">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-[#516760]">
                  {order.fullName} • {formatOrderStatusLabel(order.status)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
