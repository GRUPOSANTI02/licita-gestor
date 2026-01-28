"use client";

import { useTenders } from "@/context/TenderContext";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { formatCurrency, maskCurrency, parseCurrencyToNumber } from "@/lib/utils";
import { TenderStatus } from "@/types";

export default function EditTenderPage() {
    const { tenders, updateTender, isLoading } = useTenders();
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
    });

    useEffect(() => {
        if (!isLoading) {
            const tender = tenders.find((t) => t.id === id);
            if (tender) {
                setForm({
                    tenderNumber: tender.tenderNumber || "",
                    title: tender.title,
                    agency: tender.agency,
                    city: tender.city,
                    value: maskCurrency(Math.round(tender.value * 100).toString()),
                    wonValue: tender.wonValue ? maskCurrency(Math.round(tender.wonValue * 100).toString()) : "",
                    status: tender.status,
                    deadline: tender.deadline ? new Date(tender.deadline).toISOString().slice(0, 16) : "",
                    description: tender.description || "",
                    editalUrl: tender.editalUrl || "",
                    nextSessionDate: tender.nextSessionDate ? new Date(tender.nextSessionDate).toISOString().slice(0, 16) : "",
                });
            } else {
                router.push("/tenders");
            }
        }
    }, [id, tenders, isLoading, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        updateTender(id, {
            tenderNumber: form.tenderNumber,
            title: form.title,
            agency: form.agency,
            city: form.city,
            value: parseCurrencyToNumber(form.value) || 0,
            wonValue: form.status === 'won' ? (parseCurrencyToNumber(form.wonValue) || 0) : undefined,
            status: form.status,
            deadline: form.deadline,
            description: form.description,
            editalUrl: form.editalUrl,
            nextSessionDate: form.nextSessionDate,
        });

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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Editar Licitação</h1>
                    <p className="text-slate-500 font-medium">Atualize os detalhes da sua disputa.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                                    s === 'not_participated' ? 'bg-slate-600 border-slate-600 text-white shadow-lg shadow-slate-200' :
                                                        s === 'running' ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200' :
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

                    <div className="pt-8 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black transition-all transform hover:scale-[1.02] shadow-2xl shadow-blue-500/40 uppercase tracking-widest text-sm"
                        >
                            <Save className="w-5 h-5 mr-3 inline" />
                            Atualizar Licitação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
