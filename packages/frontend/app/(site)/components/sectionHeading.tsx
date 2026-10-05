import { Text, Title } from "@mantine/core";
import styles from "./home.module.css";

interface SectionHeadingProps {
  id: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function SectionHeading({ id, title, description, action }: SectionHeadingProps) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        <Title id={id} order={2} className={styles.sectionTitle}>
          {title}
        </Title>
        <Text c="dimmed">{description}</Text>
      </div>
      {action}
    </div>
  );
}
