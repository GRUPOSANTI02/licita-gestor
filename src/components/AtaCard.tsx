"use client";

import { Calendar, Download, FileText, MapPin, Building2, User, RefreshCw, XCircle, Star } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AtaCardData {
    id: string;
    numero: string;
    status: 'ATIVA' | 'VENCE EM BREVE' | 'VENCIDA';
    tags: string[];
    objeto: string;
    cidade: string;
    orgao: string;
    fornecedor: string;
    valor_total: number;
    data_inicio: string | null;
    data_vencimento: string | null;
    prorrogavel: boolean;
    tem_pdf: boolean;
    pdfUrl?: string;
}

interface AtaCardProps {
    data: AtaCardData;
    onClick?: () => void;
}

export function AtaCard({ data, onClick }: AtaCardProps) {
    const isNew = data.tags.includes('NOVA');
    const isExtended = data.tags.includes('ADITIVADA');

    // Tema Base (Novas vs Aditivadas vs Padrão)
    const themeStyles = isNew
        ? { border: 'border-l-amber-500', bg: 'bg-amber-50/20', iconColor: 'text-amber-600', badge: 'bg-amber-500 text-white' }
        : isExtended
            ? { border: 'border-l-blue-500', bg: 'bg-blue-50/20', iconColor: 'text-blue-600', badge: 'bg-blue-600 text-white' }
            : { border: 'border-l-slate-400', bg: 'bg-white', iconColor: 'text-slate-400', badge: 'bg-slate-100 text-slate-500' };

    const statusBadgeColors = {
        'ATIVA': 'text-green-600',
        'VENCE EM BREVE': 'text-amber-600 font-black',
        'VENCIDA': 'text-red-600 font-extrabold',
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl shadow-sm border border-slate-200 border-l-[6px] ${themeStyles.border} ${themeStyles.bg} hover:shadow-md transition-all cursor-pointer group relative overflow-hidden`}
        >
            <div className="flex flex-col md:flex-row">
                {/* LADO ESQUERDO - Status e Info (65%) */}
                <div className="flex-1 md:w-[65%] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                Nº {data.numero}
                            </span>

                            {isNew && (
                                <span className="flex items-center gap-1 text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded shadow-sm shadow-amber-200">
                                    <Star className="w-2.5 h-2.5 fill-white" /> NOVA
                                </span>
                            )}

                            {isExtended && (
                                <span className="flex items-center gap-1 text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded shadow-sm shadow-blue-200">
                                    <RefreshCw className="w-2.5 h-2.5" /> ADITIVADA
                                </span>
                            )}

                            {data.tags.filter(t => t !== 'NOVA' && t !== 'ADITIVADA').map((tag, i) => (
                                <span key={i} className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 border border-slate-200">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className={`text-[9px] font-black uppercase tracking-widest ${statusBadgeColors[data.status]}`}>
                            {data.status}
                        </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-amber-600 transition-colors">
                        {data.objeto}
                    </h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 items-center">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {data.cidade}
                        </div>
                        <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {data.orgao}
                        </div>
                        <div className="flex items-center gap-1 font-bold text-slate-600">
                            <User className="w-3 h-3 text-amber-600" />
                            {data.fornecedor}
                        </div>
                    </div>
                </div>

                {/* LADO DIREITO (35%) */}
                <div className="md:w-[35%] bg-white/40 backdrop-blur-sm p-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 opacity-70">VALOR DA ATA</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">
                            {data.valor_total > 0 ? formatCurrency(data.valor_total) : <span className="text-slate-300">R$ ---</span>}
                        </p>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-slate-400 flex items-center gap-1 uppercase">
                                <Calendar className="w-2.5 h-2.5" /> INÍCIO
                            </p>
                            <p className="text-[10px] font-bold text-slate-600">{data.data_inicio ? formatDate(data.data_inicio) : '-'}</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-slate-400 flex items-center gap-1 uppercase">
                                <Calendar className="w-2.5 h-2.5" /> FIM
                            </p>
                            <p className={`text-[10px] font-bold ${data.status === 'VENCIDA' ? 'text-red-600' : 'text-slate-600'}`}>{data.data_vencimento ? formatDate(data.data_vencimento) : '-'}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${data.prorrogavel ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-300'}`}>
                            <RefreshCw className={`w-2.5 h-2.5 ${data.prorrogavel ? 'animate-spin-slow' : ''}`} />
                            {data.prorrogavel ? 'Prorrogável' : 'Final'}
                        </div>

                        <div className="flex items-center gap-2">
                            {data.tem_pdf && (
                                <a href={data.pdfUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                    <Download className="w-3.5 h-3.5" />
                                </a>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); onClick?.(); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                <FileText className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
