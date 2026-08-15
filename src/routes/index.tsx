import { createFileRoute } from "@tanstack/react-router";
import { Flame, Leaf, Truck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/products";

import jarsPair from "@/assets/jars-pair.jpg.asset.json";
import peppers from "@/assets/peppers.jpg.asset.json";
import bowl from "@/assets/bowl.jpg.asset.json";
import scotchBonnets from "@/assets/scotch-bonnets.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FaysKitchen — Haitian Pikliz, Pepper Sauce & Epis" },
      {
        name: "description",
        content:
          "Small-batch Haitian pikliz, the family Vinigratte, smoked herring pepper sauce and fresh epis. Handmade by Fay and shipped anywhere in the U.S.",
      },
      { property: "og:title", content: "FaysKitchen — Haitian Pikliz & Pepper Sauce" },
      {
        property: "og:description",
        content:
          "Handmade Haitian pikliz, Vinigratte, smoked herring pepper sauce and epis, shipped across the U.S.",
      },
    ],
  }),
  component: Home,
});

function Home() {


  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
            <div>
              <p className="eyebrow text-primary">Haitian · Handmade · Small batch</p>
              <h1 className="mt-4 text-5xl leading-[1.05] md:text-6xl">
                Pikliz the way it&apos;s made at home — with a twist that&apos;s ours.
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                Fay packs every jar by hand: peppers of every color, onions cut thin,
                vinegar and spice given time to do their work. Traditional pikliz, the
                family Vinigratte, smoked herring pepper sauce and fresh epis.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <a href="#shop">Shop the jars</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#story">Read our story</a>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Truck className="size-4 text-primary" /> Ships anywhere in the U.S.
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" /> Secure checkout
                </span>
              </div>
            </div>
            <div className="relative">
              <img
                src={jarsPair.url}
                alt="Two jars of handmade Haitian pikliz on a marble counter"
                width={1200}
                height={1500}
                className="w-full rounded-2xl object-cover shadow-jar"
              />
            </div>
          </div>
        </section>

        {/* Shop */}
        <section id="shop" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 md:py-24">
          <div className="max-w-xl">
            <p className="eyebrow text-primary">The pantry</p>
            <h2 className="mt-3 text-4xl">Four jars, one kitchen</h2>
            <p className="mt-3 text-muted-foreground">
              Every jar is made in small batches: 8 oz $9.60, 16 oz $18.40, 32 oz $30.40.
              Smoked Herring Pepper Sauce is 8 oz $14 / 16 oz $20.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((p) => (
              <ProductCard key={p.handle} product={p} />
            ))}
          </div>
        </section>

        {/* Story */}
        <section id="story" className="scroll-mt-20 border-y border-border bg-secondary/50">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
            <img
              src={bowl.url}
              alt="Fay tossing a large bowl of sliced peppers, cabbage and onions"
              loading="lazy"
              width={1600}
              height={1000}
              className="w-full rounded-2xl object-cover shadow-lift"
            />
            <div>
              <p className="eyebrow text-primary">Our story</p>
              <h2 className="mt-3 text-4xl">A flavor we still can&apos;t explain</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Fay grew up around a pot that was always going and a jar of pikliz that
                was never full for long. What started as a family recipe turned into
                something of her own — the Vinigratte, built on pickled onion and peppers
                of every color, spiced in a way nobody in the family has ever managed to
                write down properly.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Nothing here is made ahead in bulk. Peppers get sorted by hand, onions cut
                thin, and every jar rests until the brine is right.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-4">
                  <Flame className="size-5 text-primary" />
                  <p className="mt-2 font-medium">Peppers first</p>
                  <p className="text-sm text-muted-foreground">
                    Scotch bonnets and bird peppers, picked for color and heat.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <Leaf className="size-5 text-accent-foreground" />
                  <p className="mt-2 font-medium">Nothing artificial</p>
                  <p className="text-sm text-muted-foreground">
                    Vegetables, vinegar, herbs and spice. That&apos;s the whole list.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-4 sm:grid-cols-3">
            <img
              src={peppers.url}
              alt="Tray of fresh red, orange and green hot peppers"
              loading="lazy"
              width={1600}
              height={1000}
              className="h-56 w-full rounded-xl object-cover sm:col-span-2"
            />
            <img
              src={scotchBonnets.url}
              alt="Chocolate and orange scotch bonnet peppers on a wooden board"
              loading="lazy"
              width={1100}
              height={1400}
              className="h-56 w-full rounded-xl object-cover"
            />
          </div>
        </section>

        {/* Shipping */}
        <section
          id="shipping"
          className="scroll-mt-20 border-t border-border bg-gradient-warm text-primary-foreground"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <div className="max-w-2xl">
              <p className="eyebrow opacity-80">Shipping</p>
              <h2 className="mt-3 text-4xl">Domestic U.S. shipping, packed to travel</h2>
              <p className="mt-4 leading-relaxed opacity-90">
                Jars are sealed, wrapped and boxed for the trip. We ship anywhere in the
                United States — shipping is calculated at checkout. Orders go out within
                two to three business days.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
