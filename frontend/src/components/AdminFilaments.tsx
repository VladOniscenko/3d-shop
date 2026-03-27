import { useEffect, useState } from "react";
import AdminBreadcrumb from "./AdminBreadcrumb";
import AdminLayout from "./AdminLayout";
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
    <AdminLayout>
        <AdminBreadcrumb
          title="Filament Management"
          items={[{ label: "Admin", to: "/admin" }, { label: "Filaments" }]}
        />

        <form
          onSubmit={addFilament}
          className="admin-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 p-4"
        >
          <label className="admin-label">
            <span className="font-semibold">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Name"
              className="admin-field"
            />
          </label>
          <label className="admin-label">
            <span className="font-semibold">Material</span>
            <input
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              required
              placeholder="Material"
              className="admin-field"
            />
          </label>
          <label className="admin-label">
            <span className="font-semibold">Color</span>
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
              placeholder="Color"
              className="admin-field"
            />
          </label>
          <label className="admin-label">
            <span className="font-semibold">Price Per Gram</span>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={pricePerGram}
              onChange={(e) => setPricePerGram(parseFloat(e.target.value) || 0)}
              required
              placeholder="Price Per Gram"
              className="admin-field"
            />
          </label>
          <label className="admin-label">
            <span className="font-semibold">Stock Quantity</span>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
              required
              placeholder="Stock Quantity"
              className="admin-field"
            />
          </label>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
          >
            Add Filament
          </button>

          <label className="admin-label col-span-full">
            <span className="font-semibold">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="admin-textarea"
              rows={3}
            />
          </label>
        </form>

        {loading ? (
          <p className="admin-note">Loading filaments...</p>
        ) : (
          <div className="admin-panel admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Material</th>
                  <th>Color</th>
                  <th>Price/gram</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filaments.map((f) => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td>{f.material}</td>
                    <td>{f.color}</td>
                    <td>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        className="admin-field w-28"
                        value={priceEdits[f.id] ?? 0}
                        onChange={(e) =>
                          setPriceEdits((prev) => ({
                            ...prev,
                            [f.id]: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="admin-field w-24"
                        value={stockEdits[f.id] ?? 0}
                        onChange={(e) =>
                          setStockEdits((prev) => ({
                            ...prev,
                            [f.id]: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateFilament(f.id)}
                          disabled={savingId === f.id || deletingId === f.id}
                          className="admin-btn admin-btn-primary"
                        >
                          {savingId === f.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => deleteFilament(f.id)}
                          disabled={savingId === f.id || deletingId === f.id}
                          className="admin-btn admin-btn-danger"
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
    </AdminLayout>
  );
}
