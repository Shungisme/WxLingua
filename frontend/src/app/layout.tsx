import type { Metadata } from "next";
import { Inter, Press_Start_2P, Pixelify_Sans } from "next/font/google";
import "nes.css/css/nes.min.css";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

const pixelifySans = Pixelify_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-pixelify",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WxLingua — Language Flashcards",
    template: "%s · WxLingua",
  },
  description:
    "Master languages with radical decomposition and spaced repetition.",
  metadataBase: new URL("https://wxlingua.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${pressStart.variable} ${pixelifySans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent dark mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t!=='light'){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
