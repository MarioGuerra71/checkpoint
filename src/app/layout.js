import { Bebas_Neue, DM_Sans } from "next/font/google";
import { Toaster } from "sileo";
import "./globals.css";
import AuroraBackground from "@/components/AuroraBackground";

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body
        style={{ fontFamily: "var(--font-body), sans-serif" }}
        className="min-h-screen"
        suppressHydrationWarning
      >
        <AuroraBackground />
        <div className="relative z-10 min-h-screen">{children}</div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "CHECKPOINT",
  description: "Tu diario de videojuegos",
};
