"use client";

import { useTenders } from "@/context/TenderContext";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, DollarSign, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import { maskCurrency, parseCurrencyToNumber } from "@/lib/utils";
import { TenderStatus } from "@/types";

export default function EditTenderPage() {
    const { tenders, updateTender, deleteTender, isLoading } = useTenders();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;

    const [form, setForm] = useState({
        tenderNumber: "",
        title: "",
        agency: "",
        city: "",
        value: "",
        wonValue: "",
        status: "pending" as TenderStatus,
        deadline: "",
        description: "",
        editalUrl: "",
        nextSessionDate: "",
        sessionType: "eletronica" as "presencial" | "eletronica",
    });

    // Helper para normalizar status de qualquer jeito
    const normalizeStatus = (s: string | undefined): TenderStatus => {
        if (!s) return 'pending';
        const clean = String(s).toLowerCase().trim();

        if (clean.includes('nao participou') || clean.includes('não participou') || clean === 'not_participated') return 'not_participated';
        if (clean.includes('em andamento') || clean === 'running') return 'running';
        if (clean === 'ganha' || clean === 'won') return 'won';
        if (clean === 'perdida' || clean === 'lost') return 'lost';
        if (clean.includes('em an') || clean === 'in_progress') return 'in_progress';
        if (clean === 'aguardando' || clean === 'pending') return 'pending';

        return clean as TenderStatus;
    };

    useEffect(() => {
        if (!isLoading) {
            const tender = tenders.find((t) => t.id === id);
            if (tender) {
                // Correção de Fuso Horário: Usar o valor salvo sem conversão UTC excessiva
                // Para inputs datetime-local, precisamos do formato YYYY-MM-DDTHH:mm
                // Versão Simplificada: Apenas pega os primeiros 16 caracteres (YYYY-MM-DDTHH:mm)
                // Se o banco salva em UTC, isso vai pegar o horário UTC. 
                // Se isso causar erro de 4h, voltaremos para o offset. Mas vamos testar o "cru" primeiro.
                const formatForInput = (dateStr: string | null | undefined) => {
                    if (!dateStr) return "";
                    // Tenta criar Date e converter para ISO local hack
                    const d = new Date(dateStr);
                    // O input datetime-local ESPERA o horário local do usuário.
                    // Se dateStr é UTC (termina em Z), new Date() converte para local internamente.
                    // Mas toISOString() converte de volta para UTC.
                    // O correto: 
                    const offset = d.getTimezoneOffset() * 60000;
                    const localDate = new Date(d.getTime() - offset);
                    return localDate.toISOString().slice(0, 16);
                };

                const safeStatus = normalizeStatus(tender.status);

                setForm({
                    tenderNumber: tender.tenderNumber || "",
                    title: tender.title,
                    agency: tender.agency,
                    city: tender.city,
                    value: maskCurrency(Math.round(tender.value * 100).toString()),
                    wonValue: tender.wonValue ? maskCurrency(Math.round(tender.wonValue * 100).toString()) : "",
                    status: safeStatus,
                    deadline: formatForInput(tender.deadline),
                    description: tender.description || "",
                    editalUrl: tender.editalUrl || "",
                    nextSessionDate: formatForInput(tender.nextSessionDate),
                    sessionType: tender.sessionType || "eletronica",
                });
            } else {
                router.push("/tenders");
            }
        }
    }, [id, tenders, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Debug visual para garantir que o status está certo ANTES de enviar
        // console.log("Salvando status:", form.status); 

        // Se for "not_participated", garante que vai assim
        const finalStatus = form.status;

        try {
            await updateTender(id, {
                tenderNumber: form.tenderNumber,
                title: form.title,
                agency: form.agency,
                city: form.city,
                value: parseCurrencyToNumber(form.value) || 0,
                wonValue: finalStatus === 'won' ? (parseCurrencyToNumber(form.wonValue) || 0) : undefined,
                status: finalStatus,
                deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined, // Salva como ISO UTC
                description: form.description,
                editalUrl: form.editalUrl,
                nextSessionDate: form.nextSessionDate ? new Date(form.nextSessionDate).toISOString() : undefined, // Salva como ISO UTC
                sessionType: form.sessionType,
            });

            // Alerta visual para o usuário
            alert("Licitação salva com sucesso! (Status: " + (finalStatus === 'not_participated' ? 'Não Participou' : finalStatus) + ")");

            const returnTo = searchParams.get("returnTo");
            router.push(returnTo || "/tenders");

        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            alert(`Erro ao salvar licitação: ${error.message || "Tente novamente."}`);
        }

        const returnTo = searchParams.get("returnTo");
        router.push(returnTo || "/tenders");
    };

    if (isLoading) return <div className="p-10 text-center font-black animate-pulse">Carregando dados...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link href="/tenders" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                Voltar para Listagem
            </Link>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight text-red-600">EDITAR LICITAÇÃO (TESTE DEBUG) <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full ml-2">v6.0</span></h1>
                    <p className="text-slate-500 font-medium">Atualize os detalhes da sua disputa.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* TIPO DE SESSÃO - MOVIDO PARA O TOPO PARA TESTE */}
                        <div className="space-y-2 md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tipo de Sessão (Teste Visibilidade)</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, sessionType: 'eletronica' })}
                                    className={`flex-1 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-3 ${form.sessionType === 'eletronica'
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                >
                                    🖥️ Eletrônica
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, sessionType: 'presencial' })}
                                    className={`flex-1 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-3 ${form.sessionType === 'presencial'
                                        ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                >
                                    🏛️ Presencial
                                </button>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Status da Licitação</label>
                            <div className="flex flex-wrap gap-2">
                                {['pending', 'in_progress', 'running', 'won', 'lost', 'not_participated'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setForm({ ...form, status: s as TenderStatus })}
                                        className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border-2 ${form.status === s
                                            ? (s === 'won' ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200' :
                                                s === 'lost' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200' :
                                                    s === 'not_participated' ? 'bg-slate-500 border-slate-500 text-white shadow-lg shadow-slate-200' :
                                                        (s as string) === 'running' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200' :
                                                            'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200')
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        {s === 'pending' ? 'Pendente' : s === 'in_progress' ? 'Em Análise' : s === 'running' ? 'Em Andamento' : s === 'won' ? 'Ganha' : s === 'lost' ? 'Perdida' : 'Não Participou'}
                                    </button>
                                ))}
                            </div>
                        </div>



                        {/* Won Value */}
                        {form.status === 'won' && (
                            <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-4">
                                <div className="p-6 bg-green-50 rounded-3xl border border-green-100 flex flex-col md:flex-row gap-6 items-end">
                                    <div className="flex-1 space-y-2 w-full">
                                        <label className="text-xs font-black uppercase tracking-widest text-green-600 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            Valor Real Arrematado (Ganhado)
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-4 bg-white border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-black text-green-700 text-xl"
                                            value={form.wonValue}
                                            onChange={(e) => setForm({ ...form, wonValue: maskCurrency(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Cidade - UF</label>
                            <input
                                required
                                type="text"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nr do Pregão</label>
                            <input
                                type="text"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                value={form.tenderNumber}
                                onChange={(e) => setForm({ ...form, tenderNumber: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Objeto / Título</label>
                            <input
                                required
                                type="text"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Valor Estimado (R$)</label>
                            <input
                                required
                                type="text"
                                placeholder="R$ 0,00"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: maskCurrency(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Órgão Público</label>
                            <input
                                required
                                type="text"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                value={form.agency}
                                onChange={(e) => setForm({ ...form, agency: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Data e Hora Limite</label>
                            <input
                                required
                                type="datetime-local"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                value={form.deadline}
                                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Próxima Sessão / Retomada
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full p-4 bg-amber-50 border border-amber-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-bold text-slate-700"
                                value={form.nextSessionDate}
                                onChange={(e) => setForm({ ...form, nextSessionDate: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-400 font-bold ml-1">Opcional: Preencha se a sessão foi suspensa.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Descrição</label>
                        <textarea
                            rows={4}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none resize-none font-medium text-slate-600"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Link do Edital (PDF / Site)</label>
                        <input
                            type="url"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
                            placeholder="https://exemplo.com/edital.pdf"
                            value={form.editalUrl}
                            onChange={(e) => setForm({ ...form, editalUrl: e.target.value })}
                        />
                    </div>

                    {/* BLOCO NO FINAL (FORA DE GRID COMPLICADO) */}
                    <div className="bg-slate-100 p-6 rounded-2xl border-2 border-slate-300 mt-8 mb-8">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 block">Tipo de Sessão (FINAL TESTE)</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, sessionType: 'eletronica' })}
                                className={`flex-1 p-4 rounded-xl font-bold uppercase transition-all border-2 ${form.sessionType === 'eletronica' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400'}`}
                            >
                                🖥️ Eletrônica
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, sessionType: 'presencial' })}
                                className={`flex-1 p-4 rounded-xl font-bold uppercase transition-all border-2 ${form.sessionType === 'presencial' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-400'}`}
                            >
                                🏛️ Presencial
                            </button>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm("Tem certeza que deseja EXCLUIR esta licitação? A ação não pode ser desfeita.")) {
                                    deleteTender(id);
                                    router.push("/tenders");
                                }
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-sm"
                        >
                            <Trash2 className="w-5 h-5 mr-2 inline" />
                            Excluir
                        </button>

                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black transition-all transform hover:scale-[1.02] shadow-2xl shadow-blue-500/40 uppercase tracking-widest text-sm"
                        >
                            <Save className="w-5 h-5 mr-3 inline" />
                            Atualizar Licitação
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
