import type { Database } from "./db/database.types";

/**
 * Wspólne typy
 */
export type UUID = string;
export type Timestamp = string;

export type CardSource = "ai_generated" | "ai_edited" | "user_created";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

/**
 * DTO i Command Modele dla Card Set
 */

// DTO reprezentujący Card Set jako summary (lista)
export interface CardSetDTO {
  id: UUID;
  name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Rozszerzony DTO dla szczegółów Card Set, zawierający listę fiszek
export interface CardSetDetailDTO extends CardSetDTO {
  cards: CardDTO[];
}

/**
 * Command Model dla tworzenia Card Set
 * (Request: { name: string })
 */
export type CreateCardSetCommand = Pick<CardSetDTO, "name">;

// Odpowiedzi API związane z Card Set
export type CreateCardSetResponseDTO = CardSetDTO;
export type UpdateCardSetResponseDTO = CardSetDTO;
export interface DeleteCardSetResponseDTO {
  message: string;
}
export interface ListCardSetsResponseDTO {
  cardSets: CardSetDTO[];
  pagination: Pagination;
}

/**
 * DTO i Command Modele dla Card
 */

// DTO reprezentujący pojedynczą fiszkę
export interface CardDTO {
  id: UUID;
  front: string;
  back: string;
  source: CardSource;
  // generation_id jest wymagane dla fiszek AI-generated/edited,
  // dla fiszek tworzonych przez użytkownika może być nullem
  generation_id: UUID | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Command Model dla tworzenia fiszek.
 * Używamy unii rozróżniającej w zależności od źródła fiszki.
 */
export interface AICardCreateInput {
  front: string;
  back: string;
  source: "ai_generated" | "ai_edited";
  generation_id: UUID;
}

export interface UserCardCreateInput {
  front: string;
  back: string;
  source: "user_created";
}

export type CardCreateInput = AICardCreateInput | UserCardCreateInput;

export interface CreateCardsCommand {
  cards: CardCreateInput[];
}

// Odpowiedź przy tworzeniu fiszek: lista utworzonych fiszek
export interface CreateCardsResponseDTO {
  cards: CardDTO[];
}

/**
 * Command Model dla aktualizacji fiszki.
 * Używamy prostego modelu aktualizacji, ograniczonego do pól `front` oraz `back`.
 */
export interface UpdateCardCommand {
  front: string;
  back: string;
}

export type UpdateCardResponseDTO = CardDTO;

export interface DeleteCardResponseDTO {
  message: string;
}

/**
 * DTO i Command Modele dla Generation (generowania fiszek)
 */

// Command Model dla procesu generowania fiszek (Request)
export interface GenerateFlashcardsCommand {
  input_text: string; // długość tekstu od 1000 do 10000 znaków
  card_set_id: UUID;
}

// Odpowiedź natychmiastowa z podglądem wygenerowanych fiszek
export interface GenerateFlashcardsResponseDTO {
  generation_id: UUID;
  cards: { front: string; back: string }[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Odpowiedź z pełnymi szczegółami procesu generowania fiszek
export interface GetGenerationDetailsResponseDTO {
  generation_id: UUID;
  input_text: string;
  cards: CardDTO[];
  metadata: {
    duration: number;
    generated_count: number;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Aliasy typów z bazy danych
export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type CardSet = Database["public"]["Tables"]["card_sets"]["Row"];
export type GenerationError = Database["public"]["Tables"]["generation_errors"]["Insert"];
