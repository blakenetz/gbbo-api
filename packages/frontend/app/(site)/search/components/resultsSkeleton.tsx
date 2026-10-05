import { SimpleGrid, Skeleton } from "@mantine/core";

export const RESULTS_COLUMNS = { base: 1, xs: 2, lg: 3, xl: 4 };

export default function ResultsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <SimpleGrid cols={RESULTS_COLUMNS} spacing="lg">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} height={340} radius="lg" />
      ))}
    </SimpleGrid>
  );
}
