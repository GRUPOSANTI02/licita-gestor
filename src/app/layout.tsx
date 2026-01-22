import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TenderProvider } from "@/context/TenderContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "LicitaGestor App",
    description: "Gestão inteligente de licitações",
    manifest: "/manifest.ts"
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className={`${inter.className} bg-slate-50 min-h-screen text-slate-900`}>
                <TenderProvider>
                    <div className="flex">
                        <Sidebar />
                        <main className="flex-1 md:ml-64 min-h-screen w-full">
                            {children}
                        </main>
                    </div>
                </TenderProvider>
            </body>
        </html>
    );
}
