"use client";

import { useActionState, useEffect, useRef } from "react";
import { addClient, type AddClientState } from "./actions";

const initialState: AddClientState = { error: "" };

export default function AddClientForm() {
  const [state, formAction, pending] = useActionState(addClient, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !pending && !state.error) {
      formRef.current?.reset();
      submittedRef.current = false;
    }
  }, [state, pending]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={() => {
        submittedRef.current = true;
      }}
      className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-4"
    >
      <input
        name="name"
        placeholder="Client name"
        required
        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
      />
      <input
        name="property_address"
        placeholder="Property address"
        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
      />
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-1/2 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone"
          className="w-1/2 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add Client"}
      </button>
    </form>
  );
}
