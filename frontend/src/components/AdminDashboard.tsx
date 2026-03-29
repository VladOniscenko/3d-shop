import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminBreadcrumb from "./AdminBreadcrumb";
import AdminLayout from "./AdminLayout";
import api from "../services/api";
import type { Filament, Order, Product } from "../types";
import { formatOrderStatusLabel } from "../utils/orderStatus";
import { useI18n } from "../i18n/I18nContext";

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
  const { t } = useI18n();
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
        setError(t("admin.dashboard.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  if (loading) {
    return (
      <div className="admin-shell flex items-center justify-center">
        <div>{t("admin.loadingDashboard")}</div>
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
      <AdminBreadcrumb
        title={t("admin.dashboard.title")}
        items={[{ label: t("breadcrumb.admin") }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={t("admin.dashboard.totalUsers")}
          value={usersCount || summary.totalUsers}
          hint={t("admin.dashboard.hintRegisteredAccounts")}
        />
        <StatCard
          label={t("admin.dashboard.totalOrders")}
          value={summary.totalOrders}
          hint={t("admin.dashboard.hintAllTime")}
        />
        <StatCard
          label={t("admin.dashboard.pendingOrders")}
          value={summary.pendingOrders}
          hint={t("admin.dashboard.hintNeedsAction")}
        />
        <StatCard
          label={t("admin.dashboard.paidOrders")}
          value={paidOrders}
          hint={t("admin.dashboard.hintConfirmedPayments")}
        />
        <StatCard
          label={t("admin.dashboard.quotedOrders")}
          value={quotedOrders}
          hint={t("admin.dashboard.hintQuoteSent")}
        />
        <StatCard
          label={t("admin.dashboard.printingOrders")}
          value={printingOrders}
          hint={t("admin.dashboard.hintInProduction")}
        />
        <StatCard
          label={t("admin.dashboard.sentOrders")}
          value={sentOrders}
          hint={t("admin.dashboard.hintShipped")}
        />
        <StatCard
          label={t("admin.dashboard.deliveredOrders")}
          value={deliveredOrders}
          hint={t("admin.dashboard.hintReachedCustomer")}
        />
        <StatCard
          label={t("admin.dashboard.completedOrders")}
          value={completedOrders}
          hint={t("admin.dashboard.hintCompletedLifecycle")}
        />
        <StatCard
          label={t("admin.dashboard.cancelledOrders")}
          value={cancelledOrders}
          hint={t("admin.dashboard.hintCancelledByAdminUser")}
        />
        <StatCard
          label={t("admin.dashboard.orders24h")}
          value={ordersToday}
          hint={t("admin.dashboard.hintLastDay")}
        />
        <StatCard
          label={t("admin.dashboard.orders7d")}
          value={ordersThisWeek}
          hint={t("admin.dashboard.hintLastWeek")}
        />
        <StatCard
          label={t("admin.dashboard.orders30d")}
          value={ordersThisMonth}
          hint={t("admin.dashboard.hintLastMonth")}
        />
        <StatCard
          label={t("admin.dashboard.uniqueCustomers")}
          value={uniqueCustomers}
          hint={t("admin.dashboard.hintCustomersWithOrders")}
        />
        <StatCard
          label={t("admin.dashboard.totalItemQty")}
          value={totalOrderItems}
          hint={t("admin.dashboard.hintUnitsAcrossOrders")}
        />
        <StatCard
          label={t("admin.dashboard.avgItemsPerOrder")}
          value={avgItemsPerOrder.toFixed(2)}
          hint={t("admin.dashboard.hintOperationalComplexity")}
        />
        <StatCard
          label={t("admin.dashboard.quotedRevenue")}
          value={`EUR ${quotedRevenue.toFixed(2)}`}
          hint={t("admin.dashboard.hintSumQuotedPrices")}
        />
        <StatCard
          label={t("admin.dashboard.paidRevenue")}
          value={`EUR ${paidRevenue.toFixed(2)}`}
          hint={t("admin.dashboard.hintRevenuePaidOrders")}
        />
        <StatCard
          label={t("admin.dashboard.avgQuoteValue")}
          value={`EUR ${averageQuotedValue.toFixed(2)}`}
          hint={t("admin.dashboard.hintAverageQuotedOrder")}
        />
        <StatCard
          label={t("admin.dashboard.products")}
          value={products.length}
          hint={t("admin.dashboard.hintCatalogSize")}
        />
        <StatCard
          label={t("admin.dashboard.filamentSkus")}
          value={filaments.length}
          hint={t("admin.dashboard.hintMaterialColorEntries")}
        />
        <StatCard
          label={t("admin.dashboard.inStockFilaments")}
          value={inStockFilaments}
          hint={t("admin.dashboard.hintAvailableNow")}
        />
        <StatCard
          label={t("admin.dashboard.lowStockFilaments")}
          value={lowStockFilaments}
          hint={t("admin.dashboard.hintOneToHundred")}
        />
        <StatCard
          label={t("admin.dashboard.outOfStockFilaments")}
          value={outOfStockFilaments}
          hint={t("admin.dashboard.hintNeedsRestock")}
        />
        <StatCard
          label={t("admin.dashboard.materials")}
          value={uniqueMaterials}
          hint={t("admin.dashboard.hintDistinctFilamentMaterials")}
        />
        <StatCard
          label={t("admin.dashboard.avgFilamentPricePerGram")}
          value={`EUR ${averageFilamentPrice.toFixed(4)}`}
          hint={t("admin.dashboard.hintAcrossFilamentSkus")}
        />
      </div>

      <section className="admin-panel p-6">
        <h2 className="text-xl font-semibold mb-4 text-[#16251f]">
          {t("admin.dashboard.recentOrders")}
        </h2>
        {summary.recentOrders.length === 0 ? (
          <p className="admin-note">{t("admin.noRecentOrders")}</p>
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
