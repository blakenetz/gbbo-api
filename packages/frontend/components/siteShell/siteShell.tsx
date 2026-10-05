"use client";

import { Affix, AppShell, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Sidebar from "./sidebar";
import styles from "./siteShell.module.css";

const NAVBAR_ID = "site-navigation";

export default function SiteShell({ children }: React.PropsWithChildren) {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      navbar={{ width: 288, breakpoint: "sm", collapsed: { mobile: !opened } }}
    >
      <Affix position={{ top: 14, left: 14 }} hiddenFrom="sm">
        <Burger
          opened={opened}
          onClick={toggle}
          aria-label={opened ? "Close navigation" : "Open navigation"}
          aria-expanded={opened}
          aria-controls={NAVBAR_ID}
          className={styles.burger}
        />
      </Affix>

      <AppShell.Navbar
        id={NAVBAR_ID}
        component="nav"
        aria-label="Site"
        className={styles.navbar}
      >
        <Sidebar onNavigate={close} />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
