"use client";

import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "./actions";

const initialState: AuthState = { error: "" };

export default function LoginForm() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(login, initialState);
  const [signupState, signupAction, signupPending] = useActionState(signup, initialState);

  return (
    <div className="rounded-xl border border-zinc-200 p-5">
      <div className="mb-4 flex gap-1 rounded-lg bg-zinc-100 p-1">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-md py-2 text-sm font-medium ${
            tab === "login" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`flex-1 rounded-md py-2 text-sm font-medium ${
            tab === "signup" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
          }`}
        >
          Sign Up
        </button>
      </div>

      {tab === "login" ? (
        <form action={loginAction} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="email"
            required
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            required
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
          {loginState.error && <p className="text-sm text-red-600">{loginState.error}</p>}
          <button
            type="submit"
            disabled={loginPending}
            className="rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loginPending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      ) : (
        <form action={signupAction} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="email"
            required
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 8 characters)"
            autoComplete="new-password"
            minLength={8}
            required
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
          {signupState.error && <p className="text-sm text-red-600">{signupState.error}</p>}
          <button
            type="submit"
            disabled={signupPending}
            className="rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {signupPending ? "Creating account…" : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}
