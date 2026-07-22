"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LineItem } from "@/lib/types";

export async function updateJob(
  jobId: string,
  timesheetId: string,
  fields: Partial<{
    date: string;
    description: string;
    hours: number;
    crew_size: number;
    suggested_amount: number;
  }>,
) {
  const supabase = await createClient();
  await supabase.from("jobs").update(fields).eq("id", jobId);
  revalidatePath(`/timesheets/${timesheetId}`);
}

export async function resolveClientForJob(
  jobId: string,
  timesheetId: string,
  clientId: string,
  rawName: string,
) {
  const supabase = await createClient();
  await supabase.from("jobs").update({ client_id: clientId }).eq("id", jobId);
  if (rawName.trim()) {
    await supabase
      .from("client_aliases")
      .upsert({ raw_name: rawName.trim(), client_id: clientId }, { onConflict: "raw_name" });
  }
  revalidatePath(`/timesheets/${timesheetId}`);
}

export async function addClientAndResolve(
  jobId: string,
  timesheetId: string,
  name: string,
  rawName: string,
) {
  const supabase = await createClient();
  const { data: client, error } = await supabase
    .from("clients")
    .insert({ name: name.trim() })
    .select()
    .single();
  if (error || !client) return { error: error?.message || "Could not create client." };

  await resolveClientForJob(jobId, timesheetId, client.id, rawName);
  return { error: "" };
}

export async function approveJob(jobId: string, timesheetId: string) {
  const supabase = await createClient();
  await supabase.from("jobs").update({ status: "approved" }).eq("id", jobId);
  revalidatePath(`/timesheets/${timesheetId}`);
}

export async function discardJob(jobId: string, timesheetId: string) {
  const supabase = await createClient();
  await supabase.from("jobs").delete().eq("id", jobId);
  revalidatePath(`/timesheets/${timesheetId}`);
}

export async function createInvoicesFromApproved(timesheetId: string) {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("timesheet_id", timesheetId)
    .eq("status", "approved");

  if (!jobs || jobs.length === 0) return;

  const byClient = new Map<string, typeof jobs>();
  for (const job of jobs) {
    if (!job.client_id) continue;
    const list = byClient.get(job.client_id) ?? [];
    list.push(job);
    byClient.set(job.client_id, list);
  }

  for (const [clientId, clientJobs] of byClient) {
    const lineItems: LineItem[] = clientJobs.map((j) => ({
      description: `${j.date} — ${j.description ?? ""}`.trim(),
      qty: 1,
      rate: Number(j.suggested_amount) || 0,
    }));
    const total = lineItems.reduce((sum, li) => sum + li.qty * li.rate, 0);

    const { data: n } = await supabase.rpc("claim_next_invoice_number");
    const invoice_number = `INV-${String(n).padStart(4, "0")}`;

    await supabase.from("invoices").insert({
      client_id: clientId,
      invoice_number,
      line_items: lineItems,
      total,
      status: "draft",
    });

    await supabase
      .from("jobs")
      .update({ status: "invoiced" })
      .in(
        "id",
        clientJobs.map((j) => j.id),
      );
  }

  revalidatePath(`/timesheets/${timesheetId}`);
  redirect("/");
}
