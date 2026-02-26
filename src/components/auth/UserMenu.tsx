"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function UserMenu() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) return null;

  if (!user) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="shadow-md"
        onClick={() => router.push("/login")}
      >
        <User className="h-4 w-4 mr-1.5" />
        Entrar
      </Button>
    );
  }

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium bg-background/95 backdrop-blur-sm rounded-md border shadow-md px-3 py-1.5">
        {displayName}
      </span>
      <Button
        variant="secondary"
        size="sm"
        className="shadow-md"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
