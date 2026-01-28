import React, { useState, useEffect } from "react";
import { Lock, Unlock, ArrowLeft, ArrowRight, ChevronUp, ChevronDown, RefreshCw, Maximize2, Minimize2 } from "lucide-react";

interface DashboardItem {
    id: string;
    colSpan: number; // Mudado de string fixa para number para flexibilidade 1-4
    rowSpan: number; // Novo: Altura em linhas
    component: React.ReactNode;
    title?: string;
}

export function EditableDashboard({ initialItems }: { initialItems: any[] }) {
    // Normalizar itens iniciais para o novo formato se necessário
    const [items, setItems] = useState<DashboardItem[]>(() =>
        initialItems.map((item, index) => {
            // Se colSpan já for numero, usa. Se for string 'col-span-X', converte.
            let initialCol = 1;
            if (typeof item.colSpan === 'number') initialCol = item.colSpan;
            else if (typeof item.colSpan === 'string') initialCol = parseInt(item.colSpan.replace('col-span-', '')) || 1;

            // Row span default
            const initialRow = item.rowSpan || 1;

            return {
                id: item.id || `item-${index}`,
                component: item.component,
                title: item.title,
                colSpan: initialCol,
                rowSpan: initialRow
            };
        })
    );
    const [isLocked, setIsLocked] = useState(true);

    // Carregar layout salvo
    useEffect(() => {
        const savedLayout = localStorage.getItem('dashboard_layout_v2'); // Versão 2 para novo formato
        if (savedLayout) {
            try {
                const parsedLayout = JSON.parse(savedLayout) as { id: string, colSpan: number, rowSpan: number }[];

                const newItems: DashboardItem[] = [];
                // Criar um mapa dos items ATUAIS (estado inicial vindo das props) para preservar os componentes React
                // Nota: items no state inicial já estão normalizados
                const initialItemsMap = new Map();
                initialItems.forEach((item, index) => {
                    const id = item.id || `item-${index}`;
                    initialItemsMap.set(id, item);
                });

                // 1. Reconstruir ordem e tamanhos salvos
                parsedLayout.forEach(savedItem => {
                    const originalItemData = initialItemsMap.get(savedItem.id);
                    if (originalItemData) {
                        newItems.push({
                            id: savedItem.id,
                            component: originalItemData.component,
                            title: originalItemData.title,
                            colSpan: savedItem.colSpan || 1,
                            rowSpan: savedItem.rowSpan || 1
                        });
                        initialItemsMap.delete(savedItem.id);
                    }
                });

                // 2. Adicionar itens novos que não estavam no salvo (mas estão nas props)
                initialItemsMap.forEach((itemData, id) => {
                    let initialCol = 1;
                    if (typeof itemData.colSpan === 'number') initialCol = itemData.colSpan;
                    else if (typeof itemData.colSpan === 'string') initialCol = parseInt(itemData.colSpan.replace('col-span-', '')) || 1;

                    newItems.push({
                        id: id,
                        component: itemData.component,
                        title: itemData.title,
                        colSpan: initialCol,
                        rowSpan: itemData.rowSpan || 1
                    });
                });

                if (newItems.length > 0) {
                    setItems(newItems);
                }
            } catch (e) {
                console.error("Erro ao carregar layout v2", e);
            }
        }
    }, []);

    // Salvar layout
    useEffect(() => {
        if (isLocked) {
            const layoutToSave = items.map((i: DashboardItem) => ({
                id: i.id,
                colSpan: i.colSpan,
                rowSpan: i.rowSpan
            }));
            localStorage.setItem('dashboard_layout_v2', JSON.stringify(layoutToSave));
        }
    }, [items, isLocked]);

    const moveItem = (index: number, direction: 'prev' | 'next') => {
        if (direction === 'prev' && index === 0) return;
        if (direction === 'next' && index === items.length - 1) return;

        const newItems = [...items];
        const targetIndex = direction === 'prev' ? index - 1 : index + 1;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        setItems(newItems);
    };

    const resizeItem = (index: number, dimension: 'width' | 'height', delta: number) => {
        const newItems = [...items];
        const item = newItems[index];

        if (dimension === 'width') {
            // Largura: min 1, limite 4 colunas no grid, mas aqui o usuário pediu sem limites. 
            // O grid tem 4 colunas, então span > 4 não faz sentido visualmente a menos que mudemos o grid.
            // Para "sem limite" real, vamos permitir até 4 (full width) e evitar overflow.
            const newCol = Math.max(1, Math.min(item.colSpan + delta, 4));
            item.colSpan = newCol;
        } else {
            // Altura: min 1, sem limite máximo
            const newRow = Math.max(1, item.rowSpan + delta);
            item.rowSpan = newRow;
        }

        setItems(newItems);
    };

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnter = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        const newItems = [...items];
        const draggedItemContent = newItems[draggedIndex];
        newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItemContent);
        setItems(newItems);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => setDraggedIndex(null);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    // Resetar Layout
    const resetLayout = () => {
        if (window.confirm("Restaurar layout padrão?")) {
            localStorage.removeItem('dashboard_layout_v2');
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header de Controle */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                <div className="flex items-center gap-2">
                    {!isLocked && (
                        <button onClick={resetLayout} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 font-bold bg-slate-50 px-2 py-1 rounded-lg">
                            <RefreshCw className="w-3 h-3" /> Restaurar Padrão
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setIsLocked(!isLocked)}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                        ${isLocked ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200 ring-2 ring-amber-200 ring-offset-2'}
                    `}
                >
                    {isLocked ? (
                        <><Lock className="w-3.5 h-3.5" /> <span>Bloqueado</span></>
                    ) : (
                        <><Unlock className="w-3.5 h-3.5" /> <span>Editar Layout</span></>
                    )}
                </button>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        draggable={!isLocked}
                        onDragStart={(e: React.DragEvent) => handleDragStart(e, index)}
                        onDragEnter={(e: React.DragEvent) => handleDragEnter(e, index)}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        style={{
                            gridColumn: `span ${item.colSpan}`,
                            gridRow: `span ${item.rowSpan}`
                        }}
                        className={`
                            relative transition-all duration-300 group
                            ${!isLocked ? 'cursor-move ring-2 ring-dashed ring-slate-300 rounded-[2.5rem] p-2 hover:ring-blue-400 bg-slate-50/50' : 'h-full'}
                            ${draggedIndex === index ? 'opacity-40 scale-95 ring-blue-500 bg-blue-50' : ''}
                        `}
                    >
                        {!isLocked && (
                            <div className="absolute -top-6 left-0 right-0 flex justify-center z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex flex-col items-center gap-1 pointer-events-auto bg-slate-800 text-white rounded-xl p-1.5 shadow-xl scale-90 border border-slate-600">

                                    {/* Linha 1: Largura e Posição */}
                                    <div className="flex items-center gap-2 border-b border-slate-700 pb-1 mb-1 w-full justify-center">
                                        <button onClick={(e) => { e.stopPropagation(); moveItem(index, 'prev') }} disabled={index === 0} className="p-1 hover:bg-slate-600 rounded disabled:opacity-30"><ArrowLeft className="w-3 h-3" /></button>

                                        <div className="flex items-center bg-black/30 rounded px-1">
                                            <button onClick={(e) => { e.stopPropagation(); resizeItem(index, 'width', -1) }} className="p-1 hover:text-cyan-400"><Minimize2 className="w-3 h-3" /></button>
                                            <span className="text-[9px] font-black w-10 text-center text-cyan-400 uppercase">LARG</span>
                                            <button onClick={(e) => { e.stopPropagation(); resizeItem(index, 'width', 1) }} className="p-1 hover:text-cyan-400"><Maximize2 className="w-3 h-3" /></button>
                                        </div>

                                        <button onClick={(e) => { e.stopPropagation(); moveItem(index, 'next') }} disabled={index === items.length - 1} className="p-1 hover:bg-slate-600 rounded disabled:opacity-30"><ArrowRight className="w-3 h-3" /></button>
                                    </div>

                                    {/* Linha 2: Altura */}
                                    <div className="flex items-center gap-1 justify-center w-full">
                                        <div className="flex items-center bg-black/30 rounded px-1 w-full justify-between">
                                            <button onClick={(e) => { e.stopPropagation(); resizeItem(index, 'height', -1) }} className="p-1 hover:text-amber-400"><ChevronUp className="w-3 h-3" /></button>
                                            <span className="text-[9px] font-black w-full text-center text-amber-400 uppercase">ALTURA</span>
                                            <button onClick={(e) => { e.stopPropagation(); resizeItem(index, 'height', 1) }} className="p-1 hover:text-amber-400"><ChevronDown className="w-3 h-3" /></button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        <div className={`h-full w-full ${!isLocked ? 'pointer-events-none opacity-80 scale-[0.98]' : ''}`}>
                            {item.component}
                        </div>
                    </div>
                ))}
            </div>

            {!isLocked && (
                <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-xs font-bold">
                    Editor Avançado: Controle largura (Horizontal) e altura (Vertical) livremente. Passe o mouse sobre o card para ver os controles.
                </div>
            )}
        </div>
    );
}
