import PageHeader from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";
import NewInvoiceForm from "./NewInvoiceForm";
import TimesheetUploader from "./TimesheetUploader";
import TimesheetsGrid from "./TimesheetsGrid";

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const [{ data: clients }, { data: settings }] = await Promise.all([
    supabase.from("clients").select("*").order("name"),
    supabase.from("settings").select("hourly_rate").eq("id", 1).single(),
  ]);

  return (
    <>
      <PageHeader title="New Invoice" />

      <h2 className="px-4 pt-4 text-sm font-semibold text-zinc-900">Timesheets</h2>
      <TimesheetUploader />
      <TimesheetsGrid />

      <div className="border-t border-zinc-100" />

      <h2 className="px-4 pt-4 text-sm font-semibold text-zinc-900">Create Invoice</h2>
      <NewInvoiceForm clients={(clients ?? []) as Client[]} defaultRate={settings?.hourly_rate ?? 60} />
    </>
  );
}
