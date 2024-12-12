import { Filters } from "@/components";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Burger,
  Group,
  Title,
} from "@mantine/core";
import { ChefHat } from "lucide-react";

export default function SearchLayout({ children }: React.PropsWithChildren) {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: false } }}
      padding="md"
    >
      <AppShellHeader>
        <Group h="100%" px="md">
          <Burger opened={false} hiddenFrom="sm" size="sm" />
          <ChefHat />
          <Title order={4} component="h1">
            GBBO Recipes
          </Title>
        </Group>
      </AppShellHeader>
      <AppShellNavbar p="md" component="aside">
        <Filters />
      </AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
