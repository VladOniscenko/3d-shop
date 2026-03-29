import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminBreadcrumb from "./AdminBreadcrumb";
import AdminLayout from "./AdminLayout";
import api from "../services/api";

type AdminPaymentRecord = {
  id: string;
  orderId: string;
  provider: string;
  reference: string;
  providerPaymentId?: string;
  currency: string;
  amount: number;
  status: string;
  method?: string;
  failureReason?: string;
  paidAt?: string;
  canceledAt?: string;
  expiredAt?: string;
  failedAt?: string;
  lastWebhookAt?: string;
  webhookAttemptCount?: number;
  createdAt: string;
  updatedAt?: string;
  order?: {
    id: string;
    status: string;
    userId?: string;
    fullName?: string;
    orderType?: string;
  } | null;
};

type PaymentsResponse = {
  results: AdminPaymentRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
};

const STATUS_OPTIONS = [
  "all",
  "paid",
  "failed",
  "expired",
  "canceled",
  "pending",
  "open",
];

export default function AdminPayments() {
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [provider, setProvider] = useState("mollie");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });

        if (provider.trim()) query.set("provider", provider.trim());
        if (status !== "all") query.set("status", status);
        if (search.trim()) {
          query.set("reference", search.trim());
          query.set("providerPaymentId", search.trim());
        }
        if (fromDate) query.set("fromUtc", `${fromDate}T00:00:00.000Z`);
        if (toDate) query.set("toUtc", `${toDate}T23:59:59.999Z`);

        const res = await api.get<PaymentsResponse>(`/admin/payments?${query.toString()}`);
        setPayments(res.data.results || []);
        setTotalCount(res.data.totalCount || 0);
      } catch (error) {
        console.error("Failed to fetch admin payments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [page, pageSize, provider, status, search, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <AdminLayout>
      <AdminBreadcrumb
        title="Payment Tracking"
        items={[
          { label: "Admin", to: "/admin" },
          { label: "Payments" },
        ]}
      />

      <div className="admin-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5 p-4">
        <input
          className="admin-field lg:col-span-2"
          placeholder="Reference or provider payment id"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="admin-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <input
          className="admin-field"
          placeholder="Provider"
          value={provider}
          onChange={(e) => {
            setProvider(e.target.value);
            setPage(1);
          }}
        />

        <div className="grid grid-cols-2 gap-2 lg:col-span-5">
          <input
            type="date"
            className="admin-field"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
          />
          <input
            type="date"
            className="admin-field"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {loading ? (
        <p className="admin-note">Loading payments...</p>
      ) : payments.length === 0 ? (
        <p className="admin-note">No payments match your filters.</p>
      ) : (
        <div className="admin-panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Created</th>
                <th>Order</th>
                <th>Reference</th>
                <th>Provider Payment ID</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Webhook Attempts</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{new Date(payment.createdAt).toLocaleString()}</td>
                  <td>
                    <Link
                      to={`/admin/orders/${payment.orderId}`}
                      className="font-semibold text-[#0f766e] hover:underline"
                    >
                      {payment.orderId.slice(0, 8)}
                    </Link>
                    {payment.order?.fullName && (
                      <p className="text-xs text-[#60736d]">{payment.order.fullName}</p>
                    )}
                  </td>
                  <td className="font-mono text-xs">{payment.reference}</td>
                  <td className="font-mono text-xs">{payment.providerPaymentId || "-"}</td>
                  <td>{payment.status}</td>
                  <td>
                    {payment.currency} {Number(payment.amount || 0).toFixed(2)}
                  </td>
                  <td>{payment.webhookAttemptCount || 0}</td>
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
