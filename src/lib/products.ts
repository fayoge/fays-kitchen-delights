import jarTop from "@/assets/jar-top.jpg.asset.json";
import jarsPair from "@/assets/jars-pair.jpg.asset.json";
import pepperSauceImg from "@/assets/pepper-sauce.jpg.asset.json";
import episeImg from "@/assets/epise.jpg.asset.json";

export interface ProductSize {
  /** Stripe price lookup id */
  priceId: string;
  label: string;
  amount: number;
}

export interface Product {
  handle: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  imageAlt: string;
  sizes: ProductSize[];
}

export const PRODUCTS: Product[] = [
  {
    handle: "traditional-pikliz",
    name: "Traditional Haitian Pikliz",
    tagline: "The classic, done properly",
    description:
      "Cabbage, carrots and onions cut thin, scotch bonnet for heat, and vinegar given time to do its work. The jar that belongs next to griot, fried plantain and rice.",
    image: jarTop.url,
    imageAlt: "Open jar of traditional Haitian pikliz in golden brine",
    sizes: [
      { priceId: "pikliz_traditional_8oz", label: "8 oz", amount: 9.6 },
      { priceId: "pikliz_traditional_16oz", label: "16 oz", amount: 18.4 },
      { priceId: "pikliz_traditional_32oz", label: "32 oz", amount: 30.4 },
    ],
  },
  {
    handle: "vinigratte",
    name: "Vinigratte (Family Recipe)",
    tagline: "Our twist — the family special",
    description:
      "Pickled onion and peppers of every color, spiced in a way nobody in the family has managed to write down. Brighter and rounder than traditional pikliz, good on everything.",
    image: jarsPair.url,
    imageAlt: "Two jars of Vinigratte pikliz on a marble counter",
    sizes: [
      { priceId: "vinigratte_8oz", label: "8 oz", amount: 9.6 },
      { priceId: "vinigratte_16oz", label: "16 oz", amount: 18.4 },
      { priceId: "vinigratte_32oz", label: "32 oz", amount: 30.4 },
    ],
  },
  {
    handle: "smoked-herring-pepper-sauce",
    name: "Smoked Herring Pepper Sauce",
    tagline: "Smoke and serious heat",
    description:
      "Smoked herring blended with hot peppers into a deep, savory sauce. A spoonful lifts rice, eggs, pasta or anything that needs waking up.",
    image: pepperSauceImg.url,
    imageAlt: "Jar of smoked herring pepper sauce",
    sizes: [
      { priceId: "pepper_sauce_8oz", label: "8 oz", amount: 14 },
      { priceId: "pepper_sauce_16oz", label: "16 oz", amount: 20 },
    ],
  },
  {
    handle: "haitian-epise",
    name: "Haitian Epise",
    tagline: "Where every Haitian dish starts",
    description:
      "Fresh green herbs, garlic, peppers and citrus blended into the seasoning base every Haitian kitchen keeps on hand. Marinate meat, start a stew, season rice.",
    image: episeImg.url,
    imageAlt: "Jar of fresh green Haitian epis seasoning",
    sizes: [
      { priceId: "epise_8oz", label: "8 oz", amount: 9.6 },
      { priceId: "epise_16oz", label: "16 oz", amount: 18.4 },
      { priceId: "epise_32oz", label: "32 oz", amount: 30.4 },
    ],
  },
];

export function getProduct(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}

export function getSize(priceId: string) {
  for (const product of PRODUCTS) {
    const size = product.sizes.find((s) => s.priceId === priceId);
    if (size) return { product, size };
  }
  return undefined;
}

export function formatMoney(amount: number, currency = "USD") {
  return amount.toLocaleString("en-US", { style: "currency", currency });
}
