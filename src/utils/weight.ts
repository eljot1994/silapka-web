export const KG_TO_LB = 2.20462;

export function kgToLb(kg: number): number {
  return parseFloat((kg * KG_TO_LB).toFixed(2));
}

export function lbToKg(lb: number): number {
  return parseFloat((lb / KG_TO_LB).toFixed(2));
}

export function formatWeight(weight: number | null, unit: "kg" | "lb"): string {
  if (weight === null) return "0";
  return unit === "kg" ? weight.toString() : kgToLb(weight).toString();
}

export function parseWeight(value: string, unit: "kg" | "lb"): number | null {
  const num = Number(value);
  if (isNaN(num)) return null;
  return unit === "kg" ? num : lbToKg(num);
}
