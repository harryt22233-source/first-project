"use client";

import { useState } from "react";
import type { Client, Job } from "@/lib/types";
import { approveJob, discardJob, updateJob, resolveClientForJob, addClientAndResolve } from "./actions";

function fieldClass(confidence: Record<string, "high" | "low"> | undefined, key: string) {
  const base = "rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-emerald-500";
  if (confidence?.[key] === "low") {
    return `${base} border-amber-400 bg-amber-50`;
  }
  return `${base} border-zinc-200`;
}

export default function JobCard({
  job,
  clients,
  timesheetId,
}: {
  job: Job;
  clients: Client[];
  timesheetId: string;
}) {
  const [date, setDate] = useState(job.date);
  const [description, setDescription] = useState(job.description ?? "");
  const [hours, setHours] = useState(job.hours ?? 0);
  const [crewSize, setCrewSize] = useState(job.crew_size ?? 0);
  const [amount, setAmount] = useState(job.suggested_amount ?? 0);

  const [addingClient, setAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState(job.client_name_raw ?? "");
  const [clientError, setClientError] = useState("");
  const [busy, setBusy] = useState(false);

  const confidence = job.field_confidence;
  const client = clients.find((c) => c.id === job.client_id);

  async function handleSelectClient(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (value === "__add__") {
      setAddingClient(true);
      return;
    }
    if (!value) return;
    await resolveClientForJob(job.id, timesheetId, value, job.client_name_raw ?? "");
  }

  async function handleAddClient() {
    if (!newClientName.trim()) return;
    setBusy(true);
    setClientError("");
    const result = await addClientAndResolve(job.id, timesheetId, newClientName, job.client_name_raw ?? "");
    setBusy(false);
    if (result?.error) {
      setClientError(result.error);
      return;
    }
    setAddingClient(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onBlur={() => updateJob(job.id, timesheetId, { date })}
          className={fieldClass(confidence, "date")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Client</label>
        {client ? (
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${
              confidence?.client_name === "low" ? "border-amber-400 bg-amber-50" : "border-zinc-200"
            }`}
          >
            {client.name}
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-lg border border-amber-400 bg-amber-50 p-3">
            <p className="text-xs text-amber-800">
              No client match for &ldquo;{job.client_name_raw || "unknown"}&rdquo;. Pick one or add a new
              client.
            </p>
            {!addingClient ? (
              <select
                defaultValue=""
                onChange={handleSelectClient}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Select a client…
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="__add__">+ Add new client</option>
              </select>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="New client name"
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
                {clientError && <p className="text-xs text-red-600">{clientError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleAddClient}
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-medium text-white disabled:opacity-50"
                  >
                    Add &amp; Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingClient(false)}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => updateJob(job.id, timesheetId, { description })}
          className={fieldClass(confidence, "description")}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Hours</label>
          <input
            type="number"
            step="0.25"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            onBlur={() => updateJob(job.id, timesheetId, { hours })}
            className={fieldClass(confidence, "hours")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Crew</label>
          <input
            type="number"
            step="1"
            value={crewSize}
            onChange={(e) => setCrewSize(Number(e.target.value))}
            onBlur={() => updateJob(job.id, timesheetId, { crew_size: crewSize })}
            className={fieldClass(confidence, "crew_size")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            onBlur={() => updateJob(job.id, timesheetId, { suggested_amount: amount })}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={!job.client_id}
          title={!job.client_id ? "Resolve the client before approving" : undefined}
          onClick={() => approveJob(job.id, timesheetId)}
          className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("Discard this entry?")) discardJob(job.id, timesheetId);
          }}
          className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-red-600"
        >
          Discard
        </button>
      </div>
    </div>
  );
}
