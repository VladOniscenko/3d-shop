import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminBreadcrumb from "./AdminBreadcrumb";
import AdminLayout from "./AdminLayout";
import api from "../services/api";
import type { Order } from "../types";

const STATUS_OPTIONS = [
  "All",
  "pending_quote",
  "quoted",
  "printing",
  "completed",
  "shipped",
  "cancelled",
  "paid",
];
const SORT_FIELDS = ["createdAt", "status", "quotedPrice"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(16);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          search,
          status: statusFilter,
          sortBy,
          sortDir,
          page: String(page),
          pageSize: String(pageSize),
        });
        const res = await api.get(`/admin/orders?${query.toString()}`);
        setOrders(res.data.results);
        setTotalCount(res.data.totalCount);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [search, statusFilter, sortBy, sortDir, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <AdminLayout>
      <AdminBreadcrumb
        title="Order Management"
        items={[{ label: "Admin", to: "/admin" }, { label: "Orders" }]}
      />

      <div className="admin-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 p-4">
        <input
          className="admin-field"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="admin-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {SORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="admin-btn admin-btn-secondary"
        >
          Sort: {sortDir.toUpperCase()}
        </button>
      </div>

      {loading ? (
        <p className="admin-note">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="admin-note">No matching orders.</p>
      ) : (
        <div className="admin-panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Quoted</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-semibold text-[#0f766e] hover:underline"
                    >
                      {order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td>{order.fullName}</td>
                  <td className="capitalize">
                    {order.status.replace("_", " ")}
                  </td>
                  <td>
                    {order.quotedPrice
                      ? `€${order.quotedPrice.toFixed(2)}`
                      : "n/a"}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-[#60736d]">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="admin-btn admin-btn-secondary"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="admin-btn admin-btn-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
