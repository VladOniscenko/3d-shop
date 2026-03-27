import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import api from "../services/api";
import type { User } from "../types";
import { useNotify } from "../context/NotifyContext";

export default function AdminUsers() {
  const { notifyError, notifySuccess } = useNotify();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"customer" | "admin">("customer");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        page: String(page),
        pageSize: String(pageSize),
      });
      const res = await api.get(`/admin/users?${query.toString()}`);
      setUsers(res.data.results);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page, pageSize]);

  const startEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditName("");
    setEditEmail("");
    setEditRole("customer");
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        name: editName,
        email: editEmail,
        role: editRole,
      });
      fetchUsers();
      cancelEdit();
      notifySuccess("User updated.");
    } catch (err) {
      console.error(err);
      notifyError("Could not update user.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-sm text-gray-600">Total: {totalCount}</p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <input
            className="border rounded-xl p-2 w-full sm:w-auto"
            placeholder="Search users by name/email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => setPage(1)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl"
          >
            Refresh
          </button>
        </div>

        {editingUser && (
          <div className="mb-4 p-4 bg-white border rounded-2xl shadow-sm">
            <h3 className="font-bold mb-2">Edit User</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name"
                className="border rounded-xl p-2"
              />
              <input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Email"
                className="border rounded-xl p-2"
              />
              <select
                value={editRole}
                onChange={(e) =>
                  setEditRole(e.target.value as "customer" | "admin")
                }
                className="border rounded-xl p-2"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={saveEdit}
                className="px-3 py-1 bg-emerald-600 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="px-3 py-1 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => startEdit(user)}
                      className="text-sm text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <p className="p-4 text-center text-sm text-gray-500">
              No users found.
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded-lg"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 border rounded-lg"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
