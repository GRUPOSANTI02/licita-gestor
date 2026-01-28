import { useTenders } from "@/context/TenderContext";
import { formatCurrency } from "@/lib/utils";
import { Tender } from "@/types";
import { useMemo } from "react";

export function SalesChart() {
    const { tenders } = useTenders();

    const chartData = useMemo(() => {
        const today = new Date();
        const months = [];

        // Gerar os próximos 6 meses (incluindo o atual)
        for (let i = 0; i < 6; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
            months.push(d);
        }

        return months.map(monthDate => {
            const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

            // Filtrar licitações deste mês
            const monthlyTenders = tenders.filter(t => {
                const tDate = new Date(t.deadline);
                return tDate >= startOfMonth && tDate <= endOfMonth;
            });

            // Calculando valores considerando rótulos pt-BR
            const projected = monthlyTenders
                .filter(t => t.status === 'pending' || t.status === 'in_progress' || t.status === 'Aguardando' || t.status === 'Em Análise')
                .reduce((acc, t) => acc + (t.value || 0), 0);

            const realized = monthlyTenders
                .filter(t => t.status === 'won' || t.status === 'Ganha')
                .reduce((acc, t) => acc + (t.wonValue || t.value || 0), 0);

            return {
                month: monthDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
                fullDate: monthDate,
                projected,
                value: realized
            };
        });
    }, [tenders]);

    const maxValue = Math.max(...chartData.map(d => Math.max(d.projected, d.value)), 1000); // 1000 como mínimo para evitar div/0

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Projeção de Vendas</h3>
                <p className="text-sm text-slate-500">Estimativa baseada nas licitações dos próximos 6 meses</p>
            </div>

            <div className="flex items-end justify-between gap-4 flex-1 w-full min-h-[200px]">
                {chartData.map((item, index) => {
                    // Garantir que não ultrapasse 100%
                    const projectedHeight = Math.min((item.projected / maxValue) * 100, 100);
                    const realizedHeight = Math.min((item.value / maxValue) * 100, 100);

                    return (
                        <div key={index} className="flex flex-col items-center flex-1 gap-2 group cursor-pointer h-full justify-end">
                            <div className="relative w-full flex items-end justify-center h-full bg-slate-50 rounded-lg overflow-hidden">
                                {/* Barra de Projeção (Fundo) */}
                                <div
                                    className="w-full bg-blue-100 absolute bottom-0 transition-all duration-500 group-hover:bg-blue-200"
                                    style={{ height: `${projectedHeight}%` }}
                                ></div>

                                {/* Barra de Realizado (Frente - sobreposta se houver, ou a maior?) 
                                    Geralmente barras empilhadas ou lado a lado. Aqui está sobreposta absoluta.
                                    Se Realizado > Projetado, ele cobre. Se Projetado > Realizado, o Realizado fica na frente menor.
                                */}
                                <div
                                    className="w-full bg-blue-600 absolute bottom-0 transition-all duration-500 opacity-90"
                                    style={{ height: `${realizedHeight}%` }}
                                ></div>

                                {/* Tooltip on hover */}
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 flex flex-col items-center bg-slate-900 text-white text-[10px] rounded p-2 transition-opacity z-20 pointer-events-none whitespace-nowrap shadow-xl">
                                    <span className="text-blue-200">Proj: {formatCurrency(item.projected)}</span>
                                    <span className="text-white font-bold">Real: {formatCurrency(item.value)}</span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{item.month}</span>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-4 mt-6 justify-center text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-slate-600">Realizado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                    <span className="text-slate-400">Projeção</span>
                </div>
            </div>
        </div>
    );
}
