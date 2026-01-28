"use client";

import { useState } from "react";
import { useTenders } from "@/context/TenderContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search, Plus, MapPin } from "lucide-react";
import Link from "next/link";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function MobileCalendarAgenda() {
    const { tenders } = useTenders();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Funções de navegação do calendário
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Dados do Calendário
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Eventos do mês (para mostrar bolinhas)
    const tendersByDate: Record<string, any[]> = {};
    tenders.forEach(t => {
        const d = new Date(t.deadline);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!tendersByDate[key]) tendersByDate[key] = [];
        tendersByDate[key].push(t);
    });

    // Eventos do dia selecionado
    const selectedKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    const selectedTenders = tendersByDate[selectedKey] || [];
    // Ordenar por horário (deadline é a data completa com hora)
    selectedTenders.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    // Gerar grid
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${month}-${day}`;
        const hasEvents = tendersByDate[dateKey]?.length > 0;
        const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
        const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

        calendarDays.push(
            <div
                key={day}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                className="h-10 flex flex-col items-center justify-center relative cursor-pointer"
            >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all
                    ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : isToday ? 'text-blue-400' : 'text-slate-400 hover:text-white'}
                `}>
                    {day}
                </div>
                {hasEvents && !isSelected && (
                    <div className="w-1 h-1 bg-green-500 rounded-full mt-1"></div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-24">
            {/* --- HEADER CALENDÁRIO --- */}
            <div className="p-6 bg-slate-950 sticky top-0 z-10 border-b border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={prevMonth}
                        className="flex items-center gap-1 text-slate-400 hover:text-white text-lg font-bold"
                    >
                        <ChevronLeft className="w-6 h-6" />
                        {monthNames[month === 0 ? 11 : month - 1].substring(0, 3)}
                    </button>

                    <h2 className="text-xl font-black tracking-tight">{monthNames[month]} <span className="text-slate-500">{year}</span></h2>

                    <button
                        onClick={nextMonth}
                        className="flex items-center gap-1 text-slate-400 hover:text-white text-lg font-bold"
                    >
                        {monthNames[month === 11 ? 0 : month + 1].substring(0, 3)}
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="flex gap-4">
                        <Search className="w-6 h-6 text-slate-400" />
                        <Link href="/tenders/new"><Plus className="w-6 h-6 text-slate-400" /></Link>
                    </div>
                </div>

                {/* Dias da Semana */}
                <div className="grid grid-cols-7 mb-2">
                    {daysOfWeek.map(day => (
                        <div key={day} className="text-center text-[10px] font-black uppercase text-slate-600 tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid de Dias */}
                <div className="grid grid-cols-7 gap-y-2">
                    {calendarDays}
                </div>
            </div>

            {/* --- LISTA DE EVENTOS DO DIA --- */}
            <div className="p-6 mt-4">
                <h3 className="text-lg font-bold mb-6 text-slate-300">
                    {daysOfWeek[selectedDate.getDay()]}-feira, {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}
                </h3>

                <div className="space-y-4">
                    {selectedTenders.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <p className="text-sm font-bold text-slate-500">Nenhum evento para este dia</p>
                        </div>
                    ) : (
                        selectedTenders.map(tender => {
                            const deadlineDate = new Date(tender.deadline);
                            const time = deadlineDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                            const statusColor = (tender.status === 'won' || tender.status === 'Ganha') ? 'bg-green-500'
                                : (tender.status === 'lost' || tender.status === 'Perdida') ? 'bg-red-500'
                                    : (tender.status === 'running' || tender.status === 'Em Andamento') ? 'bg-purple-600'
                                        : 'bg-blue-500';

                            const borderColor = (tender.status === 'won' || tender.status === 'Ganha') ? 'hover:border-green-500'
                                : (tender.status === 'lost' || tender.status === 'Perdida') ? 'hover:border-red-500'
                                    : (tender.status === 'running' || tender.status === 'Em Andamento') ? 'hover:border-purple-600'
                                        : 'hover:border-blue-500';

                            return (
                                <Link href={`/tenders/${tender.id}/edit?returnTo=/`} key={tender.id} className="block group">
                                    <div className={`bg-slate-900 rounded-2xl overflow-hidden flex border border-slate-800 ${borderColor} transition-colors`}>
                                        {/* Barra lateral colorida */}
                                        <div className={`w-2 ${statusColor}`}></div>

                                        <div className="p-4 flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-mono font-bold text-slate-400">{time}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                                                    Valor: {formatCurrency(tender.value)}
                                                </span>
                                            </div>

                                            <h4 className="font-black text-white text-sm uppercase leading-tight mb-2">
                                                {tender.title}
                                            </h4>

                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {tender.agency} - {tender.city}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
