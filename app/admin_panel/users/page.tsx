"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { apiFetch, ApiCollection, User, validationSummary } from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const response = await apiFetch<ApiCollection<User>>("/admin/users");
      setUsers(response.data);
    } catch (error) {
      setErrors(validationSummary(error));
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser() {
    if (!deleteTarget) return;
    setDeleting(true);
    setErrors([]);
    setNotice("");

    try {
      await apiFetch(`/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      setNotice("Administrator deleted.");
      await loadUsers();
    } catch (error) {
      setErrors(validationSummary(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
              Users
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Administrators
            </h1>
          </div>
          <Link
            href="/admin_panel/users/new"
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            New admin
          </Link>
        </div>

        {(errors.length > 0 || notice) && (
          <div
            className={`mt-6 rounded-md border px-4 py-3 text-sm ${
              errors.length
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {errors.length ? errors.map((error) => <p key={error}>{error}</p>) : notice}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold">Admin list</h2>
          </div>
          {loading ? (
            <p className="p-5 text-sm text-slate-500">Loading administrators</p>
          ) : users.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No administrators yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-4 font-medium">{user.name}</td>
                      <td className="px-5 py-4 text-slate-600">{user.email}</td>
                      <td className="px-5 py-4 text-slate-600">{user.role}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin_panel/users/${user.id}/edit`}
                            className="rounded-md border border-slate-300 px-3 py-2 font-medium hover:bg-slate-50"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="rounded-md border border-rose-200 px-3 py-2 font-medium text-rose-700 hover:bg-rose-50"
                            onClick={() => setDeleteTarget(user)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete administrator"
          message={`Delete ${deleteTarget.name}? The API will prevent deleting the last administrator.`}
          confirming={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={deleteUser}
        />
      )}
    </AdminShell>
  );
}
