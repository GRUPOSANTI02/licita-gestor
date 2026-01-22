"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useTenders } from "@/context/TenderContext";
import { formatCurrency } from "@/lib/utils";

export function CalendarWidget() {
    const { tenders } = useTenders();
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const getTendersForDay = (day: number) => {
        return tenders.filter(t => {
            const tDate = new Date(t.deadline);
            return tDate.getDate() === day &&
                tDate.getMonth() === currentDate.getMonth() &&
                tDate.getFullYear() === currentDate.getFullYear();
        });
    };

    return (
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl p-8 overflow-hidden">
            {/* Header da Agenda com mais contraste */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 capitalize leading-none tracking-tight">{monthName}</h2>
                        <p className="text-[11px] text-slate-400 mt-1.5 uppercase tracking-widest font-black">Sua Agenda de Licitações</p>
                    </div>
                </div>
                <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                        className="p-3 hover:bg-white hover:shadow-md rounded-xl text-slate-600 transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-xs transition-all hover:bg-blue-700 shadow-lg shadow-blue-200 uppercase tracking-widest"
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                        className="p-3 hover:bg-white hover:shadow-md rounded-xl text-slate-600 transition-all active:scale-95"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Dias da Semana - Fontes Maiores */}
            <div className="grid grid-cols-7 mb-4 bg-slate-50/50 rounded-xl p-3 border border-slate-50">
                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((day, idx) => (
                    <div key={idx} className="text-center text-[10px] sm:text-[11px] font-black text-slate-400 tracking-[0.2em]">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid de Dias - Células MAIORES */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[120px] sm:min-h-[140px] bg-slate-50/10 rounded-2xl border border-transparent" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayTenders = getTendersForDay(day);
                    const hasTender = dayTenders.length > 0;
                    const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

                    return (
                        <div
                            key={day}
                            className={`
                                min-h-[120px] sm:min-h-[140px] relative flex flex-col p-3 rounded-2xl transition-all border-2
                                ${isToday ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 bg-white hover:border-slate-200 hover:shadow-md'}
                                ${hasTender && !isToday ? 'bg-slate-50 border-slate-100' : ''}
                            `}
                        >
                            <span className={`
                                text-base font-black mb-2 
                                ${isToday ? 'bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-xl shadow-lg -mt-4 -ml-4 z-10' : 'text-slate-900'}
                            `}>
                                {day}
                            </span>

                            <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar-agenda pr-0.5">
                                {dayTenders.map((t, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/tenders/${t.id}/edit`}
                                        className={`
                                            block text-[10px] sm:text-[11px] px-2.5 py-1.5 rounded-xl border leading-tight font-black uppercase tracking-tight shadow-sm
                                            cursor-pointer transition-all hover:scale-[1.02] active:scale-95 hover:shadow-md
                                            ${t.status === 'won' ? 'bg-green-600 border-green-600 text-white' :
                                                t.status === 'lost' ? 'bg-red-600 border-red-600 text-white' :
                                                    'bg-blue-500 border-blue-500 text-white'}
                                        `}
                                    >
                                        <div className="line-clamp-2">
                                            {t.city && <span className="opacity-80">{t.city.toUpperCase()} - </span>}
                                            {t.title}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 text-[8px] opacity-90 font-bold border-t border-white/20 pt-1">
                                            {t.tenderNumber && <span>NR: {t.tenderNumber}</span>}
                                            <span className="ml-auto text-white">{formatCurrency(t.status === 'won' && t.wonValue ? t.wonValue : t.value)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legenda com mais Visibilidade */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm shadow-blue-200"></div> Hoje</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-md bg-blue-500 shadow-sm shadow-blue-100"></div> Em Andamento</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-md bg-green-600 shadow-sm shadow-green-100"></div> Arrematado (Ganha)</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-md bg-red-600 shadow-sm shadow-red-100"></div> Perdida</div>
            </div>

            <style jsx>{`
                .custom-scrollbar-agenda::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar-agenda::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-agenda::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}
