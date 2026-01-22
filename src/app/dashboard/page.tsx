"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.push("/");
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Redirecionando para o Dashboard...</p>
            </div>
        </div>
    );
}
