import { Skeleton } from "@mantine/core";
import ResultsSkeleton from "./components/resultsSkeleton";
import styles from "./components/search.module.css";

// Shown while the search page's URL-driven content loads.
export default function SearchLoading() {
  return (
    <div className={styles.page}>
      <Skeleton height={260} radius="xl" />
      <ResultsSkeleton />
    </div>
  );
}
