import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminBreadcrumb from "./AdminBreadcrumb";
import AdminLayout from "./AdminLayout";
import api from "../services/api";
import type { Order } from "../types";
import { useNotify } from "../context/NotifyContext";
import { resolveAssetUrl } from "../utils/assetUrl";

interface OrderCommunication {
  id: string;
  channel: string;
  communicationType: string;
  subject: string;
  recipientEmail: string;
  sentAt: string;
}

interface OrderStatusHistoryEntry {
  id: string;
  previousStatus?: string | null;
  newStatus: string;
  changedAt: string;
  changedBy?: string | null;
  note?: string | null;
}

export default function AdminOrderDetail() {
  const { notifyError, notifySuccess } = useNotify();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalNotes, setInternalNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [fullName, setFullName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [itemPrices, setItemPrices] = useState<{ [key: string]: number }>({});
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [orderDiscountAmount, setOrderDiscountAmount] = useState(0);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [savingOrderDiscount, setSavingOrderDiscount] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailType, setEmailType] = useState("quote_requested");
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);
  const [communications, setCommunications] = useState<OrderCommunication[]>(
    [],
  );
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistoryEntry[]>(
    [],
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Status dropdown state
  const [selectedStatus, setSelectedStatus] = useState("pending");

  useEffect(() => {
    if (!id) return;

    const applyOrderData = (data: Order) => {
      setOrder(data);
      setFullName(data.fullName);
      setAddressLine1(data.addressLine1);
      setAddressLine2(data.addressLine2 || "");
      setCity(data.city);
      setPostalCode(data.postalCode);
      setPhoneNumber(data.phoneNumber);

      const prices: { [key: string]: number } = {};
      data.items.forEach((item: any) => {
        if (item.id) prices[item.id] = item.price || 0;
      });

      setItemPrices(prices);
      setDeliveryPrice(data.deliveryPrice || 0);
      setOrderDiscountAmount(data.orderDiscountAmount || 0);
      setSelectedStatus(data.status || "pending");
      setTrackingCode(data.trackingCode || "");
      setTrackingUrl(data.trackingUrl || "");
      setInternalNotes(data.internalNotes || "");
      setCustomerNotes(data.customerNotes || "");
    };

    const getOrder = async () => {
      try {
        const [res, commsRes, statusRes] = await Promise.all([
          api.get(`/admin/orders/${id}`),
          api.get(`/admin/orders/${id}/communications`),
          api.get(`/admin/orders/${id}/status-history`),
        ]);
        applyOrderData(res.data);
        setCommunications(commsRes.data || []);
        setStatusHistory(statusRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getOrder();
  }, [id]);
  const updateOrderStatus = async () => {
    if (!id) return;
    try {
      await api.put(`/admin/orders/${id}`, {
        ...order,
        status: selectedStatus,
      });
      await refresh();
      notifySuccess("Order status updated.");
    } catch (err) {
      console.error(err);
      notifyError("Could not update order status.");
    }
  };

  const refresh = async () => {
    if (!id) return;
    const [res, commsRes, statusRes] = await Promise.all([
      api.get(`/admin/orders/${id}`),
      api.get(`/admin/orders/${id}/communications`),
      api.get(`/admin/orders/${id}/status-history`),
    ]);
    setOrder(res.data);
    setTrackingCode(res.data.trackingCode || "");
    setTrackingUrl(res.data.trackingUrl || "");
    setCommunications(commsRes.data || []);
    setStatusHistory(statusRes.data || []);
  };

  const saveTracking = async () => {
    if (!id) return;
    if (!trackingCode.trim()) {
      notifyError("Tracking code is required.");
      return;
    }

    setSavingTracking(true);
    try {
      await api.patch(`/admin/orders/${id}/tracking`, {
        trackingCode: trackingCode.trim(),
        trackingUrl: trackingUrl.trim() || null,
      });
      await refresh();
      notifySuccess("Tracking saved on order.");
    } catch (err) {
      console.error(err);
      notifyError("Could not save tracking details.");
    } finally {
      setSavingTracking(false);
    }
  };

  const updateItemPrice = async (itemId: string, price: number) => {
    if (!id) return;
    setSavingItemId(itemId);
    try {
      await api.put(`/admin/orders/${id}/items/${itemId}`, { price });
      await refresh();
      notifySuccess("Item price updated.");
    } catch (err) {
      console.error(err);
      notifyError("Could not update item price.");
    } finally {
      setSavingItemId(null);
    }
  };

  const updateDeliveryPrice = async (price: number) => {
    if (!id) return;
    setSavingDelivery(true);
    try {
      await api.patch(`/admin/orders/${id}/delivery-price`, {
        deliveryPrice: price,
      });
      await refresh();
      notifySuccess("Delivery price updated.");
    } catch (err) {
      console.error(err);
      notifyError("Could not update delivery price.");
    } finally {
      setSavingDelivery(false);
    }
  };

  const updateOrderDiscount = async (discount: number) => {
    if (!id) return;
    if (discount < 0) {
      notifyError("Order discount cannot be negative.");
      return;
    }

    setSavingOrderDiscount(true);
    try {
      await api.patch(`/admin/orders/${id}/order-discount`, {
        orderDiscountAmount: discount,
      });
      await refresh();
      notifySuccess("Order discount updated.");
    } catch (err) {
      console.error(err);
      notifyError("Could not update order discount.");
    } finally {
      setSavingOrderDiscount(false);
    }
  };

  const deleteOrder = async () => {
    if (!id) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      notifySuccess("Order deleted.");
      navigate("/admin/orders");
    } catch (err) {
      console.error(err);
      notifyError("Could not delete order.");
    }
  };

  const saveNotes = async () => {
    if (!id) return;
    try {
      await api.put(`/admin/orders/${id}/notes`, {
        internalNotes,
        customerNotes,
      });
      await refresh();
      notifySuccess("Notes saved.");
    } catch (err) {
      console.error(err);
      notifyError("Could not save notes.");
    }
  };

  const saveCustomerInfo = async () => {
    if (!id) return;
    try {
      await api.put(`/admin/orders/${id}`, {
        fullName,
        addressLine1,
        addressLine2,
        city,
        postalCode,
        phoneNumber,
      });
      await refresh();
      setEditingCustomer(false);
      notifySuccess("Customer info updated.");
    } catch (err) {
      console.error(err);
      notifyError("Could not update customer info.");
    }
  };

  const sendCustomerEmail = async () => {
    if (!id) return;

    if (emailType === "order_sent_tracking" && !trackingCode.trim()) {
      notifyError("Tracking code is required for sent email.");
      return;
    }

    setSendingEmail(true);
    try {
      await api.post(`/admin/orders/${id}/email`, {
        type: emailType,
        price: null,
        message: null,
        trackingCode:
          emailType === "order_sent_tracking" ? trackingCode.trim() : null,
        trackingUrl:
          emailType === "order_sent_tracking" ? trackingUrl.trim() : null,
      });
      notifySuccess("Email sent to customer.");
    } catch (err: any) {
      console.error(err);
      notifyError(
        err?.response?.data?.message || "Could not send customer email.",
      );
    } finally {
      setSendingEmail(false);
    }
  };

  const statusStyle = (status: string) => {
    const base = "admin-status-pill";
    switch (status) {
      case "pending_quote":
        return `${base} bg-amber-100 text-amber-800`;
      case "quoted":
        return `${base} bg-sky-100 text-sky-800`;
      case "printing":
        return `${base} bg-indigo-100 text-indigo-800`;
      case "completed":
        return `${base} bg-emerald-100 text-emerald-800`;
      case "paid":
        return `${base} bg-teal-100 text-teal-800`;
      case "cancelled":
        return `${base} bg-rose-100 text-rose-800`;
      default:
        return `${base} bg-slate-100 text-slate-700`;
    }
  };

  if (loading) {
    return (
      <div className="admin-shell flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-shell flex flex-col items-center justify-center">
        <p>Order not found</p>
        <Link to="/admin/orders" className="mt-2 text-teal-700 underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const subtotal =
    order.items.reduce((sum, item) => {
      const key = item.id ?? "";
      return (
        sum +
        (key && itemPrices[key] !== undefined
          ? itemPrices[key]
          : item.price || 0) *
          (item.count ?? 1)
      );
    }, 0) || 0;

  const totalPrice = Math.max(0, subtotal + deliveryPrice - orderDiscountAmount);

  return (
    <AdminLayout>
      <AdminBreadcrumb
        title={`Order ${order.id.slice(0, 8)}`}
        items={[
          { label: "Admin", to: "/admin" },
          { label: "Orders", to: "/admin/orders" },
          { label: order.id.slice(0, 8) },
        ]}
      />

      <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <article className="admin-panel p-4">
          <p className="text-xs uppercase text-[#6c817a]">Status</p>
          <p className={`${statusStyle(order.status)} mt-2 w-fit`}>
            {order.status.replace("_", " ")}
          </p>
        </article>
        <article className="admin-panel p-4">
          <p className="text-xs uppercase text-[#6c817a]">Created</p>
          <p className="mt-2 text-sm text-[#2e423d]">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </article>
        <article className="admin-panel p-4">
          <p className="text-xs uppercase text-[#6c817a]">Items</p>
          <p className="mt-2 text-xl font-semibold text-[#1b2b25]">
            {order.items.length}
          </p>
        </article>
        <article className="admin-panel p-4">
          <p className="text-xs uppercase text-[#6c817a]">Total</p>
          <p className="mt-2 text-xl font-semibold text-[#1b2b25]">
            EUR {totalPrice.toFixed(2)}
          </p>
        </article>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <article className="admin-panel p-4">
            <h2 className="font-bold mb-2 text-[#1b2b25]">
              Model files & specs
            </h2>
            {order.items.length === 0 ? (
              <p className="admin-note">No items in this order.</p>
            ) : (
              <ul className="space-y-3">
                {order.items.map((item) => (
                  <li
                    key={item.id || item.fileName}
                    className="rounded-lg border border-[#d9e4df] bg-[#f7fcf9] p-2"
                  >
                    <p className="font-semibold text-[#22342f]">
                      {item.fileName ?? item.fileUrl}
                    </p>
                    <p className="text-xs text-[#5c716b]">
                      Material: {item.material}, Color: {item.color}, Qty:{" "}
                      {item.count}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[#304843]">Price: EUR</span>
                      <input
                        type="number"
                        value={item.id ? itemPrices[item.id] || 0 : 0}
                        onChange={(e) => {
                          if (!item.id) return;
                          const newPrice = parseFloat(e.target.value) || 0;
                          setItemPrices({
                            ...itemPrices,
                            [item.id]: newPrice,
                          });
                        }}
                        className="admin-field w-24"
                      />
                      <button
                        type="button"
                        disabled={!item.id || savingItemId === item.id}
                        onClick={() =>
                          item.id &&
                          updateItemPrice(item.id, itemPrices[item.id] || 0)
                        }
                        className="admin-btn admin-btn-primary"
                      >
                        {savingItemId === item.id ? "Saving..." : "Save"}
                      </button>
                    </div>
                    {item.fileUrl && (
                      <a
                        href={resolveAssetUrl(item.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-teal-700 hover:underline"
                      >
                        Download/Preview file
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex items-center justify-end gap-2">
              <span className="text-[#304843]">Delivery: EUR</span>
              <input
                type="number"
                value={deliveryPrice}
                onChange={(e) => {
                  const newPrice = parseFloat(e.target.value) || 0;
                  setDeliveryPrice(newPrice);
                }}
                className="admin-field w-24"
              />
              <button
                type="button"
                disabled={savingDelivery}
                onClick={() => updateDeliveryPrice(deliveryPrice)}
                className="admin-btn admin-btn-primary"
              >
                {savingDelivery ? "Saving..." : "Save"}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-end gap-2">
              <span className="text-[#304843]">Order discount: EUR</span>
              <input
                type="number"
                min="0"
                value={orderDiscountAmount}
                onChange={(e) => {
                  const newDiscount = parseFloat(e.target.value) || 0;
                  setOrderDiscountAmount(newDiscount);
                }}
                className="admin-field w-24"
              />
              <button
                type="button"
                disabled={savingOrderDiscount}
                onClick={() => updateOrderDiscount(orderDiscountAmount)}
                className="admin-btn admin-btn-primary"
              >
                {savingOrderDiscount ? "Saving..." : "Save"}
              </button>
            </div>
            <div className="mt-1 text-right">
              <p className="text-sm text-[#5f736d]">
                Subtotal: EUR {subtotal.toFixed(2)} | Delivery: EUR {deliveryPrice.toFixed(2)} | Discount: EUR {orderDiscountAmount.toFixed(2)}
              </p>
              <span className="font-bold">
                Total (including delivery): EUR {totalPrice.toFixed(2)}
              </span>
            </div>
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">Status History</h3>
            {statusHistory.length === 0 ? (
              <p className="admin-note">No status changes recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#5f736d] border-b border-[#d9e4df]">
                      <th className="py-2 pr-3">Changed At</th>
                      <th className="py-2 pr-3">From</th>
                      <th className="py-2 pr-3">To</th>
                      <th className="py-2 pr-3">By</th>
                      <th className="py-2">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusHistory.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-[#eef4f1] text-[#304843]"
                      >
                        <td className="py-2 pr-3 whitespace-nowrap">
                          {new Date(entry.changedAt).toLocaleString()}
                        </td>
                        <td className="py-2 pr-3">
                          {entry.previousStatus || "-"}
                        </td>
                        <td className="py-2 pr-3 font-semibold">
                          {entry.newStatus}
                        </td>
                        <td className="py-2 pr-3">{entry.changedBy || "-"}</td>
                        <td className="py-2">{entry.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">
              Communication History
            </h3>
            {communications.length === 0 ? (
              <p className="admin-note">No communication has been sent yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#5f736d] border-b border-[#d9e4df]">
                      <th className="py-2 pr-3">Sent At</th>
                      <th className="py-2 pr-3">Type</th>
                      <th className="py-2 pr-3">Channel</th>
                      <th className="py-2 pr-3">Recipient</th>
                      <th className="py-2">Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {communications.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-[#eef4f1] text-[#304843]"
                      >
                        <td className="py-2 pr-3 whitespace-nowrap">
                          {new Date(entry.sentAt).toLocaleString()}
                        </td>
                        <td className="py-2 pr-3">{entry.communicationType}</td>
                        <td className="py-2 pr-3">{entry.channel}</td>
                        <td className="py-2 pr-3">{entry.recipientEmail}</td>
                        <td className="py-2">{entry.subject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </div>

        <div className="space-y-5">
          <article className="admin-panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-bold text-[#1b2b25]">Customer info</h2>
              <button
                onClick={() => setEditingCustomer(!editingCustomer)}
                className="text-sm text-teal-700 hover:underline"
              >
                {editingCustomer ? "Cancel" : "Edit"}
              </button>
            </div>
            {editingCustomer ? (
              <div className="space-y-2">
                <label className="admin-label">
                  <span className="font-semibold">Full Name</span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="admin-field"
                  />
                </label>
                <label className="admin-label">
                  <span className="font-semibold">Address Line 1</span>
                  <input
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Address Line 1"
                    className="admin-field"
                  />
                </label>
                <label className="admin-label">
                  <span className="font-semibold">Address Line 2</span>
                  <input
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Address Line 2"
                    className="admin-field"
                  />
                </label>
                <label className="admin-label">
                  <span className="font-semibold">City</span>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="admin-field"
                  />
                </label>
                <label className="admin-label">
                  <span className="font-semibold">Postal Code</span>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postal Code"
                    className="admin-field"
                  />
                </label>
                <label className="admin-label">
                  <span className="font-semibold">Phone Number</span>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone Number"
                    className="admin-field"
                  />
                </label>
                <button
                  onClick={saveCustomerInfo}
                  className="admin-btn admin-btn-primary"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-[#2e423d]">
                <p>{order.fullName}</p>
                <p>
                  {order.addressLine1}
                  {order.addressLine2 ? `, ${order.addressLine2}` : ""}
                </p>
                <p>
                  {order.city}, {order.postalCode}
                </p>
                <p>{order.phoneNumber}</p>
              </div>
            )}
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">Order Actions</h3>
            <div className="grid gap-2">
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="admin-select"
                >
                  <option value="pending_quote">Pending Quote</option>
                  <option value="quoted">Quoted</option>
                  <option value="printing">Printing</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={updateOrderStatus}
                >
                  Update Status
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="admin-btn admin-btn-danger"
              >
                Delete Order
              </button>
              {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="admin-panel w-full max-w-sm p-6">
                    <p className="mb-4 font-semibold">
                      Are you sure you want to delete this order? This will also
                      delete all associated files.
                    </p>
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={async () => {
                          setShowDeleteConfirm(false);
                          await deleteOrder();
                        }}
                      >
                        Yes, Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">Track and Trace</h3>
            <div className="grid gap-3">
              <div>
                <label className="block text-xs uppercase text-[#6c817a]">
                  Tracking Code
                </label>
                <input
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="admin-field"
                  placeholder="e.g. 3SPQ123456789"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-[#6c817a]">
                  Tracking URL (optional)
                </label>
                <input
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="admin-field"
                  placeholder="https://carrier.example/track/..."
                />
              </div>
              <button
                type="button"
                onClick={saveTracking}
                disabled={savingTracking}
                className="admin-btn admin-btn-secondary w-fit"
              >
                {savingTracking ? "Saving..." : "Save Tracking"}
              </button>
            </div>
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">Communication</h3>
            <div className="grid gap-3">
              <div>
                <label className="block text-xs uppercase text-[#6c817a]">
                  Email Type
                </label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="admin-select"
                >
                  <option value="quote_requested">Quote Requested</option>
                  <option value="quote_confirmation">
                    Quote Confirmation + Price
                  </option>
                  <option value="order_sent_tracking">
                    Order Sent + Track and Trace
                  </option>
                </select>
              </div>

              {emailType === "quote_confirmation" && (
                <p className="text-sm text-[#5b706a]">
                  Price and message are generated automatically from order item
                  prices, delivery, and order discount.
                </p>
              )}

              {emailType === "order_sent_tracking" && (
                <p className="text-sm text-[#5b706a]">
                  Uses the saved tracking details above.
                </p>
              )}

              <button
                type="button"
                onClick={sendCustomerEmail}
                disabled={sendingEmail}
                className="admin-btn admin-btn-primary w-fit"
              >
                {sendingEmail ? "Sending..." : "Send Email"}
              </button>
            </div>
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">Notes</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#5f736d]">
                  Internal Notes
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  className="admin-textarea"
                />
              </div>
              <div>
                <label className="block text-xs text-[#5f736d]">
                  Customer Notes
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                  className="admin-textarea"
                />
              </div>
              <button
                onClick={saveNotes}
                className="admin-btn admin-btn-primary"
              >
                Save Notes
              </button>
            </div>
          </article>

          <article className="admin-panel p-4">
            <h3 className="font-bold mb-2 text-[#1b2b25]">
              Admin & Customer Messaging
            </h3>
            <p className="text-sm text-[#5b706a]">
              Quote: {order.quoteMessage || "None"}
            </p>
            <p className="text-sm text-[#5b706a]">
              Internal Notes: {order.internalNotes || "None"}
            </p>
            <p className="text-sm text-[#5b706a]">
              Customer Notes: {order.customerNotes || "None"}
            </p>
          </article>
        </div>
      </div>
    </AdminLayout>
  );
}
