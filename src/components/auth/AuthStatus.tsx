import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

interface AuthStatusProps {
  user: { email: string } | null;
  onLogout: () => Promise<void>;
}

export function AuthStatus({ user, onLogout }: AuthStatusProps) {
  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <a href="/auth/login">Zaloguj się</a>
        </Button>
        <Button asChild>
          <a href="/auth/register">Zarejestruj się</a>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Konto</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>Wyloguj się</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
