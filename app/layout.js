import { Bricolage_Grotesque, Public_Sans, Geist_Mono } from "next/font/google";
import { SITE } from "@/content/site";
import { NO_FLASH_SCRIPT } from "@/lib/theme";
import StructuredData from "@/components/StructuredData";
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
  metadataBase: new URL("https://udokaam.dev"),
  alternates: { canonical: "/" },
  title: `${SITE.name} — ${SITE.role}`,
  description: SITE.intro,
  icons: {
    icon: [
      // SVG first: it is the only one that adapts to a dark tab bar.
      { url: "/udoka-mark.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon-180.png", sizes: "180x180" }],
  },
  openGraph: {
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.tagline,
    type: "profile",
    url: "https://udokaam.dev/",
    siteName: SITE.name,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SITE.name} — ${SITE.role}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.tagline,
    creator: "@Udoka_AM",
    images: ["/og.png"],
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
        <StructuredData />
      </head>
      <body>{children}</body>
    </html>
  );
}
