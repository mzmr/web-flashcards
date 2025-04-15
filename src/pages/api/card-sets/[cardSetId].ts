import type { APIRoute } from "astro";
import { z } from "zod";
import type { ErrorResponse, DeleteCardSetResponseDTO } from "../../../types";
import { CardSetService, CardSetServiceError } from "../../../lib/services/card-set.service";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

// Schemat walidacji dla UUID
const uuidSchema = z.string().uuid();

// Schemat walidacji dla body żądania PUT
const updateCardSetSchema = z.object({
  name: z.string().min(1).max(100),
});

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Walidacja cardSetId
    const result = uuidSchema.safeParse(params.cardSetId);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format identyfikatora zestawu",
          details: result.error.issues,
        } satisfies ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const cardSetId = result.data;
    const cardSetService = new CardSetService(locals.supabase);

    // Pobieranie szczegółów zestawu
    const cardSetDetails = await cardSetService.getCardSetDetails(cardSetId);

    if (!cardSetDetails) {
      return new Response(
        JSON.stringify({
          error: "Nie znaleziono zestawu fiszek",
        } satisfies ErrorResponse),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(cardSetDetails), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Błąd podczas pobierania szczegółów zestawu:", error);

    if (error instanceof CardSetServiceError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
        } satisfies ErrorResponse),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania",
      } satisfies ErrorResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const PUT: APIRoute = async ({ params, locals, request }) => {
  try {
    // Walidacja cardSetId
    const cardSetIdResult = uuidSchema.safeParse(params.cardSetId);
    if (!cardSetIdResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format identyfikatora zestawu",
          details: cardSetIdResult.error.issues,
        } satisfies ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Walidacja body
    const body = await request.json();
    const bodyResult = updateCardSetSchema.safeParse(body);
    if (!bodyResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: bodyResult.error.issues,
        } satisfies ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const cardSetService = new CardSetService(locals.supabase);
    const updatedCardSet = await cardSetService.updateCardSet(
      DEFAULT_USER_ID,
      cardSetIdResult.data,
      bodyResult.data.name
    );

    return new Response(JSON.stringify(updatedCardSet), {
      status: 200,
      headers: { "Content-Type": "application/json" },
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
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
        } satisfies ErrorResponse),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania",
      } satisfies ErrorResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Walidacja cardSetId
    const result = uuidSchema.safeParse(params.cardSetId);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format identyfikatora zestawu",
          details: result.error.issues,
        } satisfies ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const cardSetId = result.data;
    const cardSetService = new CardSetService(locals.supabase);

    await cardSetService.deleteCardSet(DEFAULT_USER_ID, cardSetId);

    return new Response(
      JSON.stringify({
        message: "Zestaw fiszek został pomyślnie usunięty",
      } satisfies DeleteCardSetResponseDTO),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Błąd podczas usuwania zestawu:", error);

    if (error instanceof CardSetServiceError) {
      if (error.code === "CARD_SET_NOT_FOUND") {
        return new Response(
          JSON.stringify({
            error: error.message,
            code: error.code,
          } satisfies ErrorResponse),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
        } satisfies ErrorResponse),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas przetwarzania żądania",
      } satisfies ErrorResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
