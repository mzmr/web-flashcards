import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.server";
import { isFeatureEnabled } from "@/features/featureFlags";

export const onRequest = defineMiddleware(async ({ locals, cookies, request }, next) => {
  const isAuthPath = request.url.includes("/auth/");
  const isAuthEnabled = isFeatureEnabled("auth");

  // Przekieruj na główną stronę gdy próba dostępu do auth przy wyłączonej fladze
  if (isAuthPath && !isAuthEnabled) {
    return Response.redirect(new URL("/card-sets", request.url));
  }

  // Inicjalizuj Supabase tylko gdy auth jest włączone
  if (isAuthEnabled) {
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

    // Zawsze dostępny supabase client w locals gdy auth włączone
    locals.supabase = supabase;
  }

  return next();
});
