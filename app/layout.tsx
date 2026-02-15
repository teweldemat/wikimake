import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, Spectral } from "next/font/google";
import "./globals.css";

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Wikimake",
  description:
    "A self-contained wiki for rebuilding technology from nothing to modern industry.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spectral.variable} ${spaceGrotesk.variable}`}>
      <body>
        <header className="siteHeader">
          <div className="wrap siteHeaderInner">
            <Link href="/" className="brand">
              <span className="brandMark" aria-hidden="true" />
              Wikimake
            </Link>
            <nav className="nav" aria-label="Primary">
              <Link href="/">Home</Link>
              <Link href="/articles">Articles</Link>
              <Link href="/tasks">Tasks</Link>
              <Link href="/talk">Talk</Link>
            </nav>
          </div>
        </header>
        <main className="wrap main">{children}</main>
        <footer className="footer">
          <div className="wrap">
            Self-contained by default. Every tool, material, and process must be
            documented in-repo.
          </div>
        </footer>
      </body>
    </html>
  );
}
