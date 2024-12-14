import { Skeleton } from "@mantine/core";
import { AppShell } from "./components";

function LoadingFilters() {
  return <Skeleton width="250px" height="320px" radius="md" animate />;
}

function LoadingPagination() {
  return <Skeleton width="250px" height="320px" radius="md" animate />;
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
