import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDZD(amount: number) {
  return new Intl.NumberFormat("fr-DZ").format(amount) + " DA";
}

