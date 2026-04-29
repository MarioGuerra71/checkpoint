import { Bebas_Neue, DM_Sans } from "next/font/google";
import { Toaster } from "sileo";
import "./globals.css";
import AuroraBackground from "@/components/AuroraBackground";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const bebasNeue = Bebas_Neue({
  weight: "400", subsets: ["latin"],
  variable: "--font-display", display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body", display: "swap",
});

export const metadata = {
  title: "CHECKPOINT",
  description: "Tu diario de videojuegos",
};

async function getTema() {
  try {
    const cookieStore = await cookies();
    const authToken   = cookieStore.get("auth_token")?.value;
    if (!authToken) return "oscuro";

    const id_usuario = parseInt(authToken);
    if (isNaN(id_usuario)) return "oscuro";

    const [prefs] = await db.query(
      "SELECT tema FROM preferencias_usuario WHERE id_usuario = ?",
      [id_usuario]
    );
    return prefs[0]?.tema || "oscuro";
  } catch {
    return "oscuro";
  }
}

export default async function RootLayout({ children }) {
  const tema = await getTema();

  const bgColor = tema === "claro" ? "#f0f8fa" : "#22434c";
  const fgColor = tema === "claro" ? "#0e2a31" : "#00e3f6";

  return (
    <html
      lang="es"
      className={`${bebasNeue.variable} ${dmSans.variable}`}
      style={{
        "--background": bgColor,
        "--foreground": fgColor,
      }}
    >
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