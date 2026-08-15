import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { isAdminUser } from "@/utils/orders.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Orders Admin — FaysKitchen" },
      {
        name: "description",
        content: "Private FaysKitchen admin area for reviewing and fulfilling customer orders.",
      },
      { property: "og:title", content: "Orders Admin — FaysKitchen" },
      { property: "og:description", content: "Private FaysKitchen order management area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (!data.session) {
        navigate({ to: "/auth" });
        return;
      }
      try {
        const result = await isAdminUser();
        if (!active) return;
        setState(result.isAdmin ? "ok" : "denied");
      } catch {
        if (active) setState("denied");
      }
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="text-3xl">Not authorised</h1>
        <p className="mt-3 text-muted-foreground">
          This account does not have access to the FaysKitchen orders admin.
        </p>
        <Button
          className="mt-6"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/admin" className="font-display text-xl">
            FaysKitchen orders
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              View shop
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/auth" });
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <Outlet />
      </main>
    </div>
  );
}
