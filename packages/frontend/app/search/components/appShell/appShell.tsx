import {
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Flex,
  Group,
  AppShell as MantineAppShell,
  AppShellProps as MantineAppShellProps,
  SimpleGrid,
  Title,
  ActionIcon,
  AppShellNavbarConfiguration,
} from "@mantine/core";
import { ChefHat } from "lucide-react";
import Link from "next/link";
import styles from "./appShell.module.css";

export interface AppShellProps extends Omit<MantineAppShellProps, "navbar"> {
  navbarChildren: {
    title?: React.ReactNode;
    body: React.ReactNode;
  };
  headerChildren: React.ReactNode;
  navbarConfig?: Partial<AppShellNavbarConfiguration>;
}

export default function AppShell({
  children,
  navbarChildren,
  headerChildren,
  navbarConfig,
  ...props
}: React.PropsWithChildren<AppShellProps>) {
  return (
    <MantineAppShell
      {...props}
      layout="alt"
      header={{ height: 60, ...props.header }}
      navbar={{ width: 300, breakpoint: "sm", ...navbarConfig }}
      padding="md"
    >
      <AppShellHeader>
        <Flex h="100%" px="md" justify="space-between" align="center">
          <Group>
            <ActionIcon
              component={Link}
              href="/"
              variant="subtle"
              radius="xl"
              size="lg"
            >
              <ChefHat />
            </ActionIcon>
            <Title order={4} component="h1">
              GBBO Recipes
            </Title>
          </Group>
          {headerChildren}
        </Flex>
      </AppShellHeader>

      <AppShellNavbar p="md" component="aside" className={styles.navbar}>
        <Group justify="space-between" gap="xs">
          <Title order={4} component="p">
            Filter by
          </Title>
          {navbarChildren.title}
        </Group>
        {navbarChildren.body}
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
