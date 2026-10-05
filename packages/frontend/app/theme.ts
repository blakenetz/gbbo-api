import {
  Badge,
  Button,
  Card,
  createTheme,
  NavLink,
  TextInput,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from "@mantine/core";

// Pastel ramps generated in OKLCH from the tent palette: shade 0 is lightest,
// shade 9 darkest. Shades 7+ are dark enough for text on the light shades.
const blush: MantineColorsTuple = ["#fef3f9", "#fee4f3", "#fad0e8", "#edb8d7", "#d9a0c2", "#c189aa", "#a4718f", "#855973", "#674258", "#4b2d3f"];
const mint: MantineColorsTuple = ["#e9fcf7", "#d3f6ee", "#b5ebdf", "#94dbcc", "#76c6b6", "#5eae9f", "#479385", "#34766a", "#225b51", "#0f4139"];
const butter: MantineColorsTuple = ["#fef7dd", "#fbedbe", "#f3dd92", "#e6c963", "#d2b238", "#ba9a10", "#9c8103", "#7d6700", "#604e03", "#443701"];
const duckegg: MantineColorsTuple = ["#edf9ff", "#d8f2fd", "#bee5f7", "#a0d3ea", "#85bed7", "#6ea6be", "#578ba2", "#437083", "#2f5666", "#1c3d4a"];
const lilac: MantineColorsTuple = ["#f8f5fe", "#f0e9fe", "#e3d6fe", "#d2bff7", "#bda8e4", "#a591cc", "#8b78ae", "#705f8e", "#55476f", "#3d3151"];
const cocoa: MantineColorsTuple = ["#fef5f0", "#ffe7dd", "#ffd3c0", "#f3bda4", "#dfa58a", "#c78e74", "#a9755d", "#8a5d48", "#6b4534", "#4e2f21"];

export const theme = createTheme({
  colors: { blush, mint, butter, duckegg, lilac, cocoa },
  primaryColor: "mint",
  // White text on mint.7 is 5.3:1, above WCAG AA.
  primaryShade: 7,
  black: cocoa[9],
  fontFamily: "var(--font-body), system-ui, sans-serif",
  headings: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontWeight: "700",
  },
  defaultRadius: "lg",
  cursorType: "pointer",
  components: {
    Badge: Badge.extend({ defaultProps: { radius: "xl" } }),
    Button: Button.extend({ defaultProps: { radius: "xl" } }),
    Card: Card.extend({ defaultProps: { radius: "lg" } }),
    NavLink: NavLink.extend({ defaultProps: { color: "blush" } }),
    TextInput: TextInput.extend({ defaultProps: { radius: "xl" } }),
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-body": "#fdf8f1",
    // cocoa.7 on the cream body is 5.2:1, so muted text stays readable.
    "--mantine-color-dimmed": cocoa[7],
    "--mantine-color-placeholder": cocoa[7],
    "--mantine-color-anchor": mint[8],
    "--mantine-color-default-border": cocoa[2],
  },
  dark: {},
});
