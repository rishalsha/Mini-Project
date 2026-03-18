import React, { useEffect, useState } from "react";
import {
  deleteCandidateById,
  deleteEmployerById,
  getAdminMonitorHealth,
  getAdminMonitorSummary,
  getAdminUsers,
} from "../services/api";
import { Activity, RefreshCw, Trash2, Users } from "lucide-react";

interface ManagedUser {
  id: string | number;
  name: string;
  email: string;
  accountType: "candidate" | "employer";
  companyName?: string;
  registeredAt?: string;
  createdAt?: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [summaryData, healthData, usersData] = await Promise.all([
        getAdminMonitorSummary(),
        getAdminMonitorHealth(),
        getAdminUsers(),
      ]);
      setSummary(summaryData);
      setHealth(healthData);
      setUsers(usersData || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (user: ManagedUser) => {
    const confirmed = window.confirm(
      `Delete ${user.accountType} account for ${user.name} (${user.email})?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(String(user.id));
      if (user.accountType === "candidate") {
        await deleteCandidateById(String(user.id));
      } else {
        await deleteEmployerById(String(user.id));
      }
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading administrator dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Administrator Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Manage candidate/employer accounts and monitor system status.
            </p>
            {error && <p className="text-red-600 text-sm mt-2">⚠️ {error}</p>}
          </div>
          <button
            onClick={loadData}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Status</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {health?.status || "N/A"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Candidates</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {summary?.candidates ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Employers</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {summary?.employers ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Uptime (sec)</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {summary?.uptimeSeconds ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            <h2 className="font-bold text-slate-900">Managed Users</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Type</th>
                  <th className="text-left px-6 py-3 font-semibold">Name</th>
                  <th className="text-left px-6 py-3 font-semibold">Email</th>
                  <th className="text-left px-6 py-3 font-semibold">Company</th>
                  <th className="text-left px-6 py-3 font-semibold">Created</th>
                  <th className="text-right px-6 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={`${user.accountType}-${user.id}`} className="border-t border-slate-100">
                    <td className="px-6 py-3 capitalize">{user.accountType}</td>
                    <td className="px-6 py-3 font-medium text-slate-900">{user.name}</td>
                    <td className="px-6 py-3 text-slate-700">{user.email}</td>
                    <td className="px-6 py-3 text-slate-700">{user.companyName || "-"}</td>
                    <td className="px-6 py-3 text-slate-600">
                      {user.createdAt || user.registeredAt || "-"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === String(user.id)}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 font-semibold inline-flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        {deletingId === String(user.id) ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 text-slate-700">
          <Activity size={18} className="text-indigo-600" />
          <span>
            Service: {health?.service || "Administrator API"} | Database reachable: {String(health?.databaseReachable ?? false)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
