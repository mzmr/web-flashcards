import { z } from "zod";
import type { APIRoute } from "astro";
import type { UpdateCardCommand, UpdateCardResponseDTO, ErrorResponse } from "@/types";
import { CardsService, CardsServiceError } from "@/lib/services/cards.service";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

// Schemat walidacji dla danych wejściowych
const updateCardSchema = z.object({
  front: z.string().min(1).max(300),
  back: z.string().min(1).max(300),
});

// Schema walidacji parametrów URL
const paramsSchema = z.object({
  cardSetId: z.string().uuid(),
  cardId: z.string().uuid(),
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

    if (error instanceof CardsServiceError) {
      // Mapowanie kodów błędów na odpowiednie kody HTTP
      switch (error.code) {
        case "CARD_SET_NOT_FOUND":
        case "CARD_NOT_FOUND":
          return new Response(
            JSON.stringify({
              error: error.message,
              code: error.code,
            } satisfies ErrorResponse),
            { status: 404 }
          );
        case "UPDATE_CARD_FAILED":
          return new Response(
            JSON.stringify({
              error: error.message,
              code: error.code,
            } satisfies ErrorResponse),
            { status: 500 }
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

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // 1. Walidacja parametrów URL
    const paramsValidation = paramsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe parametry",
          code: "VALIDATION_ERROR",
          details: paramsValidation.error.issues,
        } satisfies ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { cardSetId, cardId } = paramsValidation.data;

    // 2. Pobierz klienta Supabase z kontekstu
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

    // 3. Usuń kartę używając serwisu
    const cardsService = new CardsService(supabase);
    const deleteResult = await cardsService.deleteCard(cardSetId, cardId, DEFAULT_USER_ID);

    return new Response(JSON.stringify(deleteResult), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Błąd podczas usuwania fiszki:", error);

    if (error instanceof CardsServiceError) {
      // Mapowanie kodów błędów na odpowiednie kody HTTP
      switch (error.code) {
        case "CARD_SET_NOT_FOUND":
        case "CARD_NOT_FOUND":
          return new Response(
            JSON.stringify({
              error: error.message,
              code: error.code,
            } satisfies ErrorResponse),
            { status: 404 }
          );
        case "DELETE_CARD_FAILED":
          return new Response(
            JSON.stringify({
              error: error.message,
              code: error.code,
            } satisfies ErrorResponse),
            { status: 500 }
          );
      }
    }

    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd",
        code: "INTERNAL_SERVER_ERROR",
      } satisfies ErrorResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
