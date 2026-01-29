"use client";

import { Calendar, Download, FileText, MapPin, Building2, User, RefreshCw, XCircle } from "lucide-react";
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
    const statusColors = {
        'ATIVA': 'border-l-green-500 bg-green-50/30',
        'VENCE EM BREVE': 'border-l-amber-500 bg-amber-50/30',
        'VENCIDA': 'border-l-red-500 bg-red-50/30',
    };

    const statusBadgeColors = {
        'ATIVA': 'bg-green-100 text-green-700 border-green-200',
        'VENCE EM BREVE': 'bg-amber-100 text-amber-700 border-amber-200',
        'VENCIDA': 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${statusColors[data.status]} hover:shadow-md transition-all cursor-pointer group`}
        >
            <div className="flex flex-col md:flex-row">
                {/* LADO ESQUERDO - Informações Descritivas (65%) */}
                <div className="flex-1 md:w-[65%] p-5 space-y-3">
                    {/* Header: Número + Status + Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            Nº {data.numero}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${statusBadgeColors[data.status]}`}>
                            {data.status}
                        </span>
                        {data.tags.map((tag, i) => (
                            <span key={i} className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Objeto/Título */}
                    <h3 className="text-lg font-black text-slate-800 group-hover:text-amber-600 transition-colors leading-tight">
                        {data.objeto}
                    </h3>

                    {/* Metadados: Cidade, Órgão, Fornecedor */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {data.cidade}
                        </span>
                        <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {data.orgao}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                            <User className="w-3 h-3" />
                            {data.fornecedor}
                        </span>
                    </div>
                </div>

                {/* DIVISÓRIA VERTICAL */}
                <div className="hidden md:block w-px bg-slate-200 my-4" />

                {/* LADO DIREITO - Dados Quantitativos e Ações (35%) */}
                <div className="md:w-[35%] p-5 flex flex-col justify-between border-t md:border-t-0 border-slate-100">
                    {/* Valor */}
                    <div className="mb-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Valor Total</p>
                        <p className="text-2xl font-black text-slate-800">
                            {data.valor_total > 0 ? formatCurrency(data.valor_total) : <span className="text-slate-300 text-lg">R$ --</span>}
                        </p>
                    </div>

                    {/* Datas */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Início
                            </p>
                            <p className="text-sm font-bold text-slate-600">
                                {data.data_inicio ? formatDate(data.data_inicio) : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Vencimento
                            </p>
                            <p className={`text-sm font-bold ${data.status === 'VENCIDA' ? 'text-red-600' : data.status === 'VENCE EM BREVE' ? 'text-amber-600' : 'text-slate-600'}`}>
                                {data.data_vencimento ? formatDate(data.data_vencimento) : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        {/* Prorrogável */}
                        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded ${data.prorrogavel ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            {data.prorrogavel ? <RefreshCw className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {data.prorrogavel ? 'Prorrogável' : 'Não Prorrogável'}
                        </div>

                        {/* PDF */}
                        {data.tem_pdf && data.pdfUrl && (
                            <a
                                href={data.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                                <Download className="w-3 h-3" /> PDF
                            </a>
                        )}

                        {/* Editar (Ícone) */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                            className="ml-auto p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
