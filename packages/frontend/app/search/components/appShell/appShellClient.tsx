"use client";

import { ActionIcon, CloseButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { SlidersHorizontal } from "lucide-react";
import { Filters, FiltersProps, Pagination, PaginationProps } from "../index";
import AppShell from "./appShell";

interface AppShellClientProps {
  paginationProps: PaginationProps;
  filterProps: FiltersProps;
}

export default function AppShellClient({
  children,
  paginationProps,
  filterProps,
}: React.PropsWithChildren<AppShellClientProps>) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      navbarConfig={{ collapsed: { mobile: !opened } }}
      slots={{
        header: (
          <>
            <ActionIcon onClick={toggle} hiddenFrom="md">
              <SlidersHorizontal />
            </ActionIcon>
            <Pagination {...paginationProps} visibleFrom="md" />
          </>
        ),
        navbarTitle: <CloseButton onClick={toggle} hiddenFrom="md" />,
        navbarBody: <Filters {...filterProps} />,
        footer: <Pagination {...paginationProps} />,
      }}
    >
      {children}
    </AppShell>
  );
}
