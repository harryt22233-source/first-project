"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You read a single photo of a handwritten weekly timesheet from a Spanish-speaking landscaping crew. One sheet covers one worker's whole week; each entry on it is one job performed on one day.

For every job entry, extract:
- date: the date the work was done. Use ISO format YYYY-MM-DD if you can determine the year; otherwise give your best-guess date in that format anyway.
- client_name: the client or property name written beside or within the entry.
- description: the work performed, translated into clean, professional English.
- hours: hours worked on this job (number).
- crew_size: number of people on the crew for this job, usually labeled "personas" (number).
- materials: an array of { material, quantity } for any materials mentioned, with quantities as written.

Trade vocabulary and abbreviations this crew uses (translate accordingly):
- "moch" = mulch
- "pribet" = privet
- "vota" / "bota" = hauled away / removed
- "yarda de basura" = a yard (cubic yard) of debris
- "hace hech" = hedging
- "fumiga" = spraying
- "jala monte" / "jala yerba" = pulled weeds
- "corta césped" = lawn cutting

Rules:
- Ignore any entry or line that has been struck through or crossed out - those jobs are already billed and must not be included.
- If a field is illegible, ambiguous, or you had to guess, still give your best value but mark that field's confidence as "low" in the confidence object. Only mark "high" when you're confident you read it correctly.
- A sheet usually contains multiple job entries across different days and clients - extract every one that is not struck through.

Respond with ONLY this exact JSON shape and nothing else - no markdown fences, no commentary:
{
  "entries": [
    {
      "date": string,
      "client_name": string,
      "description": string,
      "hours": number,
      "crew_size": number,
      "materials": [{ "material": string, "quantity": string }],
      "confidence": {
        "date": "high" | "low",
        "client_name": "high" | "low",
        "description": "high" | "low",
        "hours": "high" | "low",
        "crew_size": "high" | "low",
        "materials": "high" | "low"
      }
    }
  ]
}`;

interface ParsedEntry {
  date: string;
  client_name: string;
  description: string;
  hours: number;
  crew_size: number;
  materials: { material: string; quantity: string }[];
  confidence: Record<string, "high" | "low">;
}

function parseDateOrToday(raw: string): string {
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export async function processTimesheet(timesheetId: string) {
  const supabase = await createClient();

  try {
    const { data: timesheet, error: fetchError } = await supabase
      .from("timesheets")
      .select("*")
      .eq("id", timesheetId)
      .single();
    if (fetchError || !timesheet) throw new Error(fetchError?.message || "Timesheet not found.");

    await supabase.from("timesheets").update({ status: "processing" }).eq("id", timesheetId);

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("timesheets")
      .download(timesheet.photo_path);
    if (downloadError || !fileBlob) throw new Error(downloadError?.message || "Could not download the photo.");

    const arrayBuffer = await fileBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mediaType = fileBlob.type || "image/jpeg";

    const [{ data: settings }, { data: clients }] = await Promise.all([
      supabase.from("settings").select("hourly_rate").eq("id", 1).single(),
      supabase.from("clients").select("id, name"),
    ]);
    const hourlyRate = settings?.hourly_rate ?? 60;

    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64,
              },
            },
            { type: "text", text: "Parse this timesheet photo according to your instructions." },
          ],
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("The model returned no text response.");

    let parsed: { entries: ParsedEntry[] };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      throw new Error("Could not parse the model's response as JSON.");
    }

    for (const entry of parsed.entries ?? []) {
      const matchedClient = (clients ?? []).find(
        (c) => c.name.trim().toLowerCase() === (entry.client_name || "").trim().toLowerCase(),
      );
      const hours = Number(entry.hours) || 0;
      const crewSize = Number(entry.crew_size) || 0;

      await supabase.from("jobs").insert({
        client_id: matchedClient?.id ?? null,
        client_name_raw: entry.client_name ?? null,
        timesheet_id: timesheetId,
        date: parseDateOrToday(entry.date),
        description: entry.description ?? null,
        hours,
        crew_size: crewSize,
        materials: entry.materials ?? [],
        suggested_amount: hours * crewSize * hourlyRate,
        field_confidence: entry.confidence ?? {},
        status: "draft",
      });
    }

    await supabase.from("timesheets").update({ status: "processed" }).eq("id", timesheetId);
  } catch (err) {
    await supabase
      .from("timesheets")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Unknown error.",
      })
      .eq("id", timesheetId);
  }

  revalidatePath("/new-invoice");
}
