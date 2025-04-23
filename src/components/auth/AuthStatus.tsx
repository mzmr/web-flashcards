import { Button } from "@/components/ui/button";

interface AuthStatusProps {
  user?: {
    email: string | null;
  };
}

export function AuthStatus({ user }: AuthStatusProps) {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Błąd podczas wylogowywania");
      }

      // Odśwież stronę po wylogowaniu
      window.location.reload();
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="outline" onClick={handleLogout}>
            Wyloguj się
          </Button>
        </>
      ) : (
        <Button variant="outline" asChild>
          <a href="/auth/login">Zaloguj się</a>
        </Button>
      )}
    </div>
  );
}
