import { createClient } from "@/lib/supabase/server";
import type { Timesheet } from "@/lib/types";

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
      {withUrls.map((t) => (
        <div key={t.id} className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
          {t.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.url} alt="Timesheet photo" className="h-full w-full object-cover" />
          )}
          <span className="absolute bottom-1 left-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
            {t.status}
          </span>
        </div>
      ))}
    </div>
  );
}
