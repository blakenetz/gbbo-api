import {
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Flex,
  Group,
  AppShell as MantineAppShell,
  SimpleGrid,
  Title,
} from "@mantine/core";
import { ChefHat } from "lucide-react";
import styles from "./appShell.module.css";

interface AppShellProps {
  filters: React.ReactNode;
  pagination: React.ReactNode;
}

export default function AppShell({
  children,
  filters,
  pagination,
}: React.PropsWithChildren<AppShellProps>) {
  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: false } }}
      padding="md"
    >
      <AppShellHeader>
        <Flex h="100%" px="md" justify="space-between" align="center">
          <Group>
            <ChefHat />
            <Title order={4} component="h1">
              GBBO Recipes
            </Title>
          </Group>
          {pagination}
        </Flex>
      </AppShellHeader>

      <AppShellNavbar p="md" component="aside" className={styles.navbar}>
        <Title order={4} component="p">
          Filter by
        </Title>
        {filters}
      </AppShellNavbar>

      <AppShellMain>
        <SimpleGrid
          cols={{ xs: 2, sm: 2, md: 3, xl: 4 }}
          spacing="xs"
          p={{ base: 0, xs: "xs" }}
        >
          {children}
        </SimpleGrid>
      </AppShellMain>
    </MantineAppShell>
  );
}
