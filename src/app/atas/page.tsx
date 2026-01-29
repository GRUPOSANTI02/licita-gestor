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

    // Retirado o bloqueio de loading para permitir visualização
    // if (isLoading) {
    //     return <div className="p-10 text-center font-black animate-pulse">Carregando Atas...</div>;
    // }

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
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Atas</h1>
                        {isLoading && (
                            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full animate-pulse">
                                Carregando...
                            </span>
                        )}
                    </div>
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

            {/* SUMÁRIOS */}
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

            {/* ALERTAS */}
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

            {/* BUSCA E FILTROS HEADER (MANTIDO PARA BUSCA GLOBAL) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar geral..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium text-slate-600 focus:ring-2 focus:ring-amber-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
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

            {/* TABELA DE ATAS */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black tracking-widest text-slate-500">
                                <th className="p-4 whitespace-nowrap min-w-[100px]">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-800">
                                        Status <Filter className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="p-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-800">
                                        Vencimento <Filter className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="p-4 w-full min-w-[300px]">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-800">
                                        Objeto / Descrição <Filter className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="p-4 whitespace-nowrap min-w-[200px]">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-800">
                                        Órgão / Cidade <Filter className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="p-4 whitespace-nowrap min-w-[150px]">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-slate-800">
                                        Empresa <Filter className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="p-4 text-right whitespace-nowrap min-w-[150px]">
                                    <div className="flex items-center justify-end gap-2 cursor-pointer hover:text-slate-800">
                                        Valor Total <Filter className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="p-4 text-center w-[80px]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAtas.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-10 text-center text-slate-400 text-sm">
                                        Nenhuma ata encontrada com os filtros atuais.
                                    </td>
                                </tr>
                            ) : (
                                filteredAtas.map((ata, index) => {
                                    const relatedTender = tenders.find(t => t.id === ata.tenderId);
                                    const title = relatedTender?.title || ata.manualTitle || "Sem título";
                                    const agency = relatedTender?.agency || ata.manualAgency || "-";
                                    const city = relatedTender?.city || ata.manualCity || "-";
                                    const daysUntil = getDaysUntilExpiry(ata.endDate);
                                    const expiryStatus = getExpiryStatus(daysUntil);

                                    return (
                                        <tr
                                            key={ata.id}
                                            className={`group hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                                            onClick={() => window.location.href = `/atas/${ata.id}/edit`}
                                        >
                                            {/* STATUS */}
                                            <td className="p-4 align-top">
                                                <div className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide border ${expiryStatus.bgColor} ${expiryStatus.color} ${expiryStatus.borderColor}`}>
                                                    {expiryStatus.label === "ATIVE" ? "ATIVA" : expiryStatus.label}
                                                </div>
                                                {ata.isExtended && <div className="mt-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit uppercase">Aditivada</div>}
                                            </td>

                                            {/* VENCIMENTO */}
                                            <td className="p-4 align-top">
                                                <div className="font-bold text-slate-700 text-sm">{formatDate(ata.endDate)}</div>
                                                <div className="text-xs text-slate-400 mt-1">Início: {formatDate(ata.startDate)}</div>
                                            </td>

                                            {/* OBJETO */}
                                            <td className="p-4 align-top">
                                                <div className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors line-clamp-2">
                                                    {title}
                                                </div>
                                                <div className="mt-1 flex gap-2">
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">Nº {ata.ataNumber}</span>
                                                    {ata.canAdhere && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-bold">Carona</span>}
                                                </div>
                                            </td>

                                            {/* ORIGEM */}
                                            <td className="p-4 align-top">
                                                <div className="font-bold text-slate-700 text-xs">{agency}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{city}</div>
                                            </td>

                                            {/* EMPRESA */}
                                            <td className="p-4 align-top">
                                                {ata.company ? (
                                                    <div className="font-bold text-slate-600 text-xs uppercase flex items-center gap-1.5">
                                                        <Home className="w-3 h-3 text-slate-400" />
                                                        {ata.company}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 text-xs">-</span>
                                                )}
                                            </td>

                                            {/* VALOR */}
                                            <td className="p-4 align-top text-right">
                                                <div className="font-black text-slate-800 text-sm">
                                                    {ata.value ? formatCurrency(ata.value) : <span className="text-slate-300">R$ --</span>}
                                                </div>
                                            </td>

                                            {/* AÇÕES */}
                                            <td className="p-4 align-top text-center">
                                                <Link
                                                    href={`/atas/${ata.id}/edit`}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-all mx-auto"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
