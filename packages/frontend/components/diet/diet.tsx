import { Diet as DietType } from "@/types";
import {
  Tooltip,
  ActionIcon,
  ActionIconProps,
  createPolymorphicComponent,
} from "@mantine/core";
import { dietIcons } from "../taxonomy";
import styles from "./diet.module.css";
import Link from "next/link";
interface DietProps {
  diet: DietType;
}

interface DietIconProps extends DietProps, ActionIconProps {}

export const DietIcon = createPolymorphicComponent<"button", DietIconProps>(
  ({ diet, ...props }: DietIconProps) => {
    const { Icon, color } = dietIcons[diet.name];
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
  },
);

export default function Diet({ diet }: DietIconProps) {
  return (
    <Tooltip label={diet.name} position="bottom">
      <Link href={`/search?diet_ids=${diet.id}`}>
        <DietIcon diet={diet} />
      </Link>
    </Tooltip>
  );
}
