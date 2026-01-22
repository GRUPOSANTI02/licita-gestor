"use client";

import { useTenders } from "@/context/TenderContext";
import { Plus, Trash2, Calendar, MapPin, Building2, Pencil } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TendersPage() {
    const { tenders, deleteTender } = useTenders();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "won": return "bg-green-100 text-green-700 border-green-200";
            case "lost": return "bg-red-100 text-red-700 border-red-200";
            case "in_progress": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'won': return 'Ganha';
            case 'lost': return 'Perdida';
            case 'in_progress': return 'Em Análise';
            default: return 'Pendente';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Minhas Licitações</h1>
                    <p className="text-slate-500">Gerencie todas as suas oportunidades</p>
                </div>
                <Link
                    href="/tenders/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Nova Licitação
                </Link>
            </div>

            {tenders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500 mb-4">Nenhuma licitação cadastrada ainda.</p>
                    <Link href="/tenders/new" className="text-blue-600 font-semibold hover:underline">
                        Cadastre a primeira agora!
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {tenders.map((tender) => (
                        <div
                            key={tender.id}
                            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(tender.status)}`}>
                                        {getStatusLabel(tender.status)}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-800">{tender.title}</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                        {tender.agency}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {tender.city}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        Prazo: {formatDate(tender.deadline)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                <div className="text-right mr-4">
                                    <span className="block text-xs text-slate-400 uppercase font-semibold">Valor Estimado</span>
                                    <span className="text-lg font-bold text-slate-900">{formatCurrency(tender.value)}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Link
                                        href={`/tenders/${tender.id}/edit`}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar licitação"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </Link>

                                    <button
                                        onClick={() => {
                                            if (confirm('Tem certeza que deseja excluir esta licitação?')) {
                                                deleteTender(tender.id);
                                            }
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir licitação"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
