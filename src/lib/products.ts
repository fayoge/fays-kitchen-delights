import jarTop from "@/assets/jar-top.jpg.asset.json";
import jarsPair from "@/assets/jars-pair.jpg.asset.json";
import pepperSauce from "@/assets/pepper-sauce.jpg.asset.json";
import epise from "@/assets/epise.jpg.asset.json";

export type SizeOption = {
  id: string;
  label: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  creole: string;
  tagline: string;
  description: string;
  heat: 1 | 2 | 3;
  image: string;
  sizes: SizeOption[];
};

const SIZES: SizeOption[] = [
  { id: "8oz", label: "8 oz jar", price: 14 },
  { id: "16oz", label: "16 oz jar", price: 20 },
];

export const products: Product[] = [
  {
    id: "traditional-pikliz",
    name: "Traditional Pikliz",
    creole: "Pikliz Tradisyonèl",
    tagline: "The one every Haitian table knows",
    description:
      "Crisp cabbage, carrot, onion and scotch bonnet cured slow in vinegar until it snaps. Bright, fiery and clean — the classic, made the way Fay's family has always made it.",
    heat: 3,
    image: jarTop.url,
    sizes: SIZES,
  },
  {
    id: "vinigratte",
    name: "Vinigratte",
    creole: "Fanmi Espesyal",
    tagline: "The family special — pikliz with a twist",
    description:
      "Ribbons of pickled onion and sweet peppers in every color, steeped in a warm spiced brine. Softer than traditional pikliz, deeper in flavor, and honestly hard to explain until you taste it.",
    heat: 2,
    image: jarsPair.url,
    sizes: SIZES,
  },
  {
    id: "smoked-herring-pepper-sauce",
    name: "Smoked Herring Pepper Sauce",
    creole: "Sòs Piman ak Aransò",
    tagline: "Smoke, salt and serious heat",
    description:
      "Smoked herring slow-blended with scotch bonnets, garlic and citrus. Savory and smoky up front, a long clean burn behind it. Spoon it over rice, fried plantain, eggs or fish.",
    heat: 3,
    image: pepperSauce.url,
    sizes: SIZES,
  },
  {
    id: "haitian-epise",
    name: "Haitian Epise",
    creole: "Epis",
    tagline: "The green base every Haitian dish starts with",
    description:
      "Parsley, scallion, thyme, garlic, bell pepper and citrus, ground fresh into the seasoning base that carries Haitian cooking. Marinate meat, start a pot of rice, wake up anything.",
    heat: 1,
    image: epise.url,
    sizes: SIZES,
  },
];

export const findProduct = (id: string) => products.find((p) => p.id === id);

export const formatPrice = (cents: number) =>
  cents.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const SHIPPING_FLAT = 9.5;
export const FREE_SHIPPING_THRESHOLD = 75;
