"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiResource, setToken, User, validationSummary } from "@/lib/api";

type LoginResponse = ApiResource<{
  token: string;
  user: User;
}>;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors([]);

    try {
      const response = await apiFetch<LoginResponse>("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(response.data.token);
      router.replace("/admin_panel/projects");
    } catch (error) {
      setErrors(validationSummary(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-8 shadow-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
          portfolio-drobysz
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          Admin sign in
        </h1>

        {errors.length > 0 && (
          <div className="mt-6 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        <label className="mt-8 block text-sm font-medium text-slate-200">
          Email
          <input
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="mt-5 block text-sm font-medium text-slate-200">
          Password
          <input
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full rounded-md bg-sky-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-sky-300 disabled:opacity-60"
        >
          {submitting ? "Signing in" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
