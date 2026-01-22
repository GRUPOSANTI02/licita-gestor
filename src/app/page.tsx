"use client";

import { TenderCard } from "@/components/features/TenderCard";
import { useTenders } from "@/context/TenderContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpRight, TrendingUp, Users, AlertCircle, Plus, Clock, MapPin } from "lucide-react";
import { SalesChart } from "@/components/features/SalesChart";
import { CalendarWidget } from "@/components/features/CalendarWidget";
import Link from "next/link";

export default function Dashboard() {
    const { tenders, isLoading } = useTenders();

    // Calcular estatísticas reais
    const totalValue = tenders.reduce((acc, t) => acc + t.value, 0);
    const activeTendersList = tenders.filter(t => t.status === 'in_progress' || t.status === 'pending');
    const wonTenders = tenders.filter(t => t.status === 'won');
    const totalWonRevenue = wonTenders.reduce((acc, t) => acc + (t.wonValue || 0), 0);

    // Ordenar por data mais próxima (Urgentes)
    const urgentTenders = [...activeTendersList]
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 4);

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
        <div className="space-y-10 pb-20">
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Bom dia, Murilo!</h1>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Painel de Controle Estratégico</p>
                </div>
                <Link
                    href="/tenders/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-black shadow-2xl shadow-blue-500/40 text-sm uppercase tracking-widest"
                >
                    <Plus className="w-5 h-5" />
                    Nova Licitação
                </Link>
            </div>

            {/* Stats Grid Compacto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Oportunidades"
                    value={formatCurrency(totalValue)}
                    icon={<TrendingUp className="text-blue-600 w-5 h-5" />}
                    trend="+R$ 45k este mês"
                    trendUp={true}
                />
                <StatCard
                    title="Em Disputa"
                    value={activeTendersList.length.toString()}
                    icon={<AlertCircle className="text-amber-600 w-5 h-5" />}
                    trend="Atenção aos prazos"
                />
                <StatCard
                    title="Receita Real"
                    value={formatCurrency(totalWonRevenue)}
                    icon={<ArrowUpRight className="text-green-600 w-5 h-5" />}
                    trend={`${wonTenders.length} arrematadas`}
                    trendUp={true}
                />
                <StatCard
                    title="Taxa de Vitória"
                    value={tenders.length > 0 ? `${Math.round((wonTenders.length / tenders.length) * 100)}%` : "0%"}
                    icon={<Users className="text-purple-600 w-5 h-5" />}
                    trend="Baseado no histórico"
                />
            </div>

            {/* NOVO LAYOUT: Agenda + Coluna Lateral de Urgência */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                {/* AGENDA (3 Colunas) */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Cronograma Mensal</h2>
                    </div>
                    <CalendarWidget />
                </div>

                {/* COLUNA DE URGÊNCIA (1 Coluna) */}
                <div className="xl:col-span-1 space-y-6">
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
                            // Lógica de agrupamento explícita
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
                                                    href={`/tenders/${tender.id}/edit`}
                                                    className="block bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 hover:scale-[1.02] transition-all group"
                                                >
                                                    <h4 className="font-black text-slate-800 leading-tight mb-3 group-hover:text-blue-600 transition-colors uppercase italic text-sm">{tender.title}</h4>
                                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                                        <div className="flex items-center gap-1.5 text-slate-400">
                                                            <MapPin className="w-3 h-3 text-slate-300" />
                                                            <span className="text-[10px] font-bold uppercase">{tender.city}</span>
                                                        </div>
                                                        <span className="text-[11px] font-black text-slate-900">{formatCurrency(tender.value)}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })()
                        )}

                        {urgentTenders.length > 0 && (
                            <Link href="/tenders" className="block text-center p-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-colors shadow-lg">
                                Ver Todas as Disputas
                            </Link>
                        )}
                    </div>

                    {/* Gráfico na Lateral para Equilíbrio */}
                    <div className="pt-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-8 bg-purple-600 rounded-full"></div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Alcance</h2>
                        </div>
                        <SalesChart />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, trendUp }: any) {
    return (
        <div className="bg-white p-7 rounded-[2rem] shadow-sm border-2 border-slate-50 hover:border-blue-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-none tracking-tight">{value}</h3>
                </div>
                <div className="p-4 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-2xl transition-all shadow-sm">
                    {icon}
                </div>
            </div>
            {trend && (
                <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${trendUp ? 'text-green-600 italic' : 'text-slate-400'}`}>
                    {trendUp && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {trend}
                </div>
            )}
        </div>
    );
}
