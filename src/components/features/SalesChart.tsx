import { useTenders } from "@/context/TenderContext";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";

export function SalesChart() {
    const { tenders } = useTenders();

    const chartData = useMemo(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const months = [];

        // Gerar o ano completo: de Janeiro a Dezembro do ano atual
        for (let i = 0; i < 12; i++) {
            months.push(new Date(currentYear, i, 1));
        }

        return months.map(monthDate => {
            const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

            // Filtrar licitações deste mês pelo deadline
            const monthlyTenders = tenders.filter(t => {
                if (!t.deadline) return false;
                const tDate = new Date(t.deadline);
                return tDate >= startOfMonth && tDate <= endOfMonth;
            });

            const normalizeStatus = (s: string) => String(s || '').toLowerCase().trim();

            const isWon = (s: string) => ['won', 'ganha', 'ativa', 'concluída'].includes(normalizeStatus(s));
            const isPending = (s: string) => ['pending', 'in_progress', 'aguardando', 'em análise', 'running', 'em andamento', 'em disputa'].includes(normalizeStatus(s));

            const realized = monthlyTenders
                .filter(t => isWon(t.status))
                .reduce((acc, t) => acc + (t.wonValue || t.value || 0), 0);

            const pending = monthlyTenders
                .filter(t => isPending(t.status))
                .reduce((acc, t) => acc + (t.value || 0), 0);

            const total = realized + pending;

            return {
                month: monthDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase().slice(0, 3),
                fullDate: monthDate,
                realized,
                pending,
                total
            };
        });
    }, [tenders]);

    const maxTotal = Math.max(...chartData.map(d => d.total), 10000);

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Vendas & Previsão</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Visão mensal consolidada ({new Date().getFullYear()})</p>
                </div>
                <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest hidden sm:flex">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        <span className="text-slate-600">Realizado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                        <span className="text-slate-400">Em Aberto</span>
                    </div>
                </div>
            </div>

            <div className="flex items-end justify-between gap-2 flex-1 w-full min-h-[180px]">
                {chartData.map((item, index) => {
                    const totalHeightPercent = (item.total / maxTotal) * 100;

                    // Porcentagem do realizado dentro da barra total
                    const realizedPercentOfBar = item.total > 0 ? (item.realized / item.total) * 100 : 0;

                    const isCurrentMonth = new Date().getMonth() === item.fullDate.getMonth() &&
                        new Date().getFullYear() === item.fullDate.getFullYear();

                    return (
                        <div key={index} className="flex flex-col items-center flex-1 gap-3 h-full justify-end group cursor-pointer">
                            {/* Área da Barra */}
                            <div className="w-full flex justify-center items-end h-full relative">
                                {/* Barra Visual Empilhada (Stacked) */}
                                <div
                                    className={`w-3 sm:w-5 md:w-8 transition-all duration-500 rounded-t-sm overflow-hidden relative flex flex-col-reverse justify-start ${item.total === 0 ? 'bg-slate-50 h-[2px]' : 'bg-slate-200'}`}
                                    style={{ height: item.total === 0 ? '2px' : `${totalHeightPercent}%` }}
                                >
                                    {/* Parte Realizada (Azul) */}
                                    <div
                                        className={`w-full transition-all duration-700 ${isCurrentMonth ? 'bg-blue-600' : 'bg-slate-800'}`}
                                        style={{ height: `${realizedPercentOfBar}%` }}
                                    ></div>
                                </div>

                                {/* Tooltip Minimalista (Só no hover) */}
                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-3 py-2 rounded-lg pointer-events-none whitespace-nowrap z-10 flex flex-col items-center shadow-lg">
                                    <span className="font-bold">{formatCurrency(item.realized)}</span>
                                    {item.pending > 0 && <span className="text-slate-400 text-[9px] border-t border-slate-700 mt-1 pt-1 w-full text-center">+ {formatCurrency(item.pending)}</span>}
                                </div>
                            </div>

                            {/* Rótulo do Mês */}
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isCurrentMonth ? 'text-blue-600' : 'text-slate-300'}`}>
                                {item.month}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
