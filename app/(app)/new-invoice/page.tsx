import PageHeader from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";
import NewInvoiceForm from "./NewInvoiceForm";

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const [{ data: clients }, { data: settings }] = await Promise.all([
    supabase.from("clients").select("*").order("name"),
    supabase.from("settings").select("hourly_rate").eq("id", 1).single(),
  ]);

  return (
    <>
      <PageHeader title="New Invoice" />
      <NewInvoiceForm clients={(clients ?? []) as Client[]} defaultRate={settings?.hourly_rate ?? 60} />
    </>
  );
}
