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
            // Criar data sem considerar timezone para evitar problemas
            const deadlineStr = t.deadline.split('T')[0]; // Pega apenas YYYY-MM-DD
            const [year, month, dayOfMonth] = deadlineStr.split('-').map(Number);

            return dayOfMonth === day &&
                (month - 1) === currentDate.getMonth() &&
                year === currentDate.getFullYear();
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
            <div className="grid grid-cols-7 lg:grid-cols-[0.6fr_1fr_1fr_1fr_1fr_1fr_0.6fr] mb-4 bg-slate-50/50 rounded-xl p-3 border border-slate-50">
                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((day, idx) => (
                    <div key={idx} className="text-center text-[10px] sm:text-[11px] font-black text-slate-400 tracking-[0.2em]">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid de Dias - Células MAIORES */}
            <div className="grid grid-cols-7 lg:grid-cols-[0.6fr_1fr_1fr_1fr_1fr_1fr_0.6fr] gap-2 sm:gap-3">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[100px] sm:min-h-[140px] bg-slate-50/10 rounded-2xl border border-transparent" />
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
                                min-h-[160px] sm:min-h-[140px] relative flex flex-col p-2 sm:p-3 rounded-2xl transition-all border-2
                                ${isToday ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 bg-white hover:border-slate-200 hover:shadow-md'}
                                ${hasTender && !isToday ? 'bg-slate-50 border-slate-100' : ''}
                            `}
                        >
                            <span className={`
                                text-sm sm:text-base font-black mb-2 
                                ${isToday ? 'bg-blue-600 text-white w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl shadow-lg -mt-3 sm:-mt-4 -ml-3 sm:-ml-4 z-10 text-xs sm:text-base' : 'text-slate-900'}
                            `}>
                                {day}
                            </span>

                            <div className="flex-1 flex flex-col gap-1.5 w-full overflow-y-auto custom-scrollbar-agenda pr-0.5 mt-1">
                                {dayTenders.map((t, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/tenders/${t.id}/edit?returnTo=/`}
                                        className={`
                                            group w-full p-2.5 rounded-xl flex flex-col gap-1 transition-all hover:scale-[1.02] hover:shadow-lg relative overflow-hidden
                                            ${(t.status === 'Ganha' || t.status === 'won')
                                                ? 'bg-[#16a34a] text-white' // Verde Sólido Forte (Green 600)
                                                : (t.status === 'Perdida' || t.status === 'lost')
                                                    ? 'bg-[#dc2626] text-white' // Vermelho Sólido Forte (Red 600)
                                                    : ((t.status as string) === 'running' || (t.status as string) === 'Em Andamento')
                                                        ? 'bg-amber-500 text-white' // Amarelo (Amber) Sólido
                                                        : ((t.status as string) === 'not_participated' || (t.status as string) === 'Não Participou')
                                                            ? 'bg-slate-400 text-white opacity-60' // Cinza
                                                            : 'bg-[#2563eb] text-white' // Azul Sólido Forte (Blue 600)
                                            }
                                        `}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[9px] leading-tight font-black uppercase tracking-tight">
                                                {t.city ? `${t.city} - ${t.title}` : t.title}
                                            </span>
                                        </div>

                                        {/* Linha Divisória Fina e Sutil */}
                                        <div className="w-full h-[0.5px] bg-white/30 my-0.5"></div>

                                        <div className="flex flex-col w-full mt-auto pt-1 gap-0.5">
                                            <div className="flex justify-between items-center w-full">
                                                <span className="text-[8px] opacity-90 font-bold tracking-wide leading-none">
                                                    NR: {t.tenderNumber || 'S/N'}
                                                </span>
                                            </div>

                                            {(t.status === 'Ganha' || t.status === 'won') && t.wonValue ? (
                                                <>
                                                    <div className="flex justify-between items-center w-full">
                                                        <span className="text-[8px] opacity-90 font-bold leading-none">
                                                            Est: {formatCurrency(t.value)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center w-full">
                                                        <span className="text-[10px] font-black tracking-tight leading-none text-white">
                                                            Venc: {formatCurrency(t.wonValue)}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="text-[10px] font-black tracking-tight leading-none">
                                                        Est: {formatCurrency(t.value)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legenda com mais Visibilidade - Estilo Bolha */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest justify-center sm:justify-start">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                    Hoje
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></div>
                    Em Andamento
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></div>
                    Arrematado (Ganha)
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></div>
                    Perdida
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar-agenda::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar-agenda::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-agenda::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}
