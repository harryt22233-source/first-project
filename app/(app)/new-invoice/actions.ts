"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LineItem } from "@/lib/types";

export type NewInvoiceState = { error: string };

export async function createInvoice(_prevState: NewInvoiceState, formData: FormData): Promise<NewInvoiceState> {
  const supabase = await createClient();

  const client_id = formData.get("client_id") as string;
  const lineItemsRaw = formData.get("line_items") as string;

  if (!client_id) {
    return { error: "Select a client." };
  }

  let lineItems: LineItem[];
  try {
    lineItems = JSON.parse(lineItemsRaw);
  } catch {
    return { error: "Invalid line items." };
  }

  lineItems = lineItems.filter((li) => li.description.trim() || li.qty || li.rate);
  if (lineItems.length === 0) {
    return { error: "Add at least one line item." };
  }

  const total = lineItems.reduce((sum, li) => sum + Number(li.qty) * Number(li.rate), 0);

  const { data: n, error: rpcError } = await supabase.rpc("claim_next_invoice_number");
  if (rpcError) {
    return { error: rpcError.message };
  }
  const invoice_number = `INV-${String(n).padStart(4, "0")}`;

  const { error } = await supabase.from("invoices").insert({
    client_id,
    invoice_number,
    line_items: lineItems,
    total,
    status: "draft",
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
