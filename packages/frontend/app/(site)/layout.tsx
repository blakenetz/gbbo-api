import SiteShell from "@/components/siteShell/siteShell";

// Pages in this group share the sidebar navigation.
export default function SiteLayout({ children }: React.PropsWithChildren) {
  return <SiteShell>{children}</SiteShell>;
}
