"use client";

import { useDisclosure } from "@mantine/hooks";
import AppShell from "./appShell";
import { Filters, FiltersProps } from "../index";
import { CloseButton } from "@mantine/core";
import { Pagination, PaginationProps } from "../index";

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
      navbarChildren={{
        title: <CloseButton onClick={toggle} />,
        body: <Filters {...filterProps} />,
      }}
      headerChildren={<Pagination {...paginationProps} />}
    >
      {children}
    </AppShell>
  );
}
