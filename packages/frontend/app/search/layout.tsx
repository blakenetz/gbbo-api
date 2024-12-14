import { Filters } from "@/components";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Flex,
  Group,
  SimpleGrid,
  Title,
} from "@mantine/core";
import { ChefHat } from "lucide-react";
import styles from "./layout.module.css";
import { Pagination } from "@/components";

export default function SearchLayout({ children }: React.PropsWithChildren) {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: false } }}
      padding="md"
    >
      <AppShellHeader>
        <Flex h="100%" px="md">
          <Group>
            <ChefHat />
            <Title order={4} component="h1">
              GBBO Recipes
            </Title>
          </Group>
          <Pagination />
        </Flex>
      </AppShellHeader>

      <AppShellNavbar p="md" component="aside" className={styles.navbar}>
        <Filters />
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
    </AppShell>
  );
}
