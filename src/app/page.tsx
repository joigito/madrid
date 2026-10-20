import { redirect } from "next/navigation";

import { supabaseConfigurado } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  if (!supabaseConfigurado) {
    redirect("/configuracion");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/tablero" : "/login");
}
