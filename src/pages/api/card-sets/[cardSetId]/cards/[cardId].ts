import { z } from "zod";
import type { APIRoute } from "astro";
import type { UpdateCardCommand, UpdateCardResponseDTO, ErrorResponse } from "@/types";
import { CardsService, CardsServiceError } from "@/lib/services/cards.service";

// Schemat walidacji dla danych wejściowych
const updateCardSchema = z.object({
  front: z.string().min(1).max(300),
  back: z.string().min(1).max(300),
});

export const prerender = false;

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Wymagane zalogowanie" }), { status: 401 });
    }

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

    // Walidacja UUID
    const cardSetIdResult = z.string().uuid().safeParse(cardSetId);
    const cardIdResult = z.string().uuid().safeParse(cardId);

    if (!cardSetIdResult.success || !cardIdResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format identyfikatorów",
          code: "VALIDATION_ERROR",
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

    // 3. Zaktualizuj kartę używając serwisu
    const cardsService = new CardsService(locals.supabase);
    const updatedCard = await cardsService.updateCard(
      cardSetIdResult.data,
      cardIdResult.data,
      validationResult.data as UpdateCardCommand,
      locals.user.id
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
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Wymagane zalogowanie" }), { status: 401 });
    }

    // Walidacja parametrów URL
    const cardSetIdResult = z.string().uuid().safeParse(params.cardSetId);
    const cardIdResult = z.string().uuid().safeParse(params.cardId);

    if (!cardSetIdResult.success || !cardIdResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format identyfikatorów",
          code: "VALIDATION_ERROR",
        } satisfies ErrorResponse),
        { status: 400 }
      );
    }

    const cardsService = new CardsService(locals.supabase);
    const deleteResult = await cardsService.deleteCard(cardSetIdResult.data, cardIdResult.data, locals.user.id);

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
