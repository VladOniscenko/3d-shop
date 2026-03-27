import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import AdminBreadcrumb from "./AdminBreadcrumb";
import api from "../services/api";
import type { Filament } from "../types";
import { useNotify } from "../context/NotifyContext";
import axios from "axios";

export default function AdminFilaments() {
  const { notifyError, notifySuccess } = useNotify();
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [priceEdits, setPriceEdits] = useState<Record<string, number>>({});
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});

  const [name, setName] = useState("");
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [pricePerGram, setPricePerGram] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [description, setDescription] = useState("");

  const fetchFilaments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/filaments");
      const nextFilaments = Array.isArray(res.data) ? res.data : [];
      setFilaments(nextFilaments);

      const nextPriceEdits: Record<string, number> = {};
      const nextStockEdits: Record<string, number> = {};
      nextFilaments.forEach((f: Filament) => {
        nextPriceEdits[f.id] = f.pricePerGram;
        nextStockEdits[f.id] = f.stockQuantity ?? 0;
      });
      setPriceEdits(nextPriceEdits);
      setStockEdits(nextStockEdits);
    } catch (err) {
      console.error(err);
      notifyError("Could not load filaments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilaments();
  }, []);

  const addFilament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/filaments", {
        name,
        material,
        color,
        pricePerGram,
        stockQuantity,
        description,
      });

      setName("");
      setMaterial("");
      setColor("");
      setPricePerGram(0);
      setStockQuantity(0);
      setDescription("");
      fetchFilaments();
      notifySuccess("Filament added.");
    } catch (err) {
      console.error(err);
      notifyError("Could not create filament. Ensure you are admin.");
    }
  };

  const updateFilament = async (id: string) => {
    const nextPrice = priceEdits[id] ?? 0;
    const nextStock = stockEdits[id] ?? 0;

    if (nextPrice < 0 || nextStock < 0) {
      notifyError("Price and stock cannot be negative.");
      return;
    }

    const previous = filaments.find((f) => f.id === id);
    if (!previous) {
      notifyError("Filament not found.");
      return;
    }

    // Optimistic row update for snappy admin UX.
    setFilaments((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, pricePerGram: nextPrice, stockQuantity: nextStock }
          : f,
      ),
    );

    setSavingId(id);
    try {
      await api.put(`/filaments/${id}`, {
        pricePerGram: nextPrice,
        stockQuantity: nextStock,
      });
      notifySuccess("Filament updated.");
    } catch (err) {
      console.error(err);
      // Rollback on failure.
      setFilaments((prev) => prev.map((f) => (f.id === id ? previous : f)));
      setPriceEdits((prev) => ({ ...prev, [id]: previous.pricePerGram }));
      setStockEdits((prev) => ({ ...prev, [id]: previous.stockQuantity ?? 0 }));

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          notifyError("You must be logged in as admin to update filaments.");
        } else if (err.response?.status === 404) {
          notifyError("Filament not found on server.");
        } else {
          notifyError("Could not update filament.");
        }
      } else {
        notifyError("Could not update filament.");
      }
    } finally {
      setSavingId(null);
    }
  };

  const deleteFilament = async (id: string) => {
    if (!confirm("Delete this filament?")) return;

    const previous = filaments;

    // Optimistic removal.
    setFilaments((prev) => prev.filter((f) => f.id !== id));
    setPriceEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setStockEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    setDeletingId(id);
    try {
      await api.delete(`/filaments/${id}`);
      notifySuccess("Filament deleted.");
    } catch (err) {
      console.error(err);
      // Rollback on failure.
      setFilaments(previous);
      const nextPriceEdits: Record<string, number> = {};
      const nextStockEdits: Record<string, number> = {};
      previous.forEach((f) => {
        nextPriceEdits[f.id] = f.pricePerGram;
        nextStockEdits[f.id] = f.stockQuantity ?? 0;
      });
      setPriceEdits(nextPriceEdits);
      setStockEdits(nextStockEdits);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          notifyError("You must be logged in as admin to delete filaments.");
        } else if (err.response?.status === 404) {
          notifyError("Filament not found on server.");
        } else {
          notifyError("Could not delete filament.");
        }
      } else {
        notifyError("Could not delete filament.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <AdminBreadcrumb
          title="Filament Management"
          items={[
            { label: "Admin", to: "/admin" },
            { label: "Filaments" },
          ]}
        />

        <form
          onSubmit={addFilament}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
        >
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-semibold">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Name"
              className="border rounded-xl p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-semibold">Material</span>
            <input
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              required
              placeholder="Material"
              className="border rounded-xl p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-semibold">Color</span>
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
              placeholder="Color"
              className="border rounded-xl p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-semibold">Price Per Gram</span>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={pricePerGram}
              onChange={(e) => setPricePerGram(parseFloat(e.target.value) || 0)}
              required
              placeholder="Price Per Gram"
              className="border rounded-xl p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-semibold">Stock Quantity</span>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
              required
              placeholder="Stock Quantity"
              className="border rounded-xl p-2"
            />
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl"
          >
            Add Filament
          </button>

          <label className="flex flex-col gap-1 text-sm text-gray-700 col-span-full">
            <span className="font-semibold">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="border rounded-xl p-2"
              rows={3}
            />
          </label>
        </form>

        {loading ? (
          <p>Loading filaments...</p>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Color</th>
                  <th className="px-4 py-3">Price/gram</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filaments.map((f) => (
                  <tr
                    key={f.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{f.name}</td>
                    <td className="px-4 py-3">{f.material}</td>
                    <td className="px-4 py-3">{f.color}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        className="border rounded-lg p-1.5 w-28"
                        value={priceEdits[f.id] ?? 0}
                        onChange={(e) =>
                          setPriceEdits((prev) => ({
                            ...prev,
                            [f.id]: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        className="border rounded-lg p-1.5 w-24"
                        value={stockEdits[f.id] ?? 0}
                        onChange={(e) =>
                          setStockEdits((prev) => ({
                            ...prev,
                            [f.id]: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateFilament(f.id)}
                          disabled={savingId === f.id || deletingId === f.id}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg disabled:opacity-50"
                        >
                          {savingId === f.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => deleteFilament(f.id)}
                          disabled={savingId === f.id || deletingId === f.id}
                          className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg disabled:opacity-50"
                        >
                          {deletingId === f.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
