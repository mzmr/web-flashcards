import { z } from "zod";
import type { APIRoute } from "astro";
import { CardSetService, CardSetServiceError } from "../../lib/services/card-set.service";
import type {
  CreateCardSetCommand,
  CreateCardSetResponseDTO,
  ErrorResponse,
  ListCardSetsResponseDTO,
} from "../../types";

export const prerender = false;

// Schemat walidacji
const createCardSetSchema = z.object({
  name: z.string().min(1, "Nazwa zestawu nie może być pusta").max(100, "Nazwa zestawu nie może przekraczać 100 znaków"),
});

// Schemat walidacji dla parametrów zapytania GET /card-sets
const listCardSetsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(["created_at", "updated_at", "name"]).optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Wymagane zalogowanie" }), { status: 401 });
    }

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
    const cardSet = await cardSetService.createCardSet(locals.user.id, command);

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

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Wymagane zalogowanie" }), { status: 401 });
    }

    // Parsowanie i walidacja parametrów zapytania
    const searchParams = Object.fromEntries(url.searchParams);
    const result = listCardSetsQuerySchema.safeParse(searchParams);

    if (!result.success) {
      const errorResponse: ErrorResponse = {
        error: "Nieprawidłowe parametry zapytania",
        details: result.error.issues,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { page, limit, sort } = result.data;

    // Pobranie zestawów fiszek
    const cardSetService = new CardSetService(locals.supabase);
    const { cardSets, total } = await cardSetService.listCardSets(locals.user.id, page, limit, sort);

    // Przygotowanie odpowiedzi
    const response: ListCardSetsResponseDTO = {
      cardSets,
      pagination: {
        page,
        limit,
        total,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Błąd podczas pobierania zestawów fiszek:", error);

    if (error instanceof CardSetServiceError) {
      const errorResponse: ErrorResponse = {
        error: error.message,
        code: error.code,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const errorResponse: ErrorResponse = {
      error: "Wystąpił błąd podczas przetwarzania żądania",
      code: "UNKNOWN_ERROR",
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
