export const CARRIERS = [
  { value: "usps", label: "USPS", track: (n: string) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}` },
  { value: "ups", label: "UPS", track: (n: string) => `https://www.ups.com/track?tracknum=${n}` },
  { value: "fedex", label: "FedEx", track: (n: string) => `https://www.fedex.com/fedextrack/?trknbr=${n}` },
  { value: "dhl", label: "DHL", track: (n: string) => `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}` },
  { value: "ontrac", label: "OnTrac", track: (n: string) => `https://www.ontrac.com/tracking/?number=${n}` },
  { value: "lso", label: "LSO", track: (n: string) => `https://www.lso.com/tracking?number=${n}` },
  { value: "amazon", label: "Amazon Shipping", track: (n: string) => `https://track.amazon.com/tracking/${n}` },
] as const;

export type CarrierValue = (typeof CARRIERS)[number]["value"];

export const CARRIER_VALUES = CARRIERS.map((c) => c.value) as readonly string[];

export function carrierLabel(value: string | null | undefined) {
  return CARRIERS.find((c) => c.value === value)?.label ?? value ?? "—";
}

export function trackingUrl(carrier: string | null | undefined, number: string | null | undefined) {
  if (!carrier || !number) return null;
  const found = CARRIERS.find((c) => c.value === carrier);
  return found ? found.track(encodeURIComponent(number)) : null;
}
