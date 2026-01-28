import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TenderProvider } from "@/context/TenderContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "LicitaGestor App",
    description: "Gestão inteligente de licitações",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "LicitaGestor",
    },
};

export const viewport = {
    themeColor: "#2563eb",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

import { AuthProvider } from "@/context/AuthContext";
import AppContent from "@/components/layout/AppContent";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className={`${inter.className} bg-slate-50 min-h-screen text-slate-900`}>
                <AuthProvider>
                    <TenderProvider>
                        <AppContent>
                            {children}
                        </AppContent>
                    </TenderProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
