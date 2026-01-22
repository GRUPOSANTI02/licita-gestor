export function SalesChart() {
    // Mock data for projections
    const data = [
        { month: 'Jan', value: 150000, projected: 140000 },
        { month: 'Fev', value: 0, projected: 300000 },
        { month: 'Mar', value: 0, projected: 450000 },
        { month: 'Abr', value: 0, projected: 400000 },
        { month: 'Mai', value: 0, projected: 550000 },
        { month: 'Jun', value: 0, projected: 600000 },
    ];

    const maxValue = Math.max(...data.map(d => d.projected));

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Projeção de Vendas</h3>
                <p className="text-sm text-slate-500">Estimativa baseada em licitações em aberto</p>
            </div>

            <div className="flex items-end justify-between gap-4 h-64 w-full">
                {data.map((item) => (
                    <div key={item.month} className="flex flex-col items-center flex-1 gap-2 group cursor-pointer">
                        <div className="relative w-full flex items-end justify-center h-full bg-slate-50 rounded-lg overflow-hidden">
                            {/* Barra de Projeção (Fundo) */}
                            <div
                                className="w-full bg-blue-100 absolute bottom-0 transition-all duration-500 group-hover:bg-blue-200"
                                style={{ height: `${(item.projected / maxValue) * 100}%` }}
                            ></div>

                            {/* Barra de Realizado (Frente) */}
                            {item.value > 0 && (
                                <div
                                    className="w-full bg-blue-600 absolute bottom-0 transition-all duration-500"
                                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                                ></div>
                            )}

                            {/* Tooltip on hover */}
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-slate-900 text-white text-xs rounded px-2 py-1 transition-opacity z-10 whitespace-nowrap">
                                Proj: R$ {(item.projected / 1000).toFixed(0)}k
                            </div>
                        </div>
                        <span className="text-sm font-medium text-slate-600">{item.month}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4 mt-6 justify-center text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-slate-600">Realizado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                    <span className="text-slate-600">Projeção</span>
                </div>
            </div>
        </div>
    );
}
