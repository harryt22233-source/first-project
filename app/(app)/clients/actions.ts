"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AddClientState = { error: string };

export async function addClient(_prevState: AddClientState, formData: FormData): Promise<AddClientState> {
  const supabase = await createClient();

  const name = (formData.get("name") as string).trim();
  const property_address = (formData.get("property_address") as string).trim() || null;
  const email = (formData.get("email") as string).trim() || null;
  const phone = (formData.get("phone") as string).trim() || null;

  if (!name) {
    return { error: "Name is required." };
  }

  const { error } = await supabase.from("clients").insert({ name, property_address, email, phone });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/clients");
  return { error: "" };
}
