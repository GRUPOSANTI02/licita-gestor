"use client";

import { Tender } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MapPin, Calendar, Building2, Hash, DollarSign, FileText, ExternalLink, AlertTriangle, Plus, CheckCircle2 } from "lucide-react";
import { useTenders } from "@/context/TenderContext";
import Link from "next/link";

interface TenderCardProps {
    tender: Tender;
}

export function TenderCard({ tender }: TenderCardProps) {
    const { atas } = useTenders();

    const statusColors: any = {
        won: "bg-green-100 text-green-700 border-green-200",
        lost: "bg-red-100 text-red-700 border-red-200",
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        in_progress: "bg-blue-100 text-blue-700 border-blue-200",
        not_participated: "bg-slate-100 text-slate-700 border-slate-200",
        'Ganha': "bg-green-100 text-green-700 border-green-200",
        'Perdida': "bg-red-100 text-red-700 border-red-200",
        'Aguardando': "bg-amber-100 text-amber-700 border-amber-200",
        'Em Análise': "bg-blue-100 text-blue-700 border-blue-200",
        'Não Participou': "bg-slate-100 text-slate-700 border-slate-200",
    };

    const statusLabels: any = {
        won: "Ganha",
        lost: "Perdida",
        pending: "Aguardando",
        in_progress: "Em Análise",
        not_participated: "Não Participou",
        'Ganha': "Ganha",
        'Perdida': "Perdida",
        'Aguardando': "Aguardando",
        'Em Análise': "Em Análise",
        'Não Participou': "Não Participou",
    };

    const isWon = tender.status === 'won' || tender.status === 'Ganha';
    const linkedAta = atas.find(a => a.tenderId === tender.id);

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            {/* Aviso de Ata Pendente - Fixado no topo ou discreto */}
            {isWon && !linkedAta && (
                <div className="absolute top-0 right-0 left-0 bg-yellow-50 border-b border-yellow-100 px-4 py-1.5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-yellow-700">
                        <AlertTriangle className="w-3 h-3" />
                        Ata Pendente
                    </div>
                </div>
            )}
            {/* Badge de Ata Vinculada */}
            {isWon && linkedAta && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-2xl shadow-sm z-10">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" />
                        Ata Vinculada
                    </div>
                </div>
            )}

            <div className={`flex justify-between items-start mb-4 ${isWon ? 'mt-4' : ''}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusColors[tender.status]}`}>
                    {statusLabels[tender.status]}
                </span>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {isWon ? 'Valor Arrematado' : 'Valor Estimado'}
                    </p>
                    <p className={`text-lg font-black ${isWon ? 'text-green-600' : 'text-slate-900'}`}>
                        {formatCurrency(isWon && tender.wonValue ? tender.wonValue : tender.value)}
                    </p>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{tender.city}</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {tender.title}
                </h3>
                {tender.tenderNumber && (
                    <div className="mt-2 flex items-center gap-1.5 text-slate-400">
                        <Hash className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold italic">Pregão: {tender.tenderNumber}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-500">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold truncate">{tender.agency}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 justify-end">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold">{formatDate(tender.deadline)}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                {tender.editalUrl && (
                    <a
                        href={tender.editalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors py-2 px-4 bg-blue-50 rounded-xl w-fit flex-1 justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Edital</span>
                    </a>
                )}

                {/* Botão de Anexar Ata (Só se ganha e sem ata) */}
                {isWon && !linkedAta && (
                    <Link
                        href={`/atas/new?tenderId=${tender.id}`}
                        className="flex items-center gap-2 text-yellow-700 hover:text-yellow-900 transition-colors py-2 px-4 bg-yellow-100 hover:bg-yellow-200 rounded-xl flex-1 justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Anexar Ata</span>
                    </Link>
                )}

                {/* Botão Ver Ata (Se já tem ata) */}
                {isWon && linkedAta && (
                    <Link
                        href="/atas" // Poderia ir para detalhes da ata específico, mas listagem é ok por enquanto
                        className="flex items-center gap-2 text-green-700 hover:text-green-900 transition-colors py-2 px-4 bg-green-100 hover:bg-green-200 rounded-xl flex-1 justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ver Ata</span>
                    </Link>
                )}
            </div>
        </div>
    );
}
