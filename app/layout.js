import { Bricolage_Grotesque, Public_Sans, Geist_Mono } from "next/font/google";
import { SITE } from "@/content/site";
import { NO_FLASH_SCRIPT } from "@/lib/theme";
import "./globals.css";

// next/font self-hosts these at build time: no render-blocking request to
// Google, no layout shift, and the CSS variables land on <html>.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: `${SITE.name} — ${SITE.role}`,
  description: SITE.intro,
  openGraph: {
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.tagline,
    type: "profile",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets data-theme before first paint so the palette never flashes. */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
