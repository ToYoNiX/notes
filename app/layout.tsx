import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell, ThemeScript } from "@toyonix/web-kit/react";
import { withBasePath } from "@toyonix/web-kit";
import { getRegistrySnapshot } from "@toyonix/web-kit/registry";
import { site } from "@/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${site.title} · toyonix`, template: `%s · ${site.title} · toyonix` },
  description: site.description,
  alternates: {
    types: { "application/rss+xml": [{ url: withBasePath("/feed.xml"), title: `${site.title} · toyonix` }] },
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Fetched once at build time so the shared nav is in the static HTML.
  const registry = await getRegistrySnapshot();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AppShell registry={registry} appTitle={site.title}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
