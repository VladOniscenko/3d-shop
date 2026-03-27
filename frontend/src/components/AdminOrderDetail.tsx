import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import api from "../services/api";
import type { Order } from "../types";
import { useNotify } from "../context/NotifyContext";

export default function AdminOrderDetail() {
  const { notifyError, notifySuccess } = useNotify();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotePrice, setQuotePrice] = useState(0);
  const [quoteMessage, setQuoteMessage] = useState("");
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Status dropdown state
  const [selectedStatus, setSelectedStatus] = useState("pending");

  useEffect(() => {
    if (!id) return;
    const getOrder = async () => {
      try {
        const res = await api.get(`/admin/orders/${id}`);
        setOrder(res.data);
        setFullName(res.data.fullName);
        setAddressLine1(res.data.addressLine1);
        setAddressLine2(res.data.addressLine2 || "");
        setCity(res.data.city);
        setPostalCode(res.data.postalCode);
        setPhoneNumber(res.data.phoneNumber);
        const prices: { [key: string]: number } = {};
        res.data.items.forEach((item: any) => {
          if (item.id) prices[item.id] = item.price || 0;
        });
        setItemPrices(prices);
        setDeliveryPrice(res.data.deliveryPrice || 0);
        setSelectedStatus(res.data.status || "pending");
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
    const res = await api.get(`/admin/orders/${id}`);
    setOrder(res.data);
  };

  const sendQuote = async () => {
    if (!id) return;
    try {
      await api.put(`/admin/orders/${id}/quote`, {
        price: quotePrice,
        message: quoteMessage,
      });
      await refresh();
      notifySuccess("Quote sent to customer.");
    } catch (err) {
      console.error(err);
      notifyError("Could not send quote.");
    }
  };

  const confirmOrder = async () => {
    if (!id) return;
    try {
      await api.put(`/admin/orders/${id}/confirm`, {});
      await refresh();
      notifySuccess("Order confirmed for printing.");
    } catch (err) {
      console.error(err);
      notifyError("Could not confirm order.");
    }
  };

  const markSent = async () => {
    if (!id) return;
    try {
      await api.put(`/admin/orders/${id}/sent`, {});
      await refresh();
      notifySuccess("Order marked as sent.");
    } catch (err) {
      console.error(err);
      notifyError("Could not mark as sent.");
    }
  };

  const markDelivered = async () => {
    if (!id) return;
    try {
      await api.put(`/admin/orders/${id}/delivered`, {});
      await refresh();
      notifySuccess("Order marked as delivered.");
    } catch (err) {
      console.error(err);
      notifyError("Could not mark as delivered.");
    }
  };

  const markPaid = async () => {
    if (!id) return;
    try {
      await api.put(`/admin/orders/${id}/paid`, {});
      await refresh();
      notifySuccess("Order marked as paid.");
    } catch (err) {
      console.error(err);
      notifyError("Could not mark as paid.");
    }
  };

  const updateItemPrice = async (itemId: string, price: number) => {
    if (!id) return;
    try {
      await api.put(`/admin/orders/${id}/items/${itemId}`, { price });
      await refresh();
    } catch (err) {
      console.error(err);
      notifyError("Could not update item price.");
    }
  };

  const updateDeliveryPrice = async (price: number) => {
    if (!id) return;
    try {
      await api.patch(`/admin/orders/${id}/delivery-price`, {
        deliveryPrice: price,
      });
      await refresh();
    } catch (err) {
      console.error(err);
      notifyError("Could not update delivery price.");
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

  const statusStyle = (status: string) => {
    let base = "px-2 py-1 rounded-lg text-xs font-semibold";
    switch (status) {
      case "pending_quote":
        return `${base} bg-amber-100 text-amber-700`;
      case "quoted":
        return `${base} bg-blue-100 text-blue-700`;
      case "printing":
        return `${base} bg-indigo-100 text-indigo-700`;
      case "completed":
        return `${base} bg-emerald-100 text-emerald-700`;
      case "paid":
        return `${base} bg-teal-100 text-teal-700`;
      case "cancelled":
        return `${base} bg-rose-100 text-rose-700`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center">
        <p>Order not found</p>
        <Link to="/admin/orders" className="text-emerald-600 underline mt-2">
          Back to orders
        </Link>
      </div>
    );
  }

  const totalPrice =
    (order.items.reduce((sum, item) => {
      const key = item.id ?? "";
      return (
        sum +
        (key && itemPrices[key] !== undefined
          ? itemPrices[key]
          : item.price || 0) *
          (item.count ?? 1)
      );
    }, 0) || 0) + deliveryPrice;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Order {order.id.slice(0, 8)}</h1>
          <button
            onClick={() => navigate("/admin/orders")}
            className="text-sm text-emerald-700 hover:underline"
          >
            Back to orders
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <article className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold">Customer info</h2>
              <button
                onClick={() => setEditingCustomer(!editingCustomer)}
                className="text-sm text-emerald-600 hover:underline"
              >
                {editingCustomer ? "Cancel" : "Edit"}
              </button>
            </div>
            {editingCustomer ? (
              <div className="space-y-2">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full border rounded px-2 py-1"
                />
                <input
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Address Line 1"
                  className="w-full border rounded px-2 py-1"
                />
                <input
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Address Line 2"
                  className="w-full border rounded px-2 py-1"
                />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full border rounded px-2 py-1"
                />
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Postal Code"
                  className="w-full border rounded px-2 py-1"
                />
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full border rounded px-2 py-1"
                />
                <button
                  onClick={saveCustomerInfo}
                  className="px-3 py-1 bg-emerald-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <p>{order.fullName}</p>
                <p>
                  {order.addressLine1}
                  {order.addressLine2 ? `, ${order.addressLine2}` : ""}
                </p>
                <p>
                  {order.city}, {order.postalCode}
                </p>
                <p>{order.phoneNumber}</p>
                <p className={statusStyle(order.status)}>
                  {order.status.replace("_", " ")}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Created: {new Date(order.createdAt).toLocaleString()}
                </p>
              </>
            )}
          </article>

          <article className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
            <h2 className="font-bold mb-2">Model files & specs</h2>
            {order.items.length === 0 ? (
              <p className="text-gray-500">No items in this order.</p>
            ) : (
              <ul className="space-y-3">
                {order.items.map((item) => (
                  <li
                    key={item.id || item.fileName}
                    className="border rounded-lg p-2"
                  >
                    <p className="font-semibold">
                      {item.fileName ?? item.fileUrl}
                    </p>
                    <p className="text-xs text-gray-600">
                      Material: {item.material}, Color: {item.color}, Qty:{" "}
                      {item.count}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800">Price: €</span>
                      <input
                        type="number"
                        value={item.id ? itemPrices[item.id] || 0 : 0}
                        onChange={(e) => {
                          if (!item.id) return;
                          const newPrice = parseFloat(e.target.value);
                          setItemPrices({
                            ...itemPrices,
                            [item.id]: newPrice,
                          });
                          updateItemPrice(item.id, newPrice);
                        }}
                        className="border rounded px-1 py-0.5 w-20"
                      />
                    </div>
                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Download/Preview file
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex items-center justify-end gap-2">
              <span className="text-gray-800">Delivery: €</span>
              <input
                type="number"
                value={deliveryPrice}
                onChange={(e) => {
                  const newPrice = parseFloat(e.target.value);
                  setDeliveryPrice(newPrice);
                  updateDeliveryPrice(newPrice);
                }}
                className="border rounded px-1 py-0.5 w-20"
              />
            </div>
            <div className="mt-1 text-right">
              <span className="font-bold">
                Total (including delivery): €{totalPrice.toFixed(2)}
              </span>
            </div>
          </article>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <article className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold mb-2">Quote Workflows</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-xs uppercase text-gray-400">
                  Quoted Price
                </label>
                <input
                  value={quotePrice}
                  type="number"
                  onChange={(e) => setQuotePrice(parseFloat(e.target.value))}
                  className="w-full border rounded-lg px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400">
                  Quote Message
                </label>
                <textarea
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  className="w-full border rounded-lg px-2 py-1"
                  rows={3}
                />
              </div>
              <button
                onClick={sendQuote}
                className="px-3 py-2 text-white rounded-lg bg-blue-600"
              >
                Send Quote
              </button>
            </div>
          </article>

          <article className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold mb-2">Order Actions</h3>
            <div className="grid gap-2">
              {/* Status update dropdown */}
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border rounded px-2 py-1"
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
                  className="px-3 py-2 rounded-lg bg-blue-500 text-white"
                  onClick={updateOrderStatus}
                >
                  Update Status
                </button>
              </div>
              <button
                onClick={confirmOrder}
                className="px-3 py-2 rounded-lg bg-indigo-600 text-white"
              >
                Confirm and Start Printing
              </button>
              <button
                onClick={markSent}
                className="px-3 py-2 rounded-lg bg-purple-600 text-white"
              >
                Mark as Sent
              </button>
              <button
                onClick={markDelivered}
                className="px-3 py-2 rounded-lg bg-green-600 text-white"
              >
                Mark as Delivered
              </button>
              <button
                onClick={markPaid}
                className="px-3 py-2 rounded-lg bg-teal-600 text-white"
              >
                Mark as Paid
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 rounded-lg bg-red-600 text-white"
              >
                Delete Order
              </button>
              {/* Custom Delete Confirmation Modal */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                    <p className="mb-4 font-semibold">
                      Are you sure you want to delete this order? This will also
                      delete all associated files.
                    </p>
                    <div className="flex gap-4 justify-end">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 rounded"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-white rounded"
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
        </div>

        <article className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-5">
          <h3 className="font-bold mb-2">Notes</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500">
                Internal Notes
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">
                Customer Notes
              </label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-2 py-1"
              />
            </div>
            <button
              onClick={saveNotes}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white"
            >
              Save Notes
            </button>
          </div>
        </article>

        <article className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-2">Admin & Customer Messaging</h3>
          <p className="text-sm text-gray-600">
            Quote: {order.quoteMessage || "None"}
          </p>
          <p className="text-sm text-gray-600">
            Internal Notes: {order.internalNotes || "None"}
          </p>
          <p className="text-sm text-gray-600">
            Customer Notes: {order.customerNotes || "None"}
          </p>
        </article>
      </main>
    </div>
  );
}
