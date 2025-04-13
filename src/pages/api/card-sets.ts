import { z } from "zod";
import type { APIRoute } from "astro";
import { CardSetService, CardSetServiceError } from "../../lib/services/card-set.service";
import type { CreateCardSetCommand, CreateCardSetResponseDTO, ErrorResponse } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

// Schemat walidacji
const createCardSetSchema = z.object({
  name: z.string().min(1, "Nazwa zestawu nie może być pusta").max(100, "Nazwa zestawu nie może przekraczać 100 znaków"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parsowanie body
    const body = await request.json();

    // Walidacja danych wejściowych
    const result = createCardSetSchema.safeParse(body);
    if (!result.success) {
      const errorResponse: ErrorResponse = {
        error: "Nieprawidłowe dane wejściowe",
        details: result.error.issues,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const command = result.data as CreateCardSetCommand;

    // Utworzenie zestawu fiszek
    const cardSetService = new CardSetService(locals.supabase);
    const cardSet = await cardSetService.createCardSet(DEFAULT_USER_ID, command);

    // Zwrócenie odpowiedzi
    const response: CreateCardSetResponseDTO = cardSet;
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Błąd podczas tworzenia zestawu fiszek:", error);

    if (error instanceof CardSetServiceError) {
      const errorResponse: ErrorResponse = {
        error: error.message,
        code: error.code,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const errorResponse: ErrorResponse = {
      error: "Wystąpił błąd podczas przetwarzania żądania",
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
