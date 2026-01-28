"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, Calendar as CalendarIcon, Settings, User } from "lucide-react";

export function MobileTabbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-slate-900 border-t border-slate-800 md:hidden flex justify-around items-center px-4 z-50 rounded-t-3xl pb-2">

            <TabItem
                href="/"
                icon={<LayoutDashboard className="w-6 h-6" />}
                label="Hoje"
                active={pathname === "/"}
            />

            <TabItem
                href="/tenders"
                icon={<FileText className="w-6 h-6" />}
                label="Licitações"
                active={pathname.startsWith("/tenders")}
            />

            {/* MAIN ACTION BUTTON */}
            <div className="relative -top-5">
                <Link href="/tenders/new" className="bg-blue-600 hover:bg-blue-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 transition-transform active:scale-95 border-4 border-slate-900">
                    <PlusCircle className="w-8 h-8" />
                </Link>
            </div>

            <TabItem
                href="/atas"
                icon={<CalendarIcon className="w-6 h-6" />}
                label="Atas"
                active={pathname.startsWith("/atas")}
            />

            <TabItem
                href="/settings"
                icon={<User className="w-6 h-6" />}
                label="Burocracia"
                active={pathname.startsWith("/settings")}
            // Usando "Burocracia" como na referência ou algo similar
            />

        </nav>
    );
}

function TabItem({ href, icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
    return (
        <Link href={href} className={`flex flex-col items-center gap-1 transition-all ${active ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}>
            {icon}
            <span className="text-[10px] font-bold">{label}</span>
            {active && <span className="w-1 h-1 bg-blue-400 rounded-full" />}
        </Link>
    );
}
