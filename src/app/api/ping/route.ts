// src/app/api/ping/route.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Toca la base una vez por día para que Supabase no pause el proyecto por
 * inactividad (el plan Free lo hace tras ~1 semana sin tráfico).
 * Lo dispara el cron de Vercel; no hay sesión de usuario, así que va con la
 * clave publicable y RLS devuelve vacío: alcanza con que la consulta llegue.
 */
export async function GET(req: Request) {
  const esperado = process.env.CRON_SECRET;
  if (esperado && req.headers.get("authorization") !== `Bearer ${esperado}`) {
    return new Response("No autorizado", { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const { error } = await supabase.from("tarjetas").select("id", { head: true });
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
