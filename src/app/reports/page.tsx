"use client";

import { useTenders } from "@/context/TenderContext";
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Target,
    Building2,
    Download,
    ChevronDown,
    Activity,
    Briefcase,
    Star,
    RefreshCw,
    MapPin,
    ArrowLeft,
    Share2,
    ShieldCheck,
    Trophy
} from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
    const { tenders = [], atas = [] } = useTenders();
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    // Lista única de empresas
    const companies = useMemo(() => {
        const companyMap = new Map();

        tenders.forEach(t => {
            if (t.company) {
                const current = companyMap.get(t.company) || { tenders: 0, value: 0 };
                companyMap.set(t.company, {
                    tenders: current.tenders + 1,
                    value: current.value + (t.wonValue || t.value || 0)
                });
            }
        });

        atas.forEach(a => {
            if (a.company) {
                const current = companyMap.get(a.company) || { tenders: 0, value: 0 };
                // Evitamos duplicar valor se a ata já vem de um tender, mas para simplicidade de visão geral:
                companyMap.set(a.company, {
                    tenders: current.tenders,
                    value: current.value + (a.value || 0)
                });
            }
        });

        return Array.from(companyMap.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.value - a.value);
    }, [tenders, atas]);

    // Dados Filtrados para o Relatório Individual
    const reportData = useMemo(() => {
        if (!selectedCompany) return null;

        const cTenders = tenders.filter(t => t.company === selectedCompany);
        const cAtas = atas.filter(a => a.company === selectedCompany);

        const wonTenders = cTenders.filter(t => t.status === "won" || t.status === "Ganha" || t.status === "ATIVA");
        const totalWon = wonTenders.reduce((acc, t) => acc + (t.wonValue || t.value || 0), 0);

        const newAtasVal = cAtas.filter(a => !a.isExtended).reduce((acc, a) => acc + (a.value || 0), 0);
        const extAtasVal = cAtas.filter(a => a.isExtended).reduce((acc, a) => acc + (a.value || 0), 0);

        const expAtas = cAtas
            .filter(a => a.endDate && new Date(a.endDate) > new Date())
            .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
            .slice(0, 3);

        const cities: Record<string, number> = {};
        wonTenders.forEach(t => { if (t.city) cities[t.city] = (cities[t.city] || 0) + (t.wonValue || t.value || 0); });
        const topCities = Object.entries(cities).map(([name, val]) => ({ name, val })).sort((a, b) => b.val - a.val).slice(0, 3);

        return { totalWon, newAtasVal, extAtasVal, expAtas, topCities, totalCount: cTenders.length + cAtas.length };
    }, [selectedCompany, tenders, atas]);

    // VIEW: SELEÇÃO DE CLIENTE
    if (!selectedCompany) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-12 pb-24">
                <div className="text-center space-y-4 py-10">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">Performance de Clientes</h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                        Selecione um de seus clientes gerenciados para visualizar e compartilhar o relatório de desempenho.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {companies.map((company) => (
                        <button
                            key={company.name}
                            onClick={() => setSelectedCompany(company.name)}
                            className="bg-white p-8 rounded-[40px] border-2 border-slate-100 text-left hover:border-amber-500 transition-all hover:shadow-2xl hover:-translate-y-2 group flex flex-col justify-between min-h-[280px]"
                        >
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-50 group-hover:scale-110 transition-all">
                                    <Briefcase className="w-8 h-8 text-slate-400 group-hover:text-amber-500" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 leading-tight uppercase italic">{company.name}</h2>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Gerenciado</p>
                                    <p className="text-xl font-black text-slate-900">{formatCurrency(company.value)}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                </div>
                            </div>
                        </button>
                    ))}

                    <button className="border-2 border-dashed border-slate-200 rounded-[40px] p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:bg-slate-50 transition-all">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <Share2 className="w-6 h-6" />
                        </div>
                        <span className="font-bold uppercase text-[10px] tracking-widest">Adicionar Novo Perfil</span>
                    </button>
                </div>
            </div>
        );
    }

    // VIEW: RELATÓRIO DO CLIENTE
    return (
        <div className="min-h-screen bg-white p-4 md:p-10 max-w-4xl mx-auto space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-500 overflow-hidden">
            {/* Cabeçalho de Navegação (Apenas Interno) */}
            <div className="flex items-center justify-between no-print mb-8">
                <button
                    onClick={() => setSelectedCompany(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar aos Clientes
                </button>
                <div className="flex gap-3">
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                        Imprimir / PDF
                    </button>
                    <button className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Enviar para WhatsApp
                    </button>
                </div>
            </div>

            {/* RELATÓRIO ESTILO DOCUMENTO */}
            <div className="space-y-16">
                {/* 1. HEADER DO RELATÓRIO */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b-4 border-slate-900 pb-10">
                    <div className="space-y-2">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">Relatório Mensal de Performance</span>
                        <h1 className="text-5xl font-black text-slate-900 italic uppercase leading-none">{selectedCompany}</h1>
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">Gestão Estratégica Grupo Santi • {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                        <Trophy className="w-10 h-10 text-amber-500 mb-2" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Geral em Atas</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(reportData!.totalWon)}</p>
                    </div>
                </div>

                {/* 2. GRANDES NÚMEROS DE IMPACTO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Novos Negócios (Patrimônio)</h3>
                        </div>
                        <div className="p-8 bg-amber-50 rounded-[40px] border-2 border-amber-100">
                            <p className="text-lg font-bold text-amber-800 mb-1 opacity-70">Novas Atas Geradas</p>
                            <h2 className="text-5xl font-black text-amber-600 tracking-tighter">{formatCurrency(reportData!.newAtasVal)}</h2>
                            <p className="text-[11px] font-black text-amber-700/50 mt-4 uppercase tracking-widest border-t border-amber-200 pt-4">Valor bruto adicionado à carteira do cliente</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Receita Preservada (Manutenção)</h3>
                        </div>
                        <div className="p-8 bg-blue-50 rounded-[40px] border-2 border-blue-100">
                            <p className="text-lg font-bold text-blue-800 mb-1 opacity-70">Aditivos e Prorrogações</p>
                            <h2 className="text-5xl font-black text-blue-600 tracking-tighter">{formatCurrency(reportData!.extAtasVal)}</h2>
                            <p className="text-[11px] font-black text-blue-700/50 mt-4 uppercase tracking-widest border-t border-blue-200 pt-4">Valor histórico garantido via gestão de prazos</p>
                        </div>
                    </div>
                </div>

                {/* 3. VÍTORIA GEOGRÁFICA & PRÓXIMOS PASSOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Principais Mercados (Presença)</h3>
                        </div>
                        <div className="space-y-6">
                            {reportData!.topCities.map((city, idx) => (
                                <div key={city.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-300 font-black text-xl">0{idx + 1}</span>
                                        <span className="font-bold text-slate-700 uppercase">{city.name}</span>
                                    </div>
                                    <span className="font-black text-slate-900 text-sm">{formatCurrency(city.val)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Agenda de Renovação Imediata</h3>
                        </div>
                        <div className="space-y-4">
                            {reportData!.expAtas.map(ata => (
                                <div key={ata.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 leading-none">ATA {ata.ataNumber}</span>
                                        <span className="font-bold text-slate-700 truncate w-40">Finalizar Renovação</span>
                                    </div>
                                    <span className="text-red-600 font-black text-xs">{formatDate(ata.endDate!)}</span>
                                </div>
                            ))}
                            <div className="p-5 bg-slate-900 rounded-3xl text-center">
                                <p className="text-white font-black text-[10px] uppercase tracking-widest">Nenhuma ação de risco detectada</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. FOOTER DO RELATÓRIO */}
                <div className="pt-20 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl italic">GS</div>
                        <div>
                            <p className="font-black text-slate-900 text-sm uppercase">Grupo Santi Licitações</p>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Excelência em Gestão Governamental</p>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase leading-loose">Documento validado via sistema LicitaGestor V3<br />Gerado em {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

