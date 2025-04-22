import { z } from "zod";

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};:,.<>])[A-Za-z\d@$!%*?&#^()_+\-=[\]{};:,.<>]{8,}$/;

export const passwordSchema = z
  .string()
  .min(8, "Hasło musi mieć minimum 8 znaków")
  .regex(PASSWORD_REGEX, "Hasło musi zawierać wielką literę, cyfrę i znak specjalny");
