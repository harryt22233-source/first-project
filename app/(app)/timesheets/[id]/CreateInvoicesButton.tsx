"use client";

import { useState } from "react";
import { createInvoicesFromApproved } from "./actions";

export default function CreateInvoicesButton({ timesheetId }: { timesheetId: string }) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await createInvoicesFromApproved(timesheetId);
        setPending(false);
      }}
      className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
    >
      {pending ? "Creating Invoice…" : "Create Invoice from Approved"}
    </button>
  );
}
