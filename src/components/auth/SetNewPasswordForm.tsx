import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { passwordSchema } from "@/lib/auth/password-rules";

const setNewPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

type SetNewPasswordFormData = z.infer<typeof setNewPasswordSchema>;

interface SetNewPasswordFormProps {
  token: string;
  onSubmit: (data: SetNewPasswordFormData & { token: string }) => Promise<void>;
}

export function SetNewPasswordForm({ token, onSubmit }: SetNewPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SetNewPasswordFormData>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: SetNewPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await onSubmit({ ...data, token });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Hasło zostało zmienione</h1>
          <p className="text-sm text-muted-foreground">Możesz teraz zalogować się używając nowego hasła</p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/auth/login")}>
          Przejdź do logowania
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Ustaw nowe hasło</h1>
        <p className="text-sm text-muted-foreground">Wprowadź i potwierdź swoje nowe hasło</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nowe hasło</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potwierdź nowe hasło</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : "Zapisz nowe hasło"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
