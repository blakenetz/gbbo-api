import { Flex, Skeleton } from "@mantine/core";
import { AppShell } from "./components";

function NavbarLoader() {
  return (
    <Flex gap="md" direction="column" mt="md">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton width="100%" height="50px" radius="md" animate key={i} />
      ))}
    </Flex>
  );
}

function HeaderLoader() {
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
    <AppShell
      slots={{
        navbarBody: <NavbarLoader />,
        header: <HeaderLoader />,
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} width="200px" height="320px" radius="md" animate />
      ))}
    </AppShell>
  );
}
