import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIdmin",
  description: "Panel de gestion de AIdmin para pymes",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html lang="es" className="h-full antialiased">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router: no _document.js, next/font's build-time self-hosting isn't viable here (blocked outbound font fetch in this dev sandbox) */}
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          />
        </head>
        <body className="min-h-full flex flex-col bg-[var(--color-surface-sunken)] text-[var(--color-ink)] font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
