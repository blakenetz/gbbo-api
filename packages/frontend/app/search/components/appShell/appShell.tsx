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
  AppShellFooterConfiguration,
  AppShellFooter,
} from "@mantine/core";
import { ChefHat } from "lucide-react";
import Link from "next/link";
import styles from "./appShell.module.css";

export interface AppShellProps extends Omit<MantineAppShellProps, "navbar"> {
  slots?: {
    navbarTitle?: React.ReactNode;
    navbarBody?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
  };
  navbarConfig?: Partial<AppShellNavbarConfiguration>;
  footerConfig?: Partial<AppShellFooterConfiguration>;
}

export default function AppShell({
  children,
  slots = {},
  navbarConfig,
  footerConfig,
  ...props
}: React.PropsWithChildren<AppShellProps>) {
  return (
    <MantineAppShell
      {...props}
      layout="alt"
      header={{ height: 60, ...props.header }}
      navbar={{ width: 300, breakpoint: "md", ...navbarConfig }}
      footer={{ height: 60, ...footerConfig }}
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
          {slots.header}
        </Flex>
      </AppShellHeader>

      <AppShellNavbar p="md" component="aside" className={styles.navbar}>
        <Group justify="space-between" gap="xs">
          <Title order={4} component="p">
            Filter by
          </Title>
          {slots.navbarTitle}
        </Group>
        {slots.navbarBody}
      </AppShellNavbar>

      <AppShellMain>
        <SimpleGrid
          cols={{ xs: 2, sm: 3, md: 4 }}
          spacing="xs"
          p={{ base: 0, xs: "xs" }}
        >
          {children}
        </SimpleGrid>
      </AppShellMain>

      <AppShellFooter hiddenFrom="md">
        <div className={styles.footer}>{slots.footer}</div>
      </AppShellFooter>
    </MantineAppShell>
  );
}
