import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { AnnouncementBar } from "@/components/home/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "EdilMatch", template: "%s | EdilMatch" },
  description: "Marketplace italiano per professionisti e lavori edili.",
  openGraph: {
    title: "EdilMatch",
    description: "Trova professionisti edili qualificati o ricevi richieste nella tua zona.",
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EdilMatch",
    description: "Trova professionisti edili qualificati o ricevi richieste nella tua zona.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  let userName = "";
  let userRole: "cliente" | "professionista" | undefined;
  let unreadMessages = 0;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
    userName = profile?.full_name || user.email?.split("@")[0] || "utente";
    userRole = profile?.role ?? undefined;
    const { count, error: unreadError } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("read", false);
    if (!unreadError) {
      unreadMessages = count ?? 0;
    }
  }

  return (
    <html lang="it" className={`${sora.variable} ${dmSans.variable} ${jetBrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)]">
        <AnnouncementBar />
        <Navbar isLoggedIn={!!user} userName={userName} userRole={userRole} unreadMessages={unreadMessages} />
        {children}
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
