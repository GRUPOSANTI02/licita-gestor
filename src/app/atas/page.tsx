"use client";

import Link from "next/link";
import { Plus, FileText, Calendar, Building2, Search, Filter, AlertCircle, CheckCircle2, XCircle, Clock, AlertTriangle, Home } from "lucide-react";
import { useTenders } from "@/context/TenderContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useState, useMemo } from "react";

// Função para calcular dias até o vencimento
function getDaysUntilExpiry(endDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(endDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Função para determinar o status de vencimento
function getExpiryStatus(daysUntil: number): { label: string; color: string; borderColor: string; bgColor: string } {
    if (daysUntil < 0) {
        return { label: "VENCIDA", color: "text-red-700", borderColor: "border-red-500", bgColor: "bg-red-50" };
    } else if (daysUntil <= 7) {
        return { label: `VENCE EM ${daysUntil} DIA${daysUntil === 1 ? '' : 'S'}`, color: "text-red-600", borderColor: "border-red-400", bgColor: "bg-red-50" };
    } else if (daysUntil <= 30) {
        return { label: `VENCE EM ${daysUntil} DIAS`, color: "text-amber-600", borderColor: "border-amber-400", bgColor: "bg-amber-50" };
    } else {
        return { label: "ATIVA", color: "text-green-600", borderColor: "border-green-400", bgColor: "bg-green-50" };
    }
}

type FilterType = "all" | "expired" | "expiring_soon" | "active" | "extendable" | "adhesion";

export default function AtasPage() {
    const { atas, tenders, isLoading } = useTenders();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");

    // Contadores para os alertas
    const counts = useMemo(() => {
        let expired = 0;
        let expiringSoon = 0;
        let active = 0;
        let newAtas = 0;
        let extendedAtas = 0;
        let newAtasValue = 0;
        let extendedAtasValue = 0;

        atas.forEach(ata => {
            const days = getDaysUntilExpiry(ata.endDate);
            if (days < 0) expired++;
            else if (days <= 30) expiringSoon++;
            else active++;

            const tender = tenders.find(t => t.id === ata.tenderId);
            // Prioriza o valor definido na Ata, depois tenta o valor ganho da licitação, depois o valor estimado
            const value = ata.value || (tender ? (tender.wonValue || tender.value || 0) : 0);

            if (ata.isExtended) {
                extendedAtas++;
                extendedAtasValue += value;
            } else {
                newAtas++;
                newAtasValue += value;
            }
        });

        return { expired, expiringSoon, active, newAtas, extendedAtas, newAtasValue, extendedAtasValue };
    }, [atas, tenders]);

    // Filtrar atas
    const filteredAtas = useMemo(() => {
        return atas.filter(ata => {
            const relatedTender = tenders.find(t => t.id === ata.tenderId);
            const title = relatedTender?.title || ata.manualTitle || "";
            const agency = relatedTender?.agency || ata.manualAgency || "";
            const city = relatedTender?.city || ata.manualCity || "";
            const searchLower = searchTerm.toLowerCase();

            // Filtro de busca
            const matchesSearch =
                title.toLowerCase().includes(searchLower) ||
                agency.toLowerCase().includes(searchLower) ||
                city.toLowerCase().includes(searchLower) ||
                (ata.company && ata.company.toLowerCase().includes(searchLower)) ||
                ata.ataNumber.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;

            // Filtro de status
            const days = getDaysUntilExpiry(ata.endDate);
            switch (activeFilter) {
                case "expired": return days < 0;
                case "expiring_soon": return days >= 0 && days <= 30;
                case "active": return days > 30;
                case "extendable": return ata.canExtend;
                case "adhesion": return ata.canAdhere;
                default: return true;
            }
        });
    }, [atas, tenders, searchTerm, activeFilter]);

    if (isLoading) {
        return <div className="p-10 text-center font-black animate-pulse">Carregando Atas...</div>;
    }

    const filterButtons: { key: FilterType; label: string; count?: number; color: string }[] = [
        { key: "all", label: "Todas", count: atas.length, color: "bg-slate-100 text-slate-600" },
        { key: "expired", label: "Vencidas", count: counts.expired, color: "bg-red-100 text-red-700" },
        { key: "expiring_soon", label: "Próx. Vencimento", count: counts.expiringSoon, color: "bg-amber-100 text-amber-700" },
        { key: "active", label: "Ativas", count: counts.active, color: "bg-green-100 text-green-700" },
        { key: "extendable", label: "Prorrogáveis", color: "bg-blue-100 text-blue-700" },
        { key: "adhesion", label: "Com Adesão", color: "bg-purple-100 text-purple-700" },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Atas</h1>
                    <p className="text-slate-500 font-medium">Acompanhe seus registros de preços e vencimentos.</p>
                </div>

                <Link
                    href="/atas/new"
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Nova Ata
                </Link>
            </div>

            {/* SUMÁRIOS DE TIPO DE ATA (NOVA E ADITIVADA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Atas Novas</p>
                        <div className="flex items-baseline gap-2">
                            <h4 className="text-2xl font-black text-slate-800">{counts.newAtas}</h4>
                            <span className="text-sm font-bold text-slate-500">{formatCurrency(counts.newAtasValue)}</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Atas Aditivadas</p>
                        <div className="flex items-baseline gap-2">
                            <h4 className="text-2xl font-black text-slate-800">{counts.extendedAtas}</h4>
                            <span className="text-sm font-bold text-slate-500">{formatCurrency(counts.extendedAtasValue)}</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                </div>
            </div>

            {/* ALERTAS DE VENCIMENTO */}
            {(counts.expired > 0 || counts.expiringSoon > 0) && (
                <div className="flex flex-wrap gap-4">
                    {counts.expired > 0 && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-2xl">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-bold text-sm">
                                {counts.expired} ata{counts.expired > 1 ? 's' : ''} vencida{counts.expired > 1 ? 's' : ''}!
                            </span>
                        </div>
                    )}
                    {counts.expiringSoon > 0 && (
                        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 px-5 py-3 rounded-2xl">
                            <Clock className="w-5 h-5" />
                            <span className="font-bold text-sm">
                                {counts.expiringSoon} ata{counts.expiringSoon > 1 ? 's' : ''} vencendo nos próximos 30 dias
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* BUSCA E FILTROS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                {/* Campo de Busca */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por título, órgão, cidade ou número da ata..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium text-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Botões de Filtro */}
                <div className="flex flex-wrap gap-2">
                    {filterButtons.map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => setActiveFilter(btn.key)}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${activeFilter === btn.key
                                ? `${btn.color} ring-2 ring-offset-1 ring-slate-400`
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            {btn.label}
                            {btn.count !== undefined && (
                                <span className="ml-1.5 opacity-70">({btn.count})</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* LISTA DE ATAS */}
            {filteredAtas.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">
                        {atas.length === 0 ? "Nenhuma Ata Registrada" : "Nenhuma ata encontrada"}
                    </h2>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                        {atas.length === 0
                            ? "Cadastre suas atas de registro de preços para controlar vigências e adesões."
                            : "Tente ajustar os filtros ou termo de busca."
                        }
                    </p>
                    {atas.length === 0 && (
                        <Link href="/atas/new" className="text-amber-600 font-black hover:underline uppercase tracking-widest text-xs">
                            Cadastrar Agora
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAtas.map((ata) => {
                        const relatedTender = tenders.find(t => t.id === ata.tenderId);

                        // Fallback para dados manuais se não tiver licitação vinculada
                        const title = relatedTender?.title || ata.manualTitle || "Ata sem Título";
                        const agency = relatedTender?.agency || ata.manualAgency || "Órgão não informado";
                        const city = relatedTender?.city || ata.manualCity || "Cidade não informada";

                        // Calcular status de vencimento
                        const daysUntil = getDaysUntilExpiry(ata.endDate);
                        const expiryStatus = getExpiryStatus(daysUntil);

                        return (
                            <Link href={`/atas/${ata.id}/edit`} key={ata.id} className="block group relative">
                                <div className={`bg-white p-6 rounded-3xl border-2 ${expiryStatus.borderColor} hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between`}>

                                    {/* BADGE DE STATUS DE VENCIMENTO */}
                                    <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${expiryStatus.bgColor} ${expiryStatus.color}`}>
                                        {expiryStatus.label}
                                    </div>

                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-amber-100 text-amber-700 p-2 rounded-full">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-100">
                                                Nº {ata.ataNumber}
                                            </span>
                                            <div className="flex gap-2">
                                                {ata.isExtended && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                        Aditivada
                                                    </span>
                                                )}
                                                {ata.canAdhere && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-purple-50 text-purple-700">
                                                        Carona
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            {/* CIDADE LOGO ACIMA DO OBJETO */}
                                            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 flex items-center gap-1">
                                                <i className="w-1 h-1 bg-amber-500 rounded-full inline-block"></i>
                                                {city}
                                            </div>

                                            <h3 className="text-lg font-black text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-amber-600 transition-colors">
                                                {title}
                                            </h3>
                                            <div className="flex flex-col gap-1 text-slate-500 text-xs font-bold">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                    {agency}
                                                </div>
                                                {ata.company && (
                                                    <div className="flex items-center gap-2 text-amber-600 font-black uppercase text-[10px]">
                                                        <Home className="w-3.5 h-3.5" />
                                                        {ata.company}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Início</p>
                                                <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {formatDate(ata.startDate)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencimento</p>
                                                <div className={`flex items-center justify-end gap-1.5 font-bold text-sm ${daysUntil < 0 ? 'text-red-600' : daysUntil <= 30 ? 'text-amber-600' : 'text-slate-700'}`}>
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    {formatDate(ata.endDate)}
                                                </div>
                                            </div>
                                            {/* VALOR DA ATA */}
                                            <div className="col-span-2 pt-2 border-t border-slate-50 mt-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Total</p>
                                                <p className="font-black text-slate-800 text-lg">
                                                    {ata.value ? formatCurrency(ata.value) : <span className="text-slate-300 font-medium text-sm">R$ 0,00 (Não informado)</span>}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4 flex-wrap">
                                            {ata.canExtend ? (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                                    <CheckCircle2 className="w-3 h-3" /> Prorrogável
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                    <XCircle className="w-3 h-3" /> Não Prorrogável
                                                </span>
                                            )}

                                            {/* BOTÃO BAIXAR PDF */}
                                            {ata.attachmentUrl && (
                                                <a
                                                    href={ata.attachmentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                                >
                                                    <FileText className="w-3 h-3" /> Baixar PDF
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
