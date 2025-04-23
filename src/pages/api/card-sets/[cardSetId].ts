import type { APIRoute } from "astro";
import { z } from "zod";
import type { ErrorResponse } from "@/types";
import { CardSetService, CardSetServiceError } from "../../../lib/services/card-set.service";

// Schemat walidacji dla body żądania PUT
const updateCardSetSchema = z.object({
  name: z.string().min(1).max(100),
});

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Wymagane zalogowanie" }), { status: 401 });
    }

    // Walidacja cardSetId
    const result = z.string().uuid().safeParse(params.cardSetId);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format identyfikatora zestawu",
          code: "VALIDATION_ERROR",
        } satisfies ErrorResponse),
        { status: 400 }
      );
    }

    const cardSetService = new CardSetService(locals.supabase);
    const cardSetDetails = await cardSetService.getCardSetDetails(result.data);

    if (!cardSetDetails) {
      return new Response(
        JSON.stringify({
          error: "Nie znaleziono zestawu fiszek",
          code: "NOT_FOUND",
        } satisfies ErrorResponse),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(cardSetDetails), {
      status: 200,
    });
  } catch (error) {
    console.error("Błąd podczas pobierania szczegółów zestawu:", error);

    if (error instanceof CardSetServiceError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
        } satisfies ErrorResponse),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania",
        code: "INTERNAL_SERVER_ERROR",
      } satisfies ErrorResponse),
      { status: 500 }
    );
  }
};

export const PUT: APIRoute = async ({ params, locals, request }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Wymagane zalogowanie" }), { status: 401 });
    }

    // Walidacja cardSetId
    const cardSetIdResult = z.string().uuid().safeParse(params.cardSetId);
    if (!cardSetIdResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format identyfikatora zestawu",
          code: "VALIDATION_ERROR",
        } satisfies ErrorResponse),
        { status: 400 }
      );
    }

    // Walidacja body
    const body = await request.json();
    const bodyResult = updateCardSetSchema.safeParse(body);
    if (!bodyResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          code: "VALIDATION_ERROR",
          details: bodyResult.error.issues,
        } satisfies ErrorResponse),
        { status: 400 }
      );
    }

    const cardSetService = new CardSetService(locals.supabase);
    const updatedCardSet = await cardSetService.updateCardSet(
      locals.user.id,
      cardSetIdResult.data,
      bodyResult.data.name
    );

    return new Response(JSON.stringify(updatedCardSet), {
      status: 200,
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji zestawu:", error);

    if (error instanceof CardSetServiceError) {
      if (error.code === "CARD_SET_NOT_FOUND") {
        return new Response(
          JSON.stringify({
            error: error.message,
            code: error.code,
          } satisfies ErrorResponse),
          { status: 404 }
        );
      }

      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
        } satisfies ErrorResponse),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania",
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

    // Walidacja cardSetId
    const result = z.string().uuid().safeParse(params.cardSetId);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format identyfikatora zestawu",
          code: "VALIDATION_ERROR",
        } satisfies ErrorResponse),
        { status: 400 }
      );
    }

    const cardSetService = new CardSetService(locals.supabase);
    await cardSetService.deleteCardSet(locals.user.id, result.data);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Błąd podczas usuwania zestawu:", error);

    if (error instanceof CardSetServiceError) {
      if (error.code === "CARD_SET_NOT_FOUND") {
        return new Response(
          JSON.stringify({
            error: error.message,
            code: error.code,
          } satisfies ErrorResponse),
          { status: 404 }
        );
      }

      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
        } satisfies ErrorResponse),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania",
        code: "INTERNAL_SERVER_ERROR",
      } satisfies ErrorResponse),
      { status: 500 }
    );
  }
};
