import type { Metadata } from "next";
import {
  Inter,
  Archivo_Black,
  Space_Grotesk,
  Playfair_Display,
  JetBrains_Mono,
  Oswald,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

// Display faces for the template renderer, exposed as CSS variables so a
// template can reference a font token without knowing the family name.
const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--tpl-display" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--tpl-grotesk" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--tpl-serif" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--tpl-mono" });
const oswald = Oswald({ subsets: ["latin"], variable: "--tpl-condensed" });

const templateFonts = [
  archivoBlack.variable,
  spaceGrotesk.variable,
  playfair.variable,
  jetbrainsMono.variable,
  oswald.variable,
].join(" ");

export const metadata: Metadata = {
  title: "Segue IT Marketing Studio",
  description: "Create professional marketing content with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${templateFonts}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
