"use client";

import { useActionState } from "react";
import type { Settings } from "@/lib/types";
import { signOut } from "@/app/login/actions";
import { updateSettings, type SettingsState } from "./actions";

const initialState: SettingsState = { error: "", saved: false };

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState(updateSettings, initialState);

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <form action={formAction} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Business Name</label>
          <input
            name="business_name"
            defaultValue={settings.business_name}
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Business Address</label>
          <input
            name="business_address"
            defaultValue={settings.business_address}
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Business Phone</label>
          <input
            name="business_phone"
            type="tel"
            defaultValue={settings.business_phone}
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Default Hourly Rate ($)</label>
          <input
            name="hourly_rate"
            type="number"
            step="0.01"
            min="0"
            defaultValue={settings.hourly_rate}
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Next Invoice Number</label>
          <input
            name="next_invoice_number"
            type="number"
            step="1"
            min="1"
            defaultValue={settings.next_invoice_number}
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.saved && !state.error && <p className="text-sm text-emerald-600">Saved.</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </form>

      <form action={signOut}>
        <button
          type="submit"
          className="w-full rounded-lg border border-zinc-200 py-2.5 text-sm font-medium text-red-600"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
