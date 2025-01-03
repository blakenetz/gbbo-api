import type { Metadata } from "next";
import {
  ColorSchemeScript,
  createTheme,
  Flex,
  MantineProvider,
} from "@mantine/core";
import "@mantine/core/styles.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "GBBO Search",
  description: "A new way to search for Great British Bake Off recipes",
};

const theme = createTheme({
  primaryColor: "violet",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Flex
            className={styles.root}
            component="section"
            justify="center"
            align="flex-start"
          >
            {children}
          </Flex>
        </MantineProvider>
      </body>
    </html>
  );
}
