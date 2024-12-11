import { Diet as DietType } from "@/types";
import { WheatOff, MilkOff, LeafyGreen, Vegan } from "lucide-react";
import { MantineColor, Tooltip, ActionIcon } from "@mantine/core";
import styles from "./diet.module.css";
import Link from "next/link";
interface DietProps {
  diet: DietType;
}

const icons: Record<
  DietType["name"],
  { Icon: React.ElementType; color: MantineColor }
> = {
  "Gluten Free": { Icon: WheatOff, color: "yellow" },
  "Dairy Free": { Icon: MilkOff, color: "indigo" },
  Vegetarian: { Icon: LeafyGreen, color: "green" },
  Vegan: { Icon: Vegan, color: "teal" },
};

export default function Diet({ diet }: DietProps) {
  const { Icon, color } = icons[diet.name];

  return (
    <Tooltip label={diet.name} position="bottom">
      <ActionIcon
        className={styles.icon}
        radius="xl"
        size="md"
        aria-label={diet.name}
        color={color}
        variant="subtle"
        component={Link}
        href={`/search?diet_ids=${diet.id}`}
      >
        <Icon />
      </ActionIcon>
    </Tooltip>
  );
}
