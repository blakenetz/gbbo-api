import { Diet as DietType } from "@/types";
import { WheatOff, MilkOff, LeafyGreen, Vegan } from "lucide-react";
import {
  MantineColor,
  Tooltip,
  ActionIcon,
  ActionIconProps,
  createPolymorphicComponent,
} from "@mantine/core";
import styles from "./diet.module.css";
import Link from "next/link";
interface DietProps {
  diet: DietType;
}

interface DietIconProps extends DietProps, ActionIconProps {}

const icons: Record<
  DietType["name"],
  { Icon: React.ElementType; color: MantineColor }
> = {
  "Gluten Free": { Icon: WheatOff, color: "yellow" },
  "Dairy Free": { Icon: MilkOff, color: "indigo" },
  Vegetarian: { Icon: LeafyGreen, color: "green" },
  Vegan: { Icon: Vegan, color: "teal" },
};

export const DietIcon = createPolymorphicComponent<"button", DietIconProps>(
  ({ diet, ...props }: DietIconProps) => {
    const { Icon, color } = icons[diet.name];
    return (
      <ActionIcon
        className={styles.icon}
        radius="xl"
        size="md"
        aria-label={diet.name}
        color={color}
        variant="subtle"
        {...props}
      >
        <Icon />
      </ActionIcon>
    );
  }
);

export default function Diet({ diet }: DietIconProps) {
  return (
    <Tooltip label={diet.name} position="bottom">
      <DietIcon
        diet={diet}
        component={Link}
        href={`/search?diet_ids=${diet.id}`}
      />
    </Tooltip>
  );
}
