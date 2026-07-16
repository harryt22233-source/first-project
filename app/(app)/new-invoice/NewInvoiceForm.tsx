"use client";

import { useActionState, useState } from "react";
import type { Client, LineItem } from "@/lib/types";
import { createInvoice, type NewInvoiceState } from "./actions";

const initialState: NewInvoiceState = { error: "" };

export default function NewInvoiceForm({
  clients,
  defaultRate,
}: {
  clients: Client[];
  defaultRate: number;
}) {
  const [state, formAction, pending] = useActionState(createInvoice, initialState);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", qty: 1, rate: defaultRate },
  ]);

  const total = lineItems.reduce((sum, li) => sum + Number(li.qty || 0) * Number(li.rate || 0), 0);

  function updateItem(index: number, field: keyof LineItem, value: string) {
    setLineItems((items) =>
      items.map((item, i) =>
        i === index
          ? { ...item, [field]: field === "description" ? value : Number(value) }
          : item,
      ),
    );
  }

  function removeItem(index: number) {
    setLineItems((items) => items.filter((_, i) => i !== index));
  }

  if (clients.length === 0) {
    return <p className="px-4 py-16 text-center text-sm text-zinc-500">Add a client first before creating an invoice.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 px-4 py-4">
      <input type="hidden" name="line_items" value={JSON.stringify(lineItems)} />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Client</label>
        <select
          name="client_id"
          required
          className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-zinc-500">Line Items</label>
        {lineItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item.description}
              onChange={(e) => updateItem(i, "description", e.target.value)}
              placeholder="Description"
              className="flex-1 rounded-lg border border-zinc-200 px-2.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={item.qty}
              onChange={(e) => updateItem(i, "qty", e.target.value)}
              className="w-16 rounded-lg border border-zinc-200 px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={item.rate}
              onChange={(e) => updateItem(i, "rate", e.target.value)}
              className="w-20 rounded-lg border border-zinc-200 px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-zinc-400"
              aria-label="Remove line item"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLineItems((items) => [...items, { description: "", qty: 1, rate: defaultRate }])}
          className="self-start rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600"
        >
          Add Line Item
        </button>
      </div>

      <p className="text-right text-lg font-semibold text-zinc-900">Total: ${total.toFixed(2)}</p>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save Invoice"}
      </button>
    </form>
  );
}
