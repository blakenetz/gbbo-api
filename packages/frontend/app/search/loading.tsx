import { Skeleton } from "@mantine/core";

export default function SearchLoading() {
  return Array.from({ length: 9 }).map((_, i) => (
    <Skeleton key={i} width="250px" height="320px" radius="md" animate />
  ));
}
