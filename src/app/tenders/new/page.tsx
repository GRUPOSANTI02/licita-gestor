"use client";

import { useTenders } from "@/context/TenderContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save, DollarSign, CheckCircle2, MessageCircle, Plus, Home } from "lucide-react";
import Link from "next/link";
import { formatCurrency, maskCurrency, parseCurrencyToNumber } from "@/lib/utils";
import { generateSingleTenderWhatsAppLink } from "@/lib/whatsapp";
import { TenderStatus } from "@/types";

export default function NewTenderPage() {
    const { addTender } = useTenders();
    const router = useRouter();

    const [isSuccess, setIsSuccess] = useState(false);
    const [savedTender, setSavedTender] = useState<any>(null);

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
        responsibleId: "1",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newTender = {
            id: Math.random().toString(36).substr(2, 9),
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
            responsibleId: "1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        addTender(newTender);
        setSavedTender(newTender);
        setIsSuccess(true);
    };

    if (isSuccess && savedTender) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
                <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-12 max-w-xl w-full text-center animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>

                    <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Licitação Salva!</h1>
                    <p className="text-slate-500 font-bold mb-10 text-lg">Os dados foram registrados com sucesso.</p>

                    <div className="space-y-4">
                        <button
                            onClick={() => window.open(generateSingleTenderWhatsAppLink(savedTender), '_blank')}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-5 rounded-2xl flex items-center justify-center gap-4 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-black shadow-2xl shadow-emerald-500/40 text-sm uppercase tracking-widest"
                        >
                            <MessageCircle className="w-6 h-6" />
                            Avisar no WhatsApp
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setForm({
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
                                        responsibleId: "1",
                                    });
                                    setSavedTender(null);
                                    setIsSuccess(false);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest"
                            >
                                <Plus className="w-4 h-4" />
                                Nova
                            </button>
                            <Link
                                href="/"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20"
                            >
                                <Home className="w-4 h-4" />
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                {['pending', 'in_progress', 'won', 'lost', 'not_participated'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setForm({ ...form, status: s as TenderStatus })}
                                        className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border-2 ${form.status === s
                                            ? (s === 'won' ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200' :
                                                s === 'lost' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200' :
                                                    s === 'not_participated' ? 'bg-slate-600 border-slate-600 text-white shadow-lg shadow-slate-200' :
                                                        'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200')
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        {s === 'pending' ? 'Pendente' : s === 'in_progress' ? 'Em Análise' : s === 'won' ? 'Ganha' : s === 'lost' ? 'Perdida' : 'Não Participou'}
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

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Link do Edital (PDF / Site)</label>
                        <input
                            type="url"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                            placeholder="https://exemplo.com/edital.pdf"
                            value={form.editalUrl}
                            onChange={(e) => setForm({ ...form, editalUrl: e.target.value })}
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
