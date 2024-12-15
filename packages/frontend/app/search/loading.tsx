import { Flex, Skeleton } from "@mantine/core";
import { AppShell } from "./components";

function LoadingFilters() {
  return (
    <Flex gap="md" direction="column" mt="md">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton width="100%" height="50px" radius="md" animate key={i} />
      ))}
    </Flex>
  );
}

function LoadingPagination() {
  return (
    <Flex gap="sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton width="32px" height="32px" radius="md" animate key={i} />
      ))}
    </Flex>
  );
}

export default function SearchLoading() {
  return (
    <AppShell filters={<LoadingFilters />} pagination={<LoadingPagination />}>
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} width="250px" height="320px" radius="md" animate />
      ))}
    </AppShell>
  );
}
