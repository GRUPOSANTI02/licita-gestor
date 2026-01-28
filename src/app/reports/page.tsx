"use client";

import { useTenders } from "@/context/TenderContext";
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Calendar,
    Target,
    DollarSign,
    Building2,
    AlertTriangle,
    Download,
    Filter
} from "lucide-react";
import { useMemo } from "react";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
    const { tenders, atas } = useTenders();

    // 1. Estatísticas Financeiras
    const stats = useMemo(() => {
        const wonTenders = tenders.filter(t => t.status === "won" || t.status === "Ganha");

        const totalWon = wonTenders
            .reduce((acc, t) => acc + (t.wonValue || t.value || 0), 0);

        const totalDispute = tenders
            .filter(t =>
                t.status === "pending" ||
                t.status === "Aguardando" ||
                t.status === "in_progress" ||
                t.status === "Em Análise"
            )
            .reduce((acc, t) => acc + (t.value || 0), 0);

        const winRate = tenders.length > 0
            ? (wonTenders.length / tenders.length) * 100
            : 0;

        return { totalWon, totalDispute, winRate };
    }, [tenders]);

    // 2. Atas por Vencimento (Próximos 90 dias)
    const expiringAtas = useMemo(() => {
        const today = new Date();
        const ninetyDays = new Date();
        ninetyDays.setDate(today.getDate() + 90);

        return atas
            .filter(ata => {
                const end = new Date(ata.endDate);
                return end >= today && end <= ninetyDays;
            })
            .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    }, [atas]);

    // 3. Top Cidades
    const topCities = useMemo(() => {
        const cityMap: Record<string, number> = {};
        tenders.filter(t => t.status === "won" || t.status === "Ganha").forEach(t => {
            const city = t.city || "Não Informada";
            cityMap[city] = (cityMap[city] || 0) + (t.wonValue || t.value || 0);
        });

        return Object.entries(cityMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [tenders]);

    // 4. Volume Mensal (Dinamismo nos últimos 6 meses)
    const monthlyStats = useMemo(() => {
        const months = [];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthLabel = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
            const monthIndex = d.getMonth();
            const yearIndex = d.getFullYear();

            const monthTenders = tenders.filter(t => {
                const dead = new Date(t.deadline);
                return dead.getMonth() === monthIndex && dead.getFullYear() === yearIndex;
            });

            months.push({
                month: monthLabel,
                total: monthTenders.length,
                won: monthTenders.filter(t => t.status === 'won' || t.status === 'Ganha').length
            });
        }
        return months;
    }, [tenders]);

    // Calcular o máximo para escala das barras
    const maxVolume = useMemo(() => {
        const val = Math.max(...monthlyStats.map(m => m.total), 5); // No mínimo 5 para escala
        return Math.ceil(val / 5) * 5; // Arredonda para cima múltiplo de 5
    }, [monthlyStats]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 pb-24">
            {/* ... o resto do código header e cards continua igual ... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Relatórios de Desempenho</h1>
                    <p className="text-slate-500 font-medium">Análise estratégica de licitações e contratos.</p>
                </div>

                <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs uppercase tracking-widest shadow-xl">
                    <Download className="w-4 h-4" />
                    Exportar PDF
                </button>
            </div>

            {/* CARDS PRINCIPAIS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4 text-green-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Arrematado</p>
                    <h2 className="text-2xl font-black text-slate-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalWon)}
                    </h2>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                        <Target className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Em Disputa</p>
                    <h2 className="text-2xl font-black text-slate-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalDispute)}
                    </h2>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 text-purple-600">
                        <PieChart className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Taxa de Vitória</p>
                    <h2 className="text-2xl font-black text-slate-800">
                        {stats.winRate.toFixed(1)}%
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* TIMELINE DE VENCIMENTOS */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-amber-500" />
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">Vencimentos Próximos</h3>
                        </div>
                        <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-3 py-1 rounded-full uppercase">Atas 90 Dias</span>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {expiringAtas.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 font-bold italic">
                                Nenhuma ata vencendo em breve.
                            </div>
                        ) : (
                            expiringAtas.map(ata => (
                                <div key={ata.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-200 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">ATA Nº {ata.ataNumber}</span>
                                        <span className="font-bold text-slate-700 truncate max-w-[200px]">
                                            {tenders.find(t => t.id === ata.tenderId)?.title || ata.manualTitle || "Sem título"}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-red-600 font-black text-sm">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            {formatDate(ata.endDate)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RANKING DE CIDADES/FATURAMENTO */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        <h3 className="font-black text-slate-800 uppercase tracking-tight">Onde você mais ganha</h3>
                    </div>

                    <div className="space-y-6">
                        {topCities.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 font-bold italic">
                                Sem dados de vitórias para exibir ranking.
                            </div>
                        ) : (
                            topCities.map((city, index) => {
                                const percentage = topCities[0].value > 0 ? (city.value / topCities[0].value) * 100 : 0;
                                return (
                                    <div key={city.name} className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-600 px-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-500">#{index + 1}</span>
                                                {city.name}
                                            </div>
                                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(city.value)}</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl">
                            <Building2 className="w-5 h-5 text-slate-400" />
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                <span className="font-bold text-slate-800">Dica:</span> Seus contratos vitoriosos estão concentrados em <span className="font-bold text-blue-600">{topCities[0]?.name || "várias cidades"}</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* VOLUME MENSAL (GRÁFICO CSS DINÂMICO) */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-slate-800" />
                        <h3 className="font-black text-slate-800 uppercase tracking-tight">Volume de Licitações (Últimos 6 Meses)</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase">Ganhos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase">Participações</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between gap-2 h-48 px-2">
                    {monthlyStats.map((item) => (
                        <div key={item.month} className="flex-1 flex flex-col items-center gap-3 group">
                            <div className="w-full max-w-[40px] flex flex-col justify-end gap-1 h-32 relative">
                                {/* Barra Total */}
                                <div
                                    className="w-full bg-slate-100 rounded-t-lg transition-all duration-500 group-hover:bg-slate-200"
                                    style={{ height: `${(item.total / maxVolume) * 100}%` }}
                                ></div>
                                {/* Barra Ganha */}
                                <div
                                    className="w-full bg-blue-600 rounded-t-lg absolute bottom-0 left-0 transition-all duration-700"
                                    style={{ height: `${(item.won / maxVolume) * 100}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg font-black whitespace-nowrap transition-opacity">
                                        {item.won} Vitórias
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
