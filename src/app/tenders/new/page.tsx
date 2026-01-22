"use client";

import { useTenders } from "@/context/TenderContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save, DollarSign } from "lucide-react";
import Link from "next/link";
import { formatCurrency, maskCurrency, parseCurrencyToNumber } from "@/lib/utils";
import { TenderStatus } from "@/types";

export default function NewTenderPage() {
    const { addTender } = useTenders();
    const router = useRouter();

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
        responsibleId: "1",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        addTender({
            tenderNumber: form.tenderNumber,
            title: form.title,
            agency: form.agency,
            city: form.city,
            value: parseCurrencyToNumber(form.value) || 0,
            wonValue: form.status === 'won' ? (parseCurrencyToNumber(form.wonValue) || 0) : undefined,
            status: form.status,
            deadline: form.deadline,
            description: form.description,
            responsibleId: "1",
        });

        router.push("/tenders");
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link href="/tenders" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                Voltar para Listagem
            </Link>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nova Licitação</h1>
                    <p className="text-slate-500 font-medium">Preencha os detalhes para iniciar o acompanhamento.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Status da Licitação</label>
                            <div className="flex flex-wrap gap-2">
                                {['pending', 'in_progress', 'won', 'lost'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setForm({ ...form, status: s as TenderStatus })}
                                        className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border-2 ${form.status === s
                                            ? (s === 'won' ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200' :
                                                s === 'lost' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200' :
                                                    'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200')
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        {s === 'pending' ? 'Pendente' : s === 'in_progress' ? 'Em Análise' : s === 'won' ? 'Ganha' : 'Perdida'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {form.status === 'won' && (
                            <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="p-6 bg-green-50 rounded-3xl border border-green-100 flex flex-col md:flex-row gap-6 items-end">
                                    <div className="flex-1 space-y-2 w-full">
                                        <label className="text-xs font-black uppercase tracking-widest text-green-600 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            Valor Real Arrematado (Ganhado)
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="R$ 0,00"
                                            className="w-full p-4 bg-white border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-black text-green-700 text-xl"
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
                                placeholder="Ex: São Paulo - SP"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nr do Pregão</label>
                            <input
                                type="text"
                                placeholder="Ex: 001/2026"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                                value={form.tenderNumber}
                                onChange={(e) => setForm({ ...form, tenderNumber: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Objeto / Título</label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: Aquisição de Notebooks Gamer"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Valor Estimado no Edital (R$)</label>
                            <input
                                required
                                type="text"
                                placeholder="R$ 0,00"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: maskCurrency(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Órgão Público</label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: Governo do Estado"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                                value={form.agency}
                                onChange={(e) => setForm({ ...form, agency: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Data e Hora Limite</label>
                            <input
                                required
                                type="datetime-local"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                                value={form.deadline}
                                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Descrição / Observações</label>
                        <textarea
                            rows={4}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none font-medium text-slate-600"
                            placeholder="Detalhes adicionais sobre o edital..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-500/40 uppercase tracking-widest text-sm"
                        >
                            <Save className="w-5 h-5" />
                            Salvar Licitação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
