import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/server";
import type { Client, Job, Timesheet } from "@/lib/types";
import ZoomablePhoto from "./ZoomablePhoto";
import JobCard from "./JobCard";
import CreateInvoicesButton from "./CreateInvoicesButton";

export default async function TimesheetReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: timesheetRow }, { data: jobRows }, { data: clientRows }] = await Promise.all([
    supabase.from("timesheets").select("*").eq("id", id).single(),
    supabase.from("jobs").select("*").eq("timesheet_id", id).order("date", { ascending: true }),
    supabase.from("clients").select("*").order("name"),
  ]);

  const timesheet = timesheetRow as Timesheet | null;
  const jobs = (jobRows ?? []) as Job[];
  const clients = (clientRows ?? []) as Client[];

  if (!timesheet) {
    return (
      <>
        <PageHeader title="Timesheet" />
        <p className="px-4 py-16 text-center text-sm text-zinc-500">Timesheet not found.</p>
      </>
    );
  }

  const { data: signed } = await supabase.storage
    .from("timesheets")
    .createSignedUrl(timesheet.photo_path, 3600);

  const draftJobs = jobs.filter((j) => j.status === "draft");
  const approvedJobs = jobs.filter((j) => j.status === "approved");
  const invoicedJobs = jobs.filter((j) => j.status === "invoiced");

  return (
    <>
      <PageHeader title="Review Timesheet" />

      {signed?.signedUrl && <ZoomablePhoto url={signed.signedUrl} />}

      <div className="px-4 py-4">
        {timesheet.status === "pending" || timesheet.status === "processing" ? (
          <p className="text-center text-sm text-zinc-500">Still reading this timesheet…</p>
        ) : timesheet.status === "failed" ? (
          <p className="text-center text-sm text-red-600">
            {timesheet.error_message || "Something went wrong reading this timesheet."}
          </p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">No job entries were found on this sheet.</p>
        ) : null}

        {draftJobs.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-zinc-900">To Review ({draftJobs.length})</h2>
            {draftJobs.map((job) => (
              <JobCard key={job.id} job={job} clients={clients} timesheetId={id} />
            ))}
          </div>
        )}

        {approvedJobs.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-zinc-900">Approved ({approvedJobs.length})</h2>
            <ul className="flex flex-col gap-2">
              {approvedJobs.map((job) => {
                const client = clients.find((c) => c.id === job.client_id);
                return (
                  <li
                    key={job.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  >
                    <span>
                      {job.date} — {client?.name ?? "Unknown client"}
                    </span>
                    <span className="font-medium">${Number(job.suggested_amount ?? 0).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
            <CreateInvoicesButton timesheetId={id} />
          </div>
        )}

        {invoicedJobs.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">Invoiced ({invoicedJobs.length})</h2>
            <ul className="flex flex-col gap-2">
              {invoicedJobs.map((job) => {
                const client = clients.find((c) => c.id === job.client_id);
                return (
                  <li key={job.id} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
                    {job.date} — {client?.name ?? "Unknown client"} — $
                    {Number(job.suggested_amount ?? 0).toFixed(2)}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <Link href="/new-invoice" className="mt-6 block text-center text-sm text-zinc-500">
          ← Back to New Invoice
        </Link>
      </div>
    </>
  );
}
