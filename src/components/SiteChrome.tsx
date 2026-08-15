import { Link } from "@tanstack/react-router";
import { CartSheet } from "./CartSheet";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link to="/" className="font-display text-xl tracking-tight">
          Fay<span className="text-primary">s</span>Kitchen
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="/#shop" className="transition-colors hover:text-foreground">
            Shop
          </a>
          <a href="/#story" className="transition-colors hover:text-foreground">
            Our story
          </a>
          <a href="/#shipping" className="transition-colors hover:text-foreground">
            Shipping
          </a>
          <a href="/#contact" className="transition-colors hover:text-foreground">
            Contact
          </a>

        </nav>
        <CartSheet />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-lg text-foreground">FaysKitchen</p>
        <p>Handmade in small batches · Shipped across the United States</p>
        <p>© {new Date().getFullYear()} FaysKitchen</p>
      </div>
    </footer>
  );
}
