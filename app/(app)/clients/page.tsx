import PageHeader from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";
import AddClientForm from "./AddClientForm";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").order("name");
  const clients = (data ?? []) as Client[];

  return (
    <>
      <PageHeader title="Clients" />
      <AddClientForm />

      {clients.length === 0 ? (
        <div className="px-4 py-16 text-center text-sm text-zinc-500">No clients yet.</div>
      ) : (
        <ul className="divide-y divide-zinc-100 px-4">
          {clients.map((c) => (
            <li key={c.id} className="py-3">
              <p className="text-sm font-medium text-zinc-900">{c.name}</p>
              {c.property_address && <p className="text-xs text-zinc-500">{c.property_address}</p>}
              {(c.email || c.phone) && (
                <p className="text-xs text-zinc-500">{[c.email, c.phone].filter(Boolean).join(" · ")}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
