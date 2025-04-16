import { z } from "zod";
import type { APIRoute } from "astro";
import type { CreateCardsResponseDTO, ErrorResponse } from "@/types";
import { CardsService } from "@/lib/services/cards.service";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

// Schemat walidacji dla pojedynczej fiszki
const cardCreateInputSchema = z.discriminatedUnion("source", [
  // Schemat dla fiszek AI-generated i AI-edited
  z.object({
    front: z
      .string()
      .min(1, "Tekst przedniej strony jest wymagany")
      .max(300, "Tekst przedniej strony nie może przekraczać 300 znaków"),
    back: z
      .string()
      .min(1, "Tekst tylnej strony jest wymagany")
      .max(300, "Tekst tylnej strony nie może przekraczać 300 znaków"),
    source: z.enum(["ai_generated", "ai_edited"]),
    generation_id: z.string().uuid("Nieprawidłowy format generation_id"),
  }),
  // Schemat dla fiszek tworzonych przez użytkownika
  z.object({
    front: z
      .string()
      .min(1, "Tekst przedniej strony jest wymagany")
      .max(300, "Tekst przedniej strony nie może przekraczać 300 znaków"),
    back: z
      .string()
      .min(1, "Tekst tylnej strony jest wymagany")
      .max(300, "Tekst tylnej strony nie może przekraczać 300 znaków"),
    source: z.literal("user_created"),
    generation_id: z.undefined().optional(),
  }),
]);

// Schemat walidacji dla całego żądania
const createCardsSchema = z.object({
  cards: z.array(cardCreateInputSchema).min(1, "Lista fiszek nie może być pusta"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, params, locals }) => {
  try {
    // 1. Pobierz i zwaliduj cardSetId
    const cardSetId = params.cardSetId;
    if (!cardSetId) {
      return new Response(
        JSON.stringify({
          error: "Brak wymaganego parametru cardSetId",
        } satisfies ErrorResponse),
        { status: 400 }
      );
    }

    // 2. Pobierz supabase z kontekstu
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(
        JSON.stringify({
          error: "Błąd serwera",
        } satisfies ErrorResponse),
        { status: 500 }
      );
    }

    // 3. Parsuj i waliduj dane wejściowe
    const requestData = await request.json();
    const validationResult = createCardsSchema.safeParse(requestData);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Błąd walidacji danych",
          details: validationResult.error.issues,
        } satisfies ErrorResponse),
        { status: 400 }
      );
    }

    // 4. Utwórz serwis i dodaj fiszki
    const cardsService = new CardsService(supabase);
    const createdCards = await cardsService.createCards(cardSetId, validationResult.data.cards, DEFAULT_USER_ID);

    // 5. Zwróć odpowiedź
    return new Response(
      JSON.stringify({
        cards: createdCards,
      } satisfies CreateCardsResponseDTO),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in POST /api/card-sets/[cardSetId]/cards:", error);

    if (error instanceof Error) {
      if ("code" in error) {
        switch (error.code) {
          case "CARD_SET_NOT_FOUND":
            return new Response(
              JSON.stringify({
                error: "Zestaw fiszek nie istnieje lub brak dostępu",
              } satisfies ErrorResponse),
              { status: 404 }
            );
          case "CREATE_CARDS_FAILED":
          case "NO_CARDS_CREATED":
            return new Response(
              JSON.stringify({
                error: error.message,
              } satisfies ErrorResponse),
              { status: 400 }
            );
        }
      }
    }

    return new Response(
      JSON.stringify({
        error: "Błąd serwera",
      } satisfies ErrorResponse),
      { status: 500 }
    );
  }
};
