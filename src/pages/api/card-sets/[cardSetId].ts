import type { APIRoute } from "astro";
import { z } from "zod";
import type { ErrorResponse } from "../../../types";
import { CardSetService, CardSetServiceError } from "../../../lib/services/card-set.service";

// Schemat walidacji dla UUID
const uuidSchema = z.string().uuid();

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
