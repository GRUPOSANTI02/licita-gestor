"use client";

import { CalendarWidget } from "@/components/features/CalendarWidget";

export default function CalendarPage() {
    return (
        <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Calendário de Prazos</h1>
                <p className="text-slate-500">Visualize todas as datas importantes em um só lugar</p>
            </div>

            <div className="flex-1 min-h-[600px]">
                <CalendarWidget />
            </div>
        </div>
    );
}
