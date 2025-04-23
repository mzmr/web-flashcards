import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.server";

export const onRequest = defineMiddleware(async ({ locals, cookies, request }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // IMPORTANT: Always get user session first before any other operations
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ustaw informacje o użytkowniku jeśli jest zalogowany
  if (user) {
    locals.user = {
      email: user.email ?? null,
      id: user.id,
    };
  }

  // Zawsze dostępny supabase client w locals
  locals.supabase = supabase;
  return next();
});
