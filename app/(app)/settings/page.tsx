import PageHeader from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/server";
import type { Settings } from "@/lib/types";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).single();

  return (
    <>
      <PageHeader title="Settings" />
      <SettingsForm settings={data as Settings} />
    </>
  );
}
