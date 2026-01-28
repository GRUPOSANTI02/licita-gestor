"use client";

import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabbar } from "@/components/layout/MobileTabbar";
import { usePathname } from "next/navigation";

export default function AppContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();

    // Se estiver carregando, mostra um estado de splash simples
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Se for a página de login, mostra apenas o conteúdo (sem barras)
    if (pathname === "/login") {
        return <>{children}</>;
    }

    // Se não estiver autenticado (segurança extra se o push do context demorar)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex pb-20 lg:pb-0">
            <Sidebar />
            <main className="flex-1 ml-0 lg:ml-64 min-h-screen w-full overflow-x-hidden">
                {children}
            </main>
            <MobileTabbar />
        </div>
    );
}
