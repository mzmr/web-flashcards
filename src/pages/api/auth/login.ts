import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const body = await request.json();

    // Walidacja danych wejściowych
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane logowania",
          details: result.error.issues,
        }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy email lub hasło",
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        user: data.user,
      }),
      { status: 200 }
    );
  } catch {
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas logowania",
      }),
      { status: 500 }
    );
  }
};
