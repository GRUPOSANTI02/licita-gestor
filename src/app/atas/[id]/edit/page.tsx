"use client";

import { useTenders } from "@/context/TenderContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Search, CheckCircle2, AlertTriangle, FileText, UploadCloud, Loader2, Trash2, Home, Building2 } from "lucide-react";
import Link from "next/link";
import { formatDate, maskCurrency, parseCurrencyToNumber } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function EditAtaPage({ params }: { params: { id: string } }) {
    const { atas, tenders, updateAta, deleteAta } = useTenders();
    const router = useRouter();
    const ataId = params.id;

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTenderId, setSelectedTenderId] = useState("");

    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        observations: "",
        company: "",
        isExtended: false,
        value: 0
    });

    const [displayValue, setDisplayValue] = useState("");

    const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 50;

    // Load existing data
    useEffect(() => {
        if (atas.length > 0) {
            const existingAta = atas.find(a => a.id === ataId);
            if (existingAta) {
                setForm({
                    manualTitle: existingAta.manualTitle || "",
                    manualAgency: existingAta.manualAgency || "",
                    manualCity: existingAta.manualCity || "",
                    ataNumber: existingAta.ataNumber,
                    startDate: existingAta.startDate.split('T')[0],
                    endDate: existingAta.endDate.split('T')[0],
                    canExtend: existingAta.canExtend,
                    canAdhere: existingAta.canAdhere,
                    pdfUrl: existingAta.pdfUrl || "",
                    attachmentUrl: existingAta.attachmentUrl || "",
                    observations: existingAta.observations || "",
                    company: existingAta.company || "",
                    isExtended: existingAta.isExtended || false,
                    value: existingAta.value || 0
                });
                if (existingAta.value) {
                    setDisplayValue(maskCurrency((existingAta.value * 100).toString()));
                }
                if (existingAta.tenderId) {
                    setSelectedTenderId(existingAta.tenderId);
                }
                setIsLoadingData(false);
            } else {
                setIsLoadingData(false);
            }
        }
    }, [atas, ataId]);




    // Filtra licitações para vincular
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

        let finalAttachmentUrl = form.attachmentUrl;

        // --- UPLOAD DO ARQUIVO ---
        if (selectedFile && isSupabaseConfigured) {
            setUploading(true);
            try {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage.from('atas').upload(filePath, selectedFile);
                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('atas').getPublicUrl(filePath);
                finalAttachmentUrl = data.publicUrl;
            } catch (error) {
                console.error("Erro no upload:", error);
                alert("Erro ao fazer upload. Salvando sem anexo atualizado.");
            }
            setUploading(false);
        }

        await updateAta(ataId, {
            tenderId: selectedTenderId || undefined,
            ...form,
            attachmentUrl: finalAttachmentUrl
        });

        router.push("/atas");
    };

    // FUNÇÃO DE EXCLUIR
    const handleDelete = async () => {
        setIsDeleting(true);
        await deleteAta(ataId);
        router.push("/atas");
    };

    if (isLoadingData) {
        return (
            <div className="p-10 flex justify-center text-amber-500"><Loader2 className="w-8 h-8 animate-spin" /></div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link href="/atas" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                Voltar para Listagem
            </Link>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Editar Ata de Registro</h1>
                        <p className="text-slate-500 font-medium">Atualize os detalhes do contrato ou ata.</p>
                    </div>

                    {/* BOTÃO EXCLUIR */}
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all border border-red-200"
                    >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                    </button>
                </div>

                {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-7 h-7 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Excluir Ata?</h3>
                                    <p className="text-slate-500 text-sm">Esta ação não pode ser desfeita.</p>
                                </div>
                            </div>

                            <p className="text-slate-600 mb-8">
                                Tem certeza que deseja excluir a ata <strong>Nº {form.ataNumber}</strong>?
                                Todos os dados serão permanentemente removidos.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isDeleting ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Excluindo...</>
                                    ) : (
                                        <><Trash2 className="w-5 h-5" /> Confirmar Exclusão</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                                                    {t.status === 'won' ? 'Ganha' : t.status}
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
                                        {tenders.find(t => t.id === selectedTenderId)?.title || "Licitação (Título não encontrado)"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {tenders.find(t => t.id === selectedTenderId)?.agency || "Órgão não encontrado"}
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
                                            list="companies-ata-edit"
                                            placeholder="A qual empresa pertence esta ata?"
                                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 transition-all uppercase"
                                            value={form.company}
                                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                                        />
                                        <datalist id="companies-ata-edit">
                                            <option value="GRUPOSANTI" />
                                            <option value="SANTI TECNOLOGIA" />
                                            <option value="SANTI SERVICOS" />
                                        </datalist>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SE ESTIVER VINCULADO, MOSTRAR CAMPO DE EMPRESA TAMBÉM */}
                    {selectedTenderId && (
                        <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100/50 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-amber-600">Empresa Detentora (Validar)</label>
                                <div className="relative group">
                                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                                    <input
                                        required
                                        type="text"
                                        list="companies-ata-edit"
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-amber-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 uppercase"
                                        value={form.company}
                                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}


                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200 mt-6 md:col-span-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Valores e Datas</span>
                    </div>

                    {/* LINHA DE IDENTIFICAÇÃO PRINCIPAL: NÚMERO E VALOR */}
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

                        {/* UPLOAD DE ARQUIVO */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">OU Anexar Arquivo (PDF)</label>
                            <div className={`border-2 border-dashed rounded-2xl p-6 transition-colors text-center ${selectedFile ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    id="file-upload"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer block w-full h-full">
                                    {selectedFile ? (
                                        <div className="flex flex-col items-center text-green-700">
                                            <CheckCircle2 className="w-8 h-8 mb-2" />
                                            <span className="font-bold text-sm">{selectedFile.name}</span>
                                            <span className="text-xs opacity-70">Clique para alterar (substitui o anterior)</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400">
                                            <UploadCloud className="w-8 h-8 mb-2" />
                                            {form.attachmentUrl ? (
                                                <div className="text-center">
                                                    <span className="font-bold text-sm text-green-600 block mb-1">Arquivo já anexado!</span>
                                                    <span className="text-xs text-slate-500 block">Clique para substituir</span>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <span className="font-bold text-sm text-slate-600">Clique para selecionar arquivo</span>
                                                    <span className="text-xs block">Apenas PDF (Máx 10MB)</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Início da Vigência</label>
                            <input
                                required
                                type="date"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Fim da Vigência</label>
                            <input
                                required
                                type="date"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            />
                        </div>
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
                        <><Save className="w-5 h-5" /> Atualizar Ata</>
                    )}
                </button>
            </div>
        </form >
            </div >
        </div >
    );
}
