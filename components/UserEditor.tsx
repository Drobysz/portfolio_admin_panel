"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import {
  apiFetch,
  ApiResource,
  User,
  validationSummary,
} from "@/lib/api";

type UserForm = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
};

export function UserEditor({
  userId,
  title,
}: {
  userId?: string;
  title: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [loading, setLoading] = useState(Boolean(userId));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const editing = Boolean(userId);

  useEffect(() => {
    if (!userId) return;

    apiFetch<ApiResource<User>>(`/admin/users/${userId}`)
      .then((response) => {
        setForm({
          name: response.data.name,
          email: response.data.email,
          password: "",
          password_confirmation: "",
        });
      })
      .catch((error) => setErrors(validationSummary(error)))
      .finally(() => setLoading(false));
  }, [userId]);

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors([]);

    const payload: Record<string, string> = {
      name: form.name,
      email: form.email,
      role: "admin",
    };

    if (!editing || form.password) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
    }

    try {
      await apiFetch<ApiResource<User>>(
        editing ? `/admin/users/${userId}` : "/admin/users",
        {
          method: editing ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );
      router.push("/admin_panel/users");
    } catch (error) {
      setErrors(validationSummary(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push("/admin_panel/users")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Back to users
        </button>
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
            Users
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        </div>

        {errors.length > 0 && (
          <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        {loading ? (
          <p className="mt-8 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">
            Loading administrator
          </p>
        ) : (
          <form
            onSubmit={saveUser}
            className="mt-8 rounded-lg border border-slate-200 bg-white p-6"
          >
            <label className="block text-sm font-medium">
              Name
              <input
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </label>
            <label className="mt-5 block text-sm font-medium">
              Email
              <input
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>
            <label className="mt-5 block text-sm font-medium">
              Password {editing ? "(optional)" : ""}
              <input
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                required={!editing}
              />
            </label>
            <label className="mt-5 block text-sm font-medium">
              Confirm password
              <input
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                type="password"
                value={form.password_confirmation}
                onChange={(event) =>
                  setForm({ ...form, password_confirmation: event.target.value })
                }
                required={!editing || Boolean(form.password)}
              />
            </label>
            <div className="mt-8 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {saving ? "Saving" : editing ? "Update admin" : "Create admin"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin_panel/users")}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminShell>
  );
}
