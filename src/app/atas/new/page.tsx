"use client";

import { useTenders } from "@/context/TenderContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Save, Search, CheckCircle2, AlertTriangle, FileText, UploadCloud, Loader2, Building2, Home } from "lucide-react";
import Link from "next/link";
import { formatDate, maskCurrency, parseCurrencyToNumber } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

function NewAtaContent() {
    const { tenders, addAta } = useTenders();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTenderId = searchParams.get("tenderId") || "";

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTenderId, setSelectedTenderId] = useState(initialTenderId);

    // Atualiza se o parametro mudar (caso de navegação interna)
    useEffect(() => {
        if (initialTenderId) setSelectedTenderId(initialTenderId);
    }, [initialTenderId]);

    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [form, setForm] = useState({
        manualTitle: "",
        manualAgency: "",
        manualCity: "",
        ataNumber: "",
        startDate: "",
        endDate: "",
        canExtend: false,
        canAdhere: false,
        pdfUrl: "",
        attachmentUrl: "",
        company: "",
        isExtended: false,
        value: 0
    });

    const [displayValue, setDisplayValue] = useState("");



    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 50;

    // Filtra apenas licitações ganhas para vincular a ata
    // (Geralmente só se tem ata de licitação ganha, mas deixei aberto se quiser vincular a outras)
    const availableTenders = tenders
        .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.tenderNumber?.includes(searchTerm))
        .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTenderId && (!form.manualTitle || !form.manualAgency)) {
            alert("Se não vincular uma licitação, é obrigatório preencher o Objeto e o Órgão.");
            return;
        }

        let finalAttachmentUrl = form.attachmentUrl;

        // --- UPLOAD DO ARQUIVO ---
        if (selectedFile && isSupabaseConfigured) {
            setUploading(true);
            try {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Tenta fazer upload para o bucket 'ATAS' (precisa estar criado no Supabase)
                const { error: uploadError } = await supabase.storage
                    .from('ATAS')
                    .upload(filePath, selectedFile);

                if (uploadError) {
                    throw uploadError;
                }

                // Pega a URL pública
                const { data } = supabase.storage.from('ATAS').getPublicUrl(filePath);
                finalAttachmentUrl = data.publicUrl;

            } catch (error) {
                console.error("Erro no upload:", error);
                alert("Erro ao fazer upload do arquivo. Verifique se o bucket 'ATAS' existe no Supabase.");
                setUploading(false);
                return; // Para o salvamento se falhar o upload
            }
            setUploading(false);
        } else if (selectedFile && !isSupabaseConfigured) {
            alert("Aviso: Upload de arquivos não configurado (Supabase não detectado). A ata será salva sem o anexo.");
        }

        await addAta({
            tenderId: selectedTenderId || undefined,
            ...form,
            attachmentUrl: finalAttachmentUrl
        });

        router.push("/atas");
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link href="/atas" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                Voltar para Listagem
            </Link>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nova Ata de Registro</h1>
                    <p className="text-slate-500 font-medium">Cadastre os detalhes do contrato ou ata de registro de preços.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* SELEÇÃO DE LICITAÇÃO */}
                    <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Vincular Licitação (Opcional)
                            </label>
                            {selectedTenderId && (
                                <span className="text-xs font-black text-green-600 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Selecionada
                                </span>
                            )}
                        </div>

                        {!selectedTenderId ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Buscar licitação por nome, órgão ou número..."
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none font-medium text-slate-600 focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="max-h-60 overflow-y-auto space-y-2 mt-2 custom-scrollbar">
                                    {availableTenders.length > 0 ? availableTenders.map(t => (
                                        <div
                                            key={t.id}
                                            onClick={() => setSelectedTenderId(t.id)}
                                            className="p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600">{t.title}</h4>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${t.status === 'won' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {t.status === 'won' ? 'Ganha' : t.status === 'pending' ? 'Pendente' : t.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{t.agency} • {t.city}</p>
                                        </div>
                                    )) : (
                                        <p className="text-center text-slate-400 text-xs py-4">
                                            {searchTerm ? "Nenhuma licitação encontrada." : "Digite para buscar..."}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-white border-2 border-green-500 rounded-2xl shadow-sm">
                                <div>
                                    <p className="font-black text-slate-800">
                                        {tenders.find(t => t.id === selectedTenderId)?.title}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {tenders.find(t => t.id === selectedTenderId)?.agency}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedTenderId("")}
                                    className="text-xs font-bold text-red-500 hover:underline"
                                >
                                    Alterar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* CAMPOS MANUAIS (Se não houver licitação vinculada) */}
                    {!selectedTenderId && (
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Dados da Ata (Cadastro Avulso)</span>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Objeto / Descrição</label>
                                <input
                                    type="text"
                                    required={!selectedTenderId}
                                    placeholder="Ex: Aquisição de Material de Escritório"
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500"
                                    value={form.manualTitle}
                                    onChange={(e) => setForm({ ...form, manualTitle: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Órgão / Instituição</label>
                                    <input
                                        type="text"
                                        required={!selectedTenderId}
                                        placeholder="Ex: Prefeitura de Curitiba"
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500"
                                        value={form.manualAgency}
                                        onChange={(e) => setForm({ ...form, manualAgency: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Cidade</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Curitiba - PR"
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500"
                                        value={form.manualCity}
                                        onChange={(e) => setForm({ ...form, manualCity: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Empresa Detentora</label>
                                    <div className="relative group">
                                        <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            list="companies-ata"
                                            placeholder="A qual empresa pertence esta ata?"
                                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 transition-all uppercase"
                                            value={form.company}
                                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                                        />
                                        <datalist id="companies-ata">
                                            <option value="GRUPOSANTI" />
                                            <option value="SANTI TECNOLOGIA" />
                                            <option value="SANTI SERVICOS" />
                                        </datalist>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SE ESTIVER VINCULADO, MOSTRAR CAMPO DE EMPRESA TAMBÉM (PARA CASO QUEIRA ALTERAR) */}
                    {selectedTenderId && (
                        <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100/50 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-amber-600">Empresa Detentora (Validar)</label>
                                <div className="relative group">
                                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                                    <input
                                        required
                                        type="text"
                                        list="companies-ata"
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-amber-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 uppercase"
                                        value={form.company}
                                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200 mt-6">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Valores e Datas</span>
                    </div>

                    {/* LINHA DE IDENTIFICAÇÃO PRINCIPAL: NÚMERO E VALOR - REPOSICIONADO PARA VISIBILIDADE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Número da Ata</label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: 123/2026"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500"
                                value={form.ataNumber}
                                onChange={(e) => setForm({ ...form, ataNumber: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Valor da Ata (R$)</label>
                            <input
                                type="text"
                                placeholder="R$ 0,00"
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500"
                                value={displayValue}
                                onChange={(e) => {
                                    const masked = maskCurrency(e.target.value);
                                    setDisplayValue(masked);
                                    setForm({ ...form, value: parseCurrencyToNumber(masked) });
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Link Externo (Drive/Dropbox)</label>
                        <input
                            type="url"
                            placeholder="https://..."
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500"
                            value={form.pdfUrl}
                            onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
                        />
                    </div>



                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Opções Adicionais</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${form.canExtend ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-green-600"
                                    checked={form.canExtend}
                                    onChange={(e) => setForm({ ...form, canExtend: e.target.checked })}
                                />
                                <div>
                                    <span className="font-bold block text-sm">Prorrogável</span>
                                    <span className="text-xs opacity-70">Permite renovação de prazo</span>
                                </div>
                            </label>

                            <label className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${form.canAdhere ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-amber-600"
                                    checked={form.canAdhere}
                                    onChange={(e) => setForm({ ...form, canAdhere: e.target.checked })}
                                />
                                <div>
                                    <span className="font-bold block text-sm">Permite Adesão (Carona)</span>
                                    <span className="text-xs opacity-70">Outros órgãos podem aderir</span>
                                </div>
                            </label>

                            <label className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${form.isExtended ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-blue-600"
                                    checked={form.isExtended}
                                    onChange={(e) => setForm({ ...form, isExtended: e.target.checked })}
                                />
                                <div>
                                    <span className="font-bold block text-sm">Ata Aditivada</span>
                                    <span className="text-xs opacity-70">Marque se houve aditivo</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Observações</label>
                        <textarea
                            rows={4}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none resize-none font-medium text-slate-600 focus:ring-2 focus:ring-amber-500"
                            placeholder="Detalhes importantes sobre a ata..."
                            value={form.observations}
                            onChange={(e) => setForm({ ...form, observations: e.target.value })}
                        />
                    </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end">
                <button
                    type="submit"
                    disabled={uploading}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-amber-500/40 uppercase tracking-widest text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                    ) : (
                        <><Save className="w-5 h-5" /> Salvar Ata</>
                    )}
                </button>
            </div>
        </form>
            </div >
        </div >
    );
}

export default function NewAtaPage() {
    return (
        <Suspense fallback={<div className="p-10 flex justify-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <NewAtaContent />
        </Suspense>
    );
}
