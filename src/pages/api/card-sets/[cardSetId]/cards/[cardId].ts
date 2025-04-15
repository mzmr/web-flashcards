import { z } from "zod";
import type { APIRoute } from "astro";
import type { UpdateCardCommand, UpdateCardResponseDTO, ErrorResponse } from "@/types";
import { CardsService } from "@/lib/services/cards.service";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

// Schemat walidacji dla danych wejściowych
const updateCardSchema = z.object({
  front: z.string().min(1).max(300),
  back: z.string().min(1).max(300),
});

export const prerender = false;

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Pobierz i zwaliduj parametry URL
    const { cardSetId, cardId } = params;
    if (!cardSetId || !cardId) {
      return new Response(
        JSON.stringify({
          error: "Brak wymaganych parametrów URL",
          code: "MISSING_PARAMS",
        } satisfies ErrorResponse),
        { status: 400 }
      );
    }

    // 2. Pobierz i zwaliduj dane wejściowe
    const input = await request.json();
    const validationResult = updateCardSchema.safeParse(input);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          code: "VALIDATION_ERROR",
          details: validationResult.error.issues,
        } satisfies ErrorResponse),
        { status: 400 }
      );
    }

    // 3. Pobierz klienta Supabase z kontekstu
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(
        JSON.stringify({
          error: "Błąd serwera - brak klienta bazy danych",
          code: "DATABASE_ERROR",
        } satisfies ErrorResponse),
        { status: 500 }
      );
    }

    // 4. Zaktualizuj kartę używając serwisu
    const cardsService = new CardsService(supabase);
    const updatedCard = await cardsService.updateCard(
      cardSetId,
      cardId,
      validationResult.data as UpdateCardCommand,
      DEFAULT_USER_ID
    );

    return new Response(JSON.stringify(updatedCard satisfies UpdateCardResponseDTO), {
      status: 200,
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji karty:", error);

    // Obsługa znanych błędów
    if (error instanceof Error) {
      if (
        error.message === "Zestaw kart nie istnieje lub brak dostępu" ||
        error.message === "Karta nie istnieje w tym zestawie"
      ) {
        return new Response(
          JSON.stringify({
            error: error.message,
            code: "NOT_FOUND",
          } satisfies ErrorResponse),
          { status: 404 }
        );
      }
    }

    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd",
        code: "INTERNAL_SERVER_ERROR",
      } satisfies ErrorResponse),
      { status: 500 }
    );
  }
};
