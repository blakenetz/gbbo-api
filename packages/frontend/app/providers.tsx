"use client";

import { MantineProvider } from "@mantine/core";
import { cssVariablesResolver, theme } from "./theme";

// The CSS variables resolver is a function, so the provider is set up on the
// client rather than in the root (server) layout.
export default function Providers({ children }: React.PropsWithChildren) {
  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="light"
    >
      {children}
    </MantineProvider>
  );
}
