import { createClient } from "@/lib/supabase/server";
import type { Timesheet } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-zinc-100 text-zinc-600",
  processing: "bg-indigo-100 text-indigo-700",
  processed: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-700",
};

export default async function TimesheetsGrid() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("timesheets")
    .select("*")
    .order("created_at", { ascending: false });

  const timesheets = (data ?? []) as Timesheet[];

  if (timesheets.length === 0) {
    return <p className="px-4 pb-4 text-sm text-zinc-500">No timesheets uploaded yet.</p>;
  }

  const { data: jobRows } = await supabase
    .from("jobs")
    .select("timesheet_id")
    .in(
      "timesheet_id",
      timesheets.map((t) => t.id),
    );

  const jobCounts = new Map<string, number>();
  for (const row of jobRows ?? []) {
    if (!row.timesheet_id) continue;
    jobCounts.set(row.timesheet_id, (jobCounts.get(row.timesheet_id) ?? 0) + 1);
  }

  const withUrls = await Promise.all(
    timesheets.map(async (t) => {
      const { data: signed } = await supabase.storage
        .from("timesheets")
        .createSignedUrl(t.photo_path, 3600);
      return { ...t, url: signed?.signedUrl };
    }),
  );

  return (
    <div className="grid grid-cols-3 gap-2 px-4 pb-4">
      {withUrls.map((t) => {
        const count = jobCounts.get(t.id) ?? 0;
        const label = t.status === "processed" && count > 0 ? `${count} jobs` : t.status;
        return (
          <div
            key={t.id}
            className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100"
            title={t.status === "failed" ? t.error_message ?? undefined : undefined}
          >
            {t.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.url} alt="Timesheet photo" className="h-full w-full object-cover" />
            )}
            <span
              className={`absolute bottom-1 left-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[t.status] ?? STATUS_STYLES.pending}`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
