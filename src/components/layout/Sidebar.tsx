"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    LicitaGestor
                </h1>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">Gestão Inteligente</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavItem href="/" icon={<LayoutDashboard />} label="Dashboard" active={pathname === "/"} />
                <NavItem href="/tenders" icon={<FileText />} label="Licitações" active={pathname.startsWith("/tenders")} />
                <NavItem href="/atas" icon={<FileText className="text-amber-400" />} label="Gestão de Atas" active={pathname.startsWith("/atas")} />
                <NavItem href="/reports" icon={<FileText className="opacity-50" />} label="Relatórios" active={pathname.startsWith("/reports")} />
                <NavItem href="/settings" icon={<Settings />} label="Configurações" active={pathname.startsWith("/settings")} />
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 text-slate-400 hover:text-white w-full px-4 py-2 transition-colors group"
                >
                    <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                    <span className="font-black text-xs uppercase tracking-widest group-hover:text-red-400">Sair do Sistema</span>
                </button>
            </div>
        </aside>
    );
}

function NavItem({ href, icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
    return (
        <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}>
            {icon}
            <span className="font-black text-xs uppercase tracking-widest outline-none">{label}</span>
        </Link>
    );
}
