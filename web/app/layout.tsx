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
        <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
