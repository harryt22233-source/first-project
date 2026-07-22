"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CameraIcon, ImageIcon } from "@/components/icons";
import { processTimesheet } from "./timesheetActions";

type Phase = "idle" | "uploading" | "processing";

export default function TimesheetUploader() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setPhase("uploading");
    setError("");

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("timesheets")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: inserted, error: insertError } = await supabase
        .from("timesheets")
        .insert({ photo_path: path, status: "pending" })
        .select()
        .single();
      if (insertError) throw insertError;

      router.refresh();

      setPhase("processing");
      await processTimesheet(inserted.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPhase("idle");
    }
  }

  const busy = phase !== "idle";

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFile}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-6 text-white disabled:opacity-50"
        >
          <CameraIcon className="h-8 w-8" />
          <span className="text-sm font-semibold">Take Photo</span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => libraryInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-200 py-6 text-zinc-700 disabled:opacity-50"
        >
          <ImageIcon className="h-8 w-8" />
          <span className="text-sm font-semibold">Choose Photo</span>
        </button>
      </div>

      {phase === "uploading" && <p className="text-center text-sm text-zinc-500">Uploading…</p>}
      {phase === "processing" && (
        <p className="text-center text-sm text-zinc-500">Reading timesheet…</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
