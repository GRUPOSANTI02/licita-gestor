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
            const d = new Date(currentYear, i, 1);
            months.push(d);
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

            // Normalizar status para facilitar
            const normalizeStatus = (s: string) => String(s || '').toLowerCase().trim();

            const isPending = (s: string) =>
                ['pending', 'in_progress', 'aguardando', 'em análise', 'running', 'em andamento', 'em disputa'].includes(normalizeStatus(s));

            const isWon = (s: string) =>
                ['won', 'ganha', 'ativa', 'concluída'].includes(normalizeStatus(s));

            // Pendente: Soma dos values
            const pending = monthlyTenders
                .filter(t => isPending(t.status))
                .reduce((acc, t) => acc + (t.value || 0), 0);

            // Realizado: Soma dos wonValues (ou value se não tiver wonValue)
            const realized = monthlyTenders
                .filter(t => isWon(t.status))
                .reduce((acc, t) => acc + (t.wonValue || t.value || 0), 0);

            // Projeção Total do Mês = O que já ganhei + O que está na mesa para ganhar
            const totalPotential = pending + realized;

            return {
                month: monthDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase().slice(0, 3),
                fullDate: monthDate,
                projected: totalPotential, // Barra de fundo (Total Potencial)
                value: realized,           // Barra de frente (Já Realizado)
                pendingOnly: pending       // Apenas pendente (se precisar)
            };
        });
    }, [tenders]);

    const maxValue = Math.max(...chartData.map(d => d.projected), 10000);

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="mb-6 flex flex-col gap-1">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Performance Anual</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comparativo Potencial vs. Realizado ({new Date().getFullYear()})</p>
            </div>

            <div className="flex items-end justify-between gap-2 flex-1 w-full min-h-[200px]">
                {chartData.map((item, index) => {
                    // Garantir que não ultrapasse 100%
                    const projectedHeight = Math.min((item.projected / maxValue) * 100, 100);
                    const realizedHeight = Math.min((item.value / maxValue) * 100, 100);

                    // Verificar se é o mês atual
                    const isCurrentMonth = new Date().getMonth() === item.fullDate.getMonth() && new Date().getFullYear() === item.fullDate.getFullYear();

                    return (
                        <div key={index} className="flex flex-col items-center flex-1 gap-3 group cursor-pointer h-full justify-end">
                            <div className="relative w-full flex items-end justify-center h-full">
                                <div className="relative w-full h-full bg-slate-50 rounded-xl overflow-hidden ring-0 transition-all group-hover:ring-2 ring-blue-100 flex items-end">
                                    {/* Barra de Projeção (Fundo - Potencial Total) */}
                                    <div
                                        className={`w-full absolute bottom-0 transition-all duration-700 ease-out ${isCurrentMonth ? 'bg-blue-100' : 'bg-slate-100'} group-hover:bg-blue-200`}
                                        style={{ height: `${projectedHeight}%` }}
                                    ></div>

                                    {/* Barra de Realizado (Frente) */}
                                    <div
                                        className={`w-full absolute bottom-0 transition-all duration-700 ease-out ${isCurrentMonth ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-800'}`}
                                        style={{ height: `${realizedHeight}%` }}
                                    ></div>
                                </div>

                                {/* Tooltip Customizado */}
                                <div className="hidden group-hover:flex absolute bottom-full mb-3 flex-col bg-slate-900/95 backdrop-blur-md text-white text-[10px] rounded-xl p-3 z-50 shadow-xl border border-slate-700 min-w-[140px] animate-in fade-in slide-in-from-bottom-2">
                                    <span className="font-black text-white text-xs mb-2 border-b border-slate-700 pb-1 block uppercase tracking-wide">{item.month}</span>
                                    <div className="flex justify-between gap-3 text-slate-400">
                                        <span>Potencial:</span>
                                        <span className="font-bold text-slate-200">{formatCurrency(item.projected)}</span>
                                    </div>
                                    <div className="flex justify-between gap-3 text-emerald-400 mt-0.5">
                                        <span>Realizado:</span>
                                        <span className="font-bold text-emerald-300">{formatCurrency(item.value)}</span>
                                    </div>
                                    {item.pendingOnly > 0 && (
                                        <div className="flex justify-between gap-3 text-amber-500 mt-1 border-t border-slate-700/50 pt-1">
                                            <span>Em Jogo:</span>
                                            <span className="font-bold">{formatCurrency(item.pendingOnly)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider ${isCurrentMonth ? 'text-blue-600' : 'text-slate-300'}`}>{item.month}</span>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-6 mt-6 justify-center text-[10px] font-black uppercase tracking-widest border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    <span className="text-slate-600">Conquistado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                    <span className="text-slate-400">Potencial Total</span>
                </div>
            </div>
        </div>
    );
}
