"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { error: string; saved: boolean };

export async function updateSettings(_prevState: SettingsState, formData: FormData): Promise<SettingsState> {
  const supabase = await createClient();

  const payload = {
    business_name: (formData.get("business_name") as string).trim(),
    business_address: (formData.get("business_address") as string).trim(),
    business_phone: (formData.get("business_phone") as string).trim(),
    hourly_rate: Number(formData.get("hourly_rate")) || 0,
    next_invoice_number: Number(formData.get("next_invoice_number")) || 1,
  };

  const { error } = await supabase.from("settings").update(payload).eq("id", 1);
  if (error) {
    return { error: error.message, saved: false };
  }

  revalidatePath("/settings");
  return { error: "", saved: true };
}
