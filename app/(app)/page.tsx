import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import type { Invoice } from "@/lib/types";

type InvoiceRow = Invoice & { clients: { name: string } | null };

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("*, clients(name)")
    .order("created_at", { ascending: false });

  const invoices = (data ?? []) as unknown as InvoiceRow[];

  return (
    <>
      <PageHeader title="Invoices" />

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <p className="text-sm text-zinc-500">No invoices yet.</p>
          <Link
            href="/new-invoice"
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white"
          >
            Create your first invoice
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100 px-4">
          {invoices.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-zinc-900">{inv.invoice_number}</p>
                <p className="text-xs text-zinc-500">{inv.clients?.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-sm font-medium text-zinc-900">${Number(inv.total).toFixed(2)}</p>
                <StatusBadge status={inv.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
