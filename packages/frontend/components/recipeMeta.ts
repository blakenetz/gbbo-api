import type { MantineColor } from "@mantine/core";
import { Cake, CakeSlice, Croissant, type LucideIcon } from "lucide-react";

// Indexed by the API's 1-based difficulty minus one.
export const difficulties: { icon: LucideIcon; label: string; color: MantineColor }[] = [
  { icon: CakeSlice, label: "Easy", color: "green.9" },
  { icon: Cake, label: "Medium", color: "yellow.9" },
  { icon: Croissant, label: "Hard", color: "red.9" },
];

// e.g. 45 → "45 minutes", 120 → "2 hours", 135 → "2 hours and 15 minutes"
export function formatTime(minutes: number | null) {
  if (minutes === null) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins} minutes`;
  if (!mins) return `${hours} hours`;
  return `${hours} hours and ${mins} minutes`;
}
