import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsCommand } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { GenerationService, GenerationServiceError } from "../../lib/services/generation.service";

// Schema walidacji dla danych wejściowych
const generateFlashcardsSchema = z.object({
  input_text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text cannot exceed 10000 characters"),
  card_set_id: z.string().uuid("Invalid UUID format"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Parse and validate input data
    const body = await request.json();
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input data",
          details: validationResult.error.issues,
        }),
        { status: 400 }
      );
    }

    const command = validationResult.data as GenerateFlashcardsCommand;

    // 2. Generate flashcards using service
    const generationService = new GenerationService(locals.supabase, DEFAULT_USER_ID);
    const result = await generationService.generateFlashcards(command);

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (error) {
    console.error("Error while generating flashcards:", error);

    if (error instanceof GenerationServiceError) {
      if (error.code === "CARD_SET_NOT_FOUND") {
        return new Response(JSON.stringify({ error: error.message }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      { status: 500 }
    );
  }
};
