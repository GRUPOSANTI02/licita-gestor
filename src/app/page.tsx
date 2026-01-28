"use client";

import { useMemo } from "react";

import { useTenders } from "@/context/TenderContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpRight, TrendingUp, Users, AlertCircle, Plus, Clock, MapPin, FileText, MessageCircle, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/features/StatCard";
import { EditableDashboard } from "@/components/dashboard/EditableDashboard";
import { SalesChart } from "@/components/features/SalesChart";
import { CalendarWidget } from "@/components/features/CalendarWidget";
import { generateWeeklySummaryWhatsAppLink } from "@/lib/whatsapp";
import Link from "next/link";
import { MobileCalendarAgenda } from "@/components/mobile/MobileCalendarAgenda";

export default function Dashboard() {
    const { tenders, isLoading } = useTenders();

    // Identificar licitações com Sessão de Retomada agendada (Hoje ou Futuro)
    const scheduledSessions = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return tenders
            .filter(t => t.nextSessionDate && new Date(t.nextSessionDate) >= today)
            .sort((a, b) => new Date(a.nextSessionDate!).getTime() - new Date(b.nextSessionDate!).getTime());
    }, [tenders]);

    const totalValue = tenders
        .filter(t => t.status !== 'not_participated' && t.status !== 'Não Participou')
        .reduce((acc, t) => acc + (t.value || 0), 0);

    const activeTendersList = tenders.filter(t =>
        t.status === 'in_progress' ||
        t.status === 'pending' ||
        t.status === 'Em Análise' ||
        t.status === 'Aguardando'
    );
    const wonTenders = tenders.filter(t => t.status === 'won' || t.status === 'Ganha');
    const totalWonRevenue = wonTenders.reduce((acc, t) => acc + (t.wonValue || t.value || 0), 0);

    const participatedTendersCount = tenders.filter(t => t.status !== 'not_participated' && t.status !== 'Não Participou').length;

    const urgentTenders = [...activeTendersList]
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 4);

    const statCards = [
        {
            id: 'stat-opportunities',
            colSpan: 'col-span-1',
            title: 'Oportunidades',
            component: (
                <StatCard
                    title="Oportunidades"
                    value={formatCurrency(totalValue)}
                    icon={<TrendingUp className="text-blue-600 w-5 h-5" />}
                    trend="+R$ 45k este mês"
                    trendUp={true}
                />
            )
        },
        {
            id: 'stat-active',
            colSpan: 'col-span-1',
            title: 'Em Disputa',
            component: (
                <StatCard
                    title="Em Disputa"
                    value={activeTendersList.length.toString()}
                    icon={<AlertCircle className="text-amber-600 w-5 h-5" />}
                    trend="Atenção aos prazos"
                />
            )
        },
        {
            id: 'stat-revenue',
            colSpan: 'col-span-1',
            title: 'Receita Real',
            component: (
                <StatCard
                    title="Receita Real"
                    value={formatCurrency(totalWonRevenue)}
                    icon={<ArrowUpRight className="text-green-600 w-5 h-5" />}
                    trend={`${wonTenders.length} arrematadas`}
                    trendUp={true}
                />
            )
        },
        {
            id: 'stat-winrate',
            colSpan: 'col-span-1',
            title: 'Taxa de Vitória',
            component: (
                <StatCard
                    title="Taxa de Vitória"
                    value={participatedTendersCount > 0 ? `${Math.round((wonTenders.length / participatedTendersCount) * 100)}% ` : "0%"}
                    icon={<Users className="text-purple-600 w-5 h-5" />}
                    trend="Baseado no histórico"
                />
            )
        }
    ];

    const calendarWidget = {
        id: 'calendar-widget',
        colSpan: 'col-span-3',
        title: 'Cronograma',
        component: (
            <div className="space-y-6 h-full flex flex-col">
                {/* ALERTA DE SESSÕES INTEGRADO AO BLOCO DO CRONOGRAMA */}
                {scheduledSessions.length > 0 && (
                    <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 rounded-3xl p-4 overflow-x-auto mb-2 animate-in fade-in slide-in-from-top-4">
                        <div className="flex-shrink-0 flex items-center gap-2 pr-4 border-r border-amber-200">
                            <div className="p-2 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-500/20">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-amber-900 font-black text-xs uppercase tracking-widest leading-tight">Retomadas</h3>
                                <p className="text-amber-700/60 text-[10px] font-bold">Não perca o horário</p>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center gap-3">
                            {scheduledSessions.map(t => (
                                <Link key={t.id} href={`/tenders/${t.id}/edit?returnTo=/`} className="flex-shrink-0 flex items-center gap-4 bg-white px-4 py-3 rounded-2xl border border-amber-100 hover:border-amber-300 hover:scale-105 transition-all shadow-sm group min-w-[240px]">
                                    <div className="flex flex-col w-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${new Date(t.nextSessionDate!).toDateString() === new Date().toDateString() ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                                                {new Date(t.nextSessionDate!).toDateString() === new Date().toDateString() ? 'HOJE' : formatDate(t.nextSessionDate!).split(' ')[0]} • {new Date(t.nextSessionDate!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <MapPin className="w-3 h-3" />
                                                <span className="text-[9px] font-bold uppercase">{t.city}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-slate-800 truncate w-full group-hover:text-blue-600 transition-colors uppercase italic">{t.title}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Cronograma Mensal</h2>
                </div>
                <CalendarWidget />
            </div>
        )
    };

    const urgentWidget = {
        id: 'urgent-widget',
        colSpan: 'col-span-1',
        title: 'Urgentes',
        component: (
            <div className="space-y-6 h-full">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Urgentes</h2>
                </div>

                <div className="space-y-10">
                    {urgentTenders.length === 0 ? (
                        <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tudo em dia!</p>
                        </div>
                    ) : (
                        (() => {
                            const groups: Record<string, any[]> = {};
                            urgentTenders.forEach(tender => {
                                const date = formatDate(tender.deadline);
                                if (!groups[date]) groups[date] = [];
                                groups[date].push(tender);
                            });

                            return Object.keys(groups).map((date) => (
                                <div key={date} className="relative pl-4 border-l-2 border-slate-100 space-y-4">
                                    <div className="flex items-center gap-2 -ml-[1.15rem] bg-slate-50 w-fit pr-4 py-1 rounded-full">
                                        <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                                            <Clock className="w-2.5 h-2.5 text-white" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{date}</span>
                                    </div>

                                    <div className="space-y-4">
                                        {groups[date].map((tender) => (
                                            <Link
                                                key={tender.id}
                                                href={`/tenders/${tender.id}/edit?returnTo=/`}
                                                className="block bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 hover:scale-[1.02] transition-all group"
                                            >
                                                <h4 className="font-black text-slate-800 leading-tight mb-3 group-hover:text-blue-600 transition-colors uppercase italic text-sm">{tender.title}</h4>
                                                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <MapPin className="w-3 h-3 text-slate-300" />
                                                        <span className="text-[10px] font-bold uppercase">{tender.city}</span>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {tender.editalUrl && (
                                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                                                <FileText className="w-3.5 h-3.5" />
                                                            </div>
                                                        )}
                                                        <span className="text-[11px] font-black text-slate-900">{formatCurrency(tender.value)}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()
                    )}

                    {
                        urgentTenders.length > 0 && (
                            <Link href="/tenders" className="block text-center p-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-colors shadow-lg">
                                Ver Todas
                            </Link>
                        )
                    }
                </div>
            </div>
        )
    };

    const chartWidget = {
        id: 'chart-widget',
        colSpan: 'col-span-4',
        title: 'Gráfico de Vendas',
        component: (
            <div className="h-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-purple-600 rounded-full"></div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Performance de Vendas</h2>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <SalesChart />
                </div>
            </div>
        )
    };

    // Lista final de itens para o dashboard: REMOVIDO ALERT widget avulso
    const dashboardItems = [
        ...statCards,
        calendarWidget,
        urgentWidget,
        chartWidget
    ] as any[];

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">LicitaGestor Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="md:hidden">
                <MobileCalendarAgenda />
            </div>

            <div className="hidden md:block space-y-10 pb-20">
                {/* Header Premium */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">Bom dia!</h1>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Painel de Controle Estratégico</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => window.open(generateWeeklySummaryWhatsAppLink(tenders), '_blank')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl flex items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-black shadow-2xl shadow-emerald-500/40 text-sm uppercase tracking-widest flex-1 md:flex-none"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Resumo Semanal
                        </button>
                        <Link
                            href="/tenders/new"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-black shadow-2xl shadow-blue-500/40 text-sm uppercase tracking-widest flex-1 md:flex-none text-center justify-center"
                        >
                            <Plus className="w-5 h-5" />
                            Nova
                        </Link>
                    </div>
                </div>

                {/* Componente de Dashboard Editável */}
                <EditableDashboard initialItems={dashboardItems} />
            </div>
        </>
    );
}
