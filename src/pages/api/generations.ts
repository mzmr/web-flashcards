import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsCommand, ErrorResponse } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { GenerationService, GenerationServiceError } from "../../lib/services/generation.service";

// Schema walidacji dla danych wejściowych
const generateFlashcardsSchema = z.object({
  input_text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text cannot exceed 10000 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Parse and validate input data
    const body = await request.json();
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      const errorResponse: ErrorResponse = {
        error: "Invalid input data",
        details: validationResult.error.issues,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const command = validationResult.data as GenerateFlashcardsCommand;

    // 2. Generate flashcards using service
    const generationService = new GenerationService(locals.supabase, DEFAULT_USER_ID);
    const result = await generationService.generateFlashcards(command);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error while generating flashcards:", error);

    if (error instanceof GenerationServiceError) {
      const errorResponse: ErrorResponse = {
        error: error.message,
        code: error.code,
      };

      if (error.code === "CARD_SET_NOT_FOUND") {
        return new Response(JSON.stringify(errorResponse), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const errorResponse: ErrorResponse = {
      error: "Internal server error",
      code: "UNKNOWN_ERROR",
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
