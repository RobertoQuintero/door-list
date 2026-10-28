import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { mapRegistrationTrendPoint, type RegistrationTrendRow } from "@/lib/supabase/mappers";
import type { ApiErrorResponse, RegistrationTrendResponse } from "@/lib/types";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function errorResponse(error: string, status: number) {
  return NextResponse.json<ApiErrorResponse>({ error }, { status });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await context.params;
  if (!uuid.test(eventId)) return errorResponse("Evento no válido.", 400);

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return errorResponse("Inicia sesión para consultar los registros.", 401);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return errorResponse("El servicio de registros no está configurado.", 503);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authorization } },
    });
    const token = authorization.slice("Bearer ".length);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return errorResponse("Tu sesión no es válida.", 401);
    }

    const { data, error } = await supabase.rpc("get_organizer_registration_trend", {
      p_event_id: eventId,
    });
    if (error) {
      console.error("Registration trend RPC failed", error.message);
      return errorResponse("No pudimos cargar los registros por día.", 500);
    }

    const rows = (data ?? []) as RegistrationTrendRow[];
    if (!rows.length) {
      return errorResponse("El evento no existe o no tienes permiso para consultarlo.", 404);
    }

    return NextResponse.json<RegistrationTrendResponse>({
      data: rows.map(mapRegistrationTrendPoint),
    });
  } catch (providerError) {
    console.error("Registration trend provider request failed", providerError);
    return errorResponse("No pudimos cargar los registros por día.", 500);
  }
}
