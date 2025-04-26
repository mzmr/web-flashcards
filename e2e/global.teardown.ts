import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

teardown("cleanup database after tests", async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const userId = process.env.E2E_USERNAME_ID;

  if (!supabaseUrl || !supabaseKey || !userId) {
    throw new Error("Missing required environment variables for database cleanup");
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  try {
    // Najpierw pobieramy wszystkie zestawy kart użytkownika
    const { data: userCardSets, error: cardSetsQueryError } = await supabase
      .from("card_sets")
      .select("id")
      .eq("user_id", userId);

    if (cardSetsQueryError) {
      console.error("Error querying card sets:", cardSetsQueryError);
      throw cardSetsQueryError;
    }

    const cardSetIds = userCardSets?.map((set) => set.id) || [];

    if (cardSetIds.length > 0) {
      // Usuwamy karty należące do zestawów użytkownika
      const { error: cardsError } = await supabase.from("cards").delete().in("card_set_id", cardSetIds);

      if (cardsError) {
        console.error("Error deleting cards:", cardsError);
        throw cardsError;
      }
    }

    // Usuwamy zestawy kart użytkownika
    const { error: cardSetsError } = await supabase.from("card_sets").delete().eq("user_id", userId);

    if (cardSetsError) {
      console.error("Error deleting card sets:", cardSetsError);
      throw cardSetsError;
    }

    // Usuwamy wpisy z tabeli generations
    const { error: generationsError } = await supabase.from("generations").delete().eq("user_id", userId);

    if (generationsError) {
      console.error("Error deleting generations:", generationsError);
      throw generationsError;
    }

    // Usuwamy wpisy z tabeli generation_errors
    const { error: generationErrorsError } = await supabase.from("generation_errors").delete().eq("user_id", userId);

    if (generationErrorsError) {
      console.error("Error deleting generation errors:", generationErrorsError);
      throw generationErrorsError;
    }

    console.log("Successfully cleaned up the database");
  } catch (error) {
    console.error("Error during database cleanup:", error);
    throw error;
  }
});
