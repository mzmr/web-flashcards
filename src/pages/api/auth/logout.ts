import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.server";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Błąd podczas wylogowywania",
        }),
        { status: 400 }
      );
    }

    return new Response(null, { status: 200 });
  } catch {
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas wylogowywania",
      }),
      { status: 500 }
    );
  }
};
