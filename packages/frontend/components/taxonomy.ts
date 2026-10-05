import type { MantineColor } from "@mantine/core";
import type { CSSProperties } from "react";
import {
  Award,
  Cake,
  CakeSlice,
  Cookie,
  Croissant,
  Flower2,
  Gift,
  Heart,
  IceCreamBowl,
  LeafyGreen,
  MilkOff,
  Signature,
  Sparkles,
  Star,
  Timer,
  Vegan,
  Wheat,
  WheatOff,
  type LucideIcon,
} from "lucide-react";

export type PastelColor = "blush" | "mint" | "butter" | "duckegg" | "lilac" | "cocoa";

export interface TaxonomyStyle {
  icon: LucideIcon;
  color: PastelColor;
}

const fallbackStyle: TaxonomyStyle = { icon: CakeSlice, color: "mint" };

// Keyed by the diet names the API returns.
export const dietIcons: Record<string, { Icon: LucideIcon; color: MantineColor }> = {
  "Gluten Free": { Icon: WheatOff, color: "yellow" },
  "Dairy Free": { Icon: MilkOff, color: "indigo" },
  Vegetarian: { Icon: LeafyGreen, color: "green" },
  Vegan: { Icon: Vegan, color: "teal" },
};

// Keyed by the names the API returns.
const categoryStyles: Record<string, TaxonomyStyle> = {
  Signature: { icon: Signature, color: "butter" },
  Technical: { icon: Timer, color: "duckegg" },
  Showstopper: { icon: Sparkles, color: "blush" },
  Classic: { icon: Award, color: "lilac" },
  "Christmas & New Year": { icon: Gift, color: "mint" },
  "Love to Bake": { icon: Heart, color: "blush" },
  "Favourite Flavours": { icon: Star, color: "butter" },
  "A Bake for All Seasons": { icon: Flower2, color: "duckegg" },
};

const bakeTypeStyles: Record<string, TaxonomyStyle> = {
  Cakes: { icon: Cake, color: "blush" },
  Biscuits: { icon: Cookie, color: "butter" },
  Bread: { icon: Wheat, color: "cocoa" },
  Pastry: { icon: Croissant, color: "butter" },
  Patisserie: { icon: CakeSlice, color: "lilac" },
  "Puddings and Desserts": { icon: IceCreamBowl, color: "mint" },
};

export function getCategoryStyle(name: string): TaxonomyStyle {
  return categoryStyles[name] ?? fallbackStyle;
}

export function getBakeTypeStyle(name: string): TaxonomyStyle {
  return bakeTypeStyles[name] ?? fallbackStyle;
}

// Custom properties for pastel-tinted surfaces; ink on bg is ≥ 8:1 for every pastel.
export function pastelVars(color: PastelColor): CSSProperties {
  // CSSProperties does not declare custom properties, hence the cast.
  const vars = {
    "--pastel-bg": `var(--mantine-color-${color}-1)`,
    "--pastel-border": `var(--mantine-color-${color}-3)`,
    "--pastel-ink": `var(--mantine-color-${color}-9)`,
  } as CSSProperties;
  return vars;
}