import type { CardSource } from "@/types";

export const sourceLabels: Record<CardSource, string> = {
  ai_generated: "Wygenerowane przez AI",
  ai_edited: "Wygenerowane przez AI, edytowane",
  user_created: "Utworzone ręcznie",
};

export const sourceBadgeVariants: Record<CardSource, "default" | "secondary" | "destructive" | "outline"> = {
  ai_generated: "default",
  ai_edited: "destructive",
  user_created: "secondary",
};
