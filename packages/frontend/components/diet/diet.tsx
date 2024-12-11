import { Diet as DietType } from "@/types";
import { WheatOff, MilkOff, LeafyGreen, Vegan } from "lucide-react";
import { ThemeIcon, MantineColor, Tooltip } from "@mantine/core";
import styles from "./diet.module.css";
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
      <ThemeIcon
        className={styles.icon}
        radius="xl"
        size="md"
        aria-label={diet.name}
        autoContrast
        color={color}
        variant="white"
      >
        <Icon />
      </ThemeIcon>
    </Tooltip>
  );
}
