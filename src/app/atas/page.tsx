"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText, Search, AlertCircle, Clock, AlertTriangle, X, ChevronDown, Star, RefreshCw } from "lucide-react";
import { useTenders } from "@/context/TenderContext";
import { formatCurrency } from "@/lib/utils";
import { useState, useMemo } from "react";
import { AtaCard } from "@/components/AtaCard";

function getDaysUntilExpiry(endDate: string | null): number {
    if (!endDate) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(endDate);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatus(daysUntil: number): 'ATIVA' | 'VENCE EM BREVE' | 'VENCIDA' {
    if (daysUntil < 0) return 'VENCIDA';
    if (daysUntil <= 30) return 'VENCE EM BREVE';
    return 'ATIVA';
}

type FilterType = "all" | "expired" | "expiring_soon" | "active" | "extendable" | "adhesion" | "new" | "extended";

export default function AtasPage() {
    const { atas, tenders, isLoading } = useTenders();
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const [filterCity, setFilterCity] = useState<string[]>([]);
    const [filterCompany, setFilterCompany] = useState<string[]>([]);
    const [openMenu, setOpenMenu] = useState<'city' | 'company' | null>(null);
    const [sortBy, setSortBy] = useState<'vencimento' | 'valor' | 'cidade'>('vencimento');

    // Enriquecer dados
    const enrichedAtas = useMemo(() => atas.map(ata => {
        const tender = tenders.find(t => t.id === ata.tenderId);
        const daysUntil = getDaysUntilExpiry(ata.endDate);
        return {
            ...ata,
            resolvedTitle: tender?.title || ata.manualTitle || "Sem título",
            resolvedAgency: tender?.agency || ata.manualAgency || "-",
            resolvedCity: tender?.city || ata.manualCity || "-",
            daysUntil,
            statusLabel: getStatus(daysUntil),
        };
    }), [atas, tenders]);

    // Valores únicos para filtros
    const uniqueCities = useMemo(() => [...new Set(enrichedAtas.map(a => a.resolvedCity))].filter(c => c !== '-').sort(), [enrichedAtas]);
    const uniqueCompanies = useMemo(() => [...new Set(enrichedAtas.map(a => a.company).filter(Boolean))].sort() as string[], [enrichedAtas]);

    // Contadores
    const counts = useMemo(() => {
        let expired = 0, expiringSoon = 0, active = 0, newAtas = 0, extendedAtas = 0, newAtasValue = 0, extendedAtasValue = 0;
        atas.forEach(ata => {
            const days = getDaysUntilExpiry(ata.endDate);
            if (days < 0) expired++; else if (days <= 30) expiringSoon++; else active++;
            const tender = tenders.find(t => t.id === ata.tenderId);
            const value = ata.value || (tender ? (tender.wonValue || tender.value || 0) : 0);

            if (ata.isNew) {
                newAtas++;
                newAtasValue += value;
            } else if (ata.isExtended) {
                extendedAtas++;
                extendedAtasValue += value;
            } else {
                newAtas++;
                newAtasValue += value;
            }
        });
        return { expired, expiringSoon, active, newAtas, extendedAtas, newAtasValue, extendedAtasValue };
    }, [atas, tenders]);

    // Filtrar e Ordenar
    const filteredAtas = useMemo(() => {
        let result = [...enrichedAtas];

        // 1. Busca
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            result = result.filter(a =>
                (a.resolvedTitle || "").toLowerCase().includes(s) ||
                (a.resolvedAgency || "").toLowerCase().includes(s) ||
                (a.resolvedCity || "").toLowerCase().includes(s) ||
                (a.company && a.company.toLowerCase().includes(s)) ||
                (a.ataNumber && a.ataNumber.toLowerCase().includes(s))
            );
        }

        // 2. Filtro Pills (Status)
        result = result.filter(a => {
            switch (activeFilter) {
                case "expired": return a.daysUntil < 0;
                case "expiring_soon": return a.daysUntil >= 0 && a.daysUntil <= 30;
                case "active": return a.daysUntil > 30;
                case "extendable": return a.canExtend;
                case "adhesion": return a.canAdhere;
                case "new": return a.isNew;
                case "extended": return a.isExtended;
                default: return true;
            }
        });

        // 3. Filtros de Coluna
        if (filterCity.length > 0) result = result.filter(a => filterCity.includes(a.resolvedCity));
        if (filterCompany.length > 0) result = result.filter(a => a.company && filterCompany.includes(a.company));

        // 4. Ordenação
        result.sort((a, b) => {
            switch (sortBy) {
                case 'vencimento': return a.daysUntil - b.daysUntil;
                case 'valor': return (b.value || 0) - (a.value || 0);
                case 'cidade': return a.resolvedCity.localeCompare(b.resolvedCity);
                default: return 0;
            }
        });

        return result;
    }, [enrichedAtas, searchTerm, activeFilter, filterCity, filterCompany, sortBy]);

    const toggleFilter = (type: 'city' | 'company', value: string) => {
        const setter = type === 'city' ? setFilterCity : setFilterCompany;
        setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    };

    const filterButtons = [
        { key: "all" as FilterType, label: "Todas", count: atas.length, color: "bg-slate-100 text-slate-600" },
        { key: "expired" as FilterType, label: "Vencidas", count: counts.expired, color: "bg-red-100 text-red-700" },
        { key: "expiring_soon" as FilterType, label: "Próx. Vencimento", count: counts.expiringSoon, color: "bg-amber-100 text-amber-700" },
        { key: "active" as FilterType, label: "Ativas", count: counts.active, color: "bg-green-100 text-green-700" },
        { key: "extendable" as FilterType, label: "Prorrogáveis", color: "bg-blue-100 text-blue-700" },
        { key: "adhesion" as FilterType, label: "Com Adesão", color: "bg-purple-100 text-purple-700" },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-900">
            {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Atas</h1>
                        {isLoading && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full animate-pulse">Carregando...</span>}
                    </div>
                    <p className="text-slate-500 font-medium">Acompanhe seus registros de preços e vencimentos.</p>
                </div>
                <Link href="/atas/new" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20">
                    <Plus className="w-4 h-4" /> Nova Ata
                </Link>
            </div>

            {/* SUMÁRIOS - AGORA SÃO FILTROS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button
                    onClick={() => setActiveFilter(activeFilter === 'new' ? 'all' : 'new')}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between text-left group ${activeFilter === 'new' ? 'bg-amber-500 border-amber-600 shadow-xl shadow-amber-500/20' : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md'}`}
                >
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${activeFilter === 'new' ? 'text-amber-100' : 'text-slate-400'}`}>Faturamento Novo</p>
                        <div className="flex items-baseline gap-2">
                            <h4 className={`text-4xl font-black ${activeFilter === 'new' ? 'text-white' : 'text-slate-800'}`}>{counts.newAtas}</h4>
                            <span className={`text-sm font-bold ${activeFilter === 'new' ? 'text-amber-100' : 'text-slate-500'}`}>{formatCurrency(counts.newAtasValue)}</span>
                        </div>
                        <p className={`text-[9px] font-bold mt-2 ${activeFilter === 'new' ? 'text-amber-100' : 'text-amber-600'}`}>Clique para filtrar estas atas</p>
                    </div>
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:rotate-12 ${activeFilter === 'new' ? 'bg-white/20' : 'bg-amber-50'}`}>
                        <Star className={`w-8 h-8 ${activeFilter === 'new' ? 'text-white fill-white' : 'text-amber-600'}`} />
                    </div>
                </button>

                <button
                    onClick={() => setActiveFilter(activeFilter === 'extended' ? 'all' : 'extended')}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between text-left group ${activeFilter === 'extended' ? 'bg-blue-600 border-blue-700 shadow-xl shadow-blue-600/20' : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'}`}
                >
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${activeFilter === 'extended' ? 'text-blue-100' : 'text-slate-400'}`}>Faturamento Mantido</p>
                        <div className="flex items-baseline gap-2">
                            <h4 className={`text-4xl font-black ${activeFilter === 'extended' ? 'text-white' : 'text-slate-800'}`}>{counts.extendedAtas}</h4>
                            <span className={`text-sm font-bold ${activeFilter === 'extended' ? 'text-blue-100' : 'text-slate-500'}`}>{formatCurrency(counts.extendedAtasValue)}</span>
                        </div>
                        <p className={`text-[9px] font-bold mt-2 ${activeFilter === 'extended' ? 'text-blue-100' : 'text-blue-600'}`}>Clique para filtrar estas atas</p>
                    </div>
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:rotate-12 ${activeFilter === 'extended' ? 'bg-white/20' : 'bg-blue-50'}`}>
                        <RefreshCw className={`w-8 h-8 ${activeFilter === 'extended' ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                </button>
            </div>

            {/* ALERTAS */}
            {(counts.expired > 0 || counts.expiringSoon > 0) && (
                <div className="flex flex-wrap gap-4">
                    {counts.expired > 0 && <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-2xl shadow-sm shadow-red-100"><AlertTriangle className="w-5 h-5" /><span className="font-bold text-sm tracking-tight">{counts.expired} faturamentos vencidos!</span></div>}
                    {counts.expiringSoon > 0 && <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 px-5 py-3 rounded-2xl shadow-sm shadow-amber-100"><Clock className="w-5 h-5" /><span className="font-bold text-sm tracking-tight">{counts.expiringSoon} vencendo nos próximos 30 dias</span></div>}
                </div>
            )}

            {/* BUSCA E FILTROS */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 space-y-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Buscar por título, órgão, cidade ou número..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-slate-600 focus:ring-2 focus:ring-amber-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    {/* Filtros Dropdown */}
                    <div className="flex gap-2">
                        {/* Cidade */}
                        <div className="relative">
                            <button onClick={() => setOpenMenu(openMenu === 'city' ? null : 'city')} className={`h-14 px-6 rounded-2xl border text-xs font-bold uppercase flex items-center gap-2 transition-all ${filterCity.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}>
                                Cidade {filterCity.length > 0 && `(${filterCity.length})`} <ChevronDown className="w-4 h-4" />
                            </button>
                            {openMenu === 'city' && (
                                <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 min-w-[220px] p-3 max-h-60 overflow-y-auto">
                                    {uniqueCities.map(city => (
                                        <label key={city} className="flex items-center gap-2 p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer text-sm font-medium">
                                            <input type="checkbox" checked={filterCity.includes(city)} onChange={() => toggleFilter('city', city)} className="accent-amber-500 w-4 h-4 rounded" /> {city}
                                        </label>
                                    ))}
                                    {filterCity.length > 0 && <button onClick={() => setFilterCity([])} className="w-full text-center text-xs text-red-500 font-bold mt-2 pt-2 border-t border-slate-100 hover:text-red-600">Limpar Filtros</button>}
                                </div>
                            )}
                        </div>

                        {/* Empresa */}
                        <div className="relative">
                            <button onClick={() => setOpenMenu(openMenu === 'company' ? null : 'company')} className={`h-14 px-6 rounded-2xl border text-xs font-bold uppercase flex items-center gap-2 transition-all ${filterCompany.length > 0 ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}>
                                Empresa {filterCompany.length > 0 && `(${filterCompany.length})`} <ChevronDown className="w-4 h-4" />
                            </button>
                            {openMenu === 'company' && (
                                <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 min-w-[220px] p-3 max-h-60 overflow-y-auto">
                                    {uniqueCompanies.map(comp => (
                                        <label key={comp} className="flex items-center gap-2 p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer text-sm font-medium">
                                            <input type="checkbox" checked={filterCompany.includes(comp)} onChange={() => toggleFilter('company', comp)} className="accent-amber-500 w-4 h-4 rounded" /> {comp}
                                        </label>
                                    ))}
                                    {filterCompany.length > 0 && <button onClick={() => setFilterCompany([])} className="w-full text-center text-xs text-red-500 font-bold mt-2 pt-2 border-t border-slate-100 hover:text-red-600">Limpar Filtros</button>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Pills */}
                <div className="flex flex-wrap gap-2">
                    {filterButtons.map(btn => (
                        <button key={btn.key} onClick={() => setActiveFilter(btn.key)} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === btn.key ? `${btn.color} ring-4 ring-slate-100` : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                            {btn.label}{btn.count !== undefined && <span className="ml-1.5 opacity-60">({btn.count})</span>}
                        </button>
                    ))}
                    {activeFilter !== 'all' && (
                        <button onClick={() => setActiveFilter('all')} className="px-5 py-2.5 rounded-full text-[10px] font-black bg-red-50 text-red-600 uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-1.5">
                            <X className="w-3 h-3" /> Limpar Filtro
                        </button>
                    )}
                </div>

                {/* Indicadores de Filtros Ativos */}
                {(filterCity.length > 0 || filterCompany.length > 0) && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                        {filterCity.map(c => <span key={c} className="text-[10px] bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5">{c} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter('city', c)} /></span>)}
                        {filterCompany.map(c => <span key={c} className="text-[10px] bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5">{c} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter('company', c)} /></span>)}
                    </div>
                )}
            </div>

            {/* ORDENAÇÃO */}
            <div className="flex items-center justify-between px-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                    Mostrando <span className="text-slate-900">{filteredAtas.length}</span> resultados de <span className="text-slate-900">{atas.length}</span>
                </p>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ordenar por:</span>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {[
                            { key: 'vencimento', label: 'Prazo' },
                            { key: 'valor', label: 'Maior Valor' },
                            { key: 'cidade', label: 'Cidade' },
                        ].map(opt => (
                            <button key={opt.key} onClick={() => setSortBy(opt.key as any)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${sortBy === opt.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* LISTA DE CARDS */}
            <div className="space-y-4 pb-20">
                {filteredAtas.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-20 text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800">Nada encontrado aqui</h3>
                        <p className="text-slate-400 text-sm mt-1">Tente remover os filtros ou buscar por outro termo.</p>
                        <button onClick={() => { setActiveFilter('all'); setFilterCity([]); setFilterCompany([]); setSearchTerm(""); }} className="mt-6 text-sm font-black text-amber-600 hover:underline">Limpar todos os filtros</button>
                    </div>
                ) : (
                    filteredAtas.map(ata => (
                        <AtaCard
                            key={ata.id}
                            data={{
                                id: ata.id,
                                numero: ata.ataNumber,
                                status: ata.statusLabel,
                                tags: [
                                    ...(ata.isNew ? ['NOVA'] : []),
                                    ...(ata.isExtended ? ['ADITIVADA'] : []),
                                    ...(ata.canAdhere ? ['CARONA'] : []),
                                ],
                                objeto: ata.resolvedTitle,
                                cidade: ata.resolvedCity,
                                orgao: ata.resolvedAgency,
                                fornecedor: ata.company || '-',
                                valor_total: ata.value || 0,
                                data_inicio: ata.startDate,
                                data_vencimento: ata.endDate,
                                prorrogavel: ata.canExtend || false,
                                tem_pdf: !!ata.pdfUrl,
                                pdfUrl: ata.pdfUrl,
                                attachmentUrl: ata.attachmentUrl,
                            }}
                            onClick={() => router.push(`/atas/${ata.id}/edit`)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
