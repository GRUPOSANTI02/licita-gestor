import { Tender } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MapPin, Calendar, Building2, Hash, DollarSign } from "lucide-react";

interface TenderCardProps {
    tender: Tender;
}

export function TenderCard({ tender }: TenderCardProps) {
    const statusColors = {
        won: "bg-green-100 text-green-700 border-green-200",
        lost: "bg-red-100 text-red-700 border-red-200",
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        in_progress: "bg-blue-100 text-blue-700 border-blue-200",
    };

    const statusLabels = {
        won: "Ganha",
        lost: "Perdida",
        pending: "Pendente",
        in_progress: "Em Análise",
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-xl transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusColors[tender.status]}`}>
                    {statusLabels[tender.status]}
                </span>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {tender.status === 'won' ? 'Valor Arrematado' : 'Valor Estimado'}
                    </p>
                    <p className={`text-lg font-black ${tender.status === 'won' ? 'text-green-600' : 'text-slate-900'}`}>
                        {formatCurrency(tender.status === 'won' && tender.wonValue ? tender.wonValue : tender.value)}
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
        </div>
    );
}
