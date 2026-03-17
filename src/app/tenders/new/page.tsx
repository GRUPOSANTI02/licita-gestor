"use client";

import { useTenders } from "@/context/TenderContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save, DollarSign, CheckCircle2, MessageCircle, Plus, Home, Clock, Search, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatCurrency, maskCurrency, parseCurrencyToNumber } from "@/lib/utils";
import { generateSingleTenderWhatsAppLink } from "@/lib/whatsapp";
import { TenderStatus } from "@/types";

export default function NewTenderPage() {
    const { addTender } = useTenders();
    const router = useRouter();

    const [isSuccess, setIsSuccess] = useState(false);
    const [savedTender, setSavedTender] = useState<any>(null);

    // Integração PNCP
    const [searchQuery, setSearchQuery] = useState("");
    const [searchNumber, setSearchNumber] = useState("");
    const [searchModalidade, setSearchModalidade] = useState("TODAS");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoadingPNCP, setIsLoadingPNCP] = useState(false);
    const [errorPNCP, setErrorPNCP] = useState<string | null>(null);
    const [successPNCP, setSuccessPNCP] = useState(false);

    const searchPNCP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const combinacaoBusca = [searchQuery, searchNumber].filter(Boolean).join(" ");

        if (!combinacaoBusca.trim()) {
            setErrorPNCP("Digite uma palavra-chave ou o número do pregão para buscar.");
            return;
        }

        setIsLoadingPNCP(true);
        setErrorPNCP(null);
        setSearchResults([]);
        setSuccessPNCP(false);

        try {
            // Removendo a ordenação por data para deixar a API usar Relevância (quando possível)
            const url = `https://pncp.gov.br/api/search/?q=${encodeURIComponent(combinacaoBusca)}&tipos_documento=edital&uf=MS`;
            const response = await fetch(url);

            if (!response.ok) {
                 throw new Error("Erro na busca do PNCP.");
            }

            const data = await response.json();

            if (!data.items || data.items.length === 0) {
                setErrorPNCP("Nenhuma licitação encontrada com esse termo no Mato Grosso do Sul.");
            } else {
                // Filtro Local Obrigatório de Modalidade (se o usuário escolheu uma)
                let itemsFiltrados = data.items;
                if (searchModalidade !== "TODAS") {
                    itemsFiltrados = data.items.filter((i: any) => 
                        i.modalidade_licitacao_nome?.toLowerCase().includes(searchModalidade.toLowerCase())
                    );
                }

                if (itemsFiltrados.length === 0) {
                     setErrorPNCP(`Nenhum resultado encontrado para a modalidade selecionada (${searchModalidade}). Tente mudar o filtro ou a busca.`);
                     return;
                }

                // Filtro Local Inteligente para ranqueamento
                const termosDaBusca = combinacaoBusca.toLowerCase().replace(/['"-\/]/g, ' ').split(/\s+/).filter(Boolean);
                
                const resultadosRanqueados = itemsFiltrados.map((item: any) => {
                    let pontuacao = 0;
                    const conteudosParaVasculhar = [
                        item.title?.toLowerCase() || "",
                        item.description?.toLowerCase() || "",
                        item.orgao_nome?.toLowerCase() || "",
                        item.municipio_nome?.toLowerCase() || "",
                        item.ano || "",
                        item.numero_sequencial || ""
                    ].join(" ");

                    // Se preencheu o número exato
                    if (searchNumber.trim()) {
                        const partesNum = searchNumber.split("/");
                        if (partesNum[0] && item.numero_sequencial == partesNum[0].replace(/^0+/, '')) {
                            pontuacao += 50; 
                        }
                    }

                    // Vasculha palavra por palavra
                    termosDaBusca.forEach(termo => {
                        if (conteudosParaVasculhar.includes(termo)) {
                            pontuacao += 10;
                        }
                    });

                    return { ...item, _pontuacao: pontuacao };
                });

                // Ordena por pontuação
                let resultadosRefinados = resultadosRanqueados
                    .filter((item: any) => item._pontuacao > 0 || termosDaBusca.length === 0)
                    .sort((a: any, b: any) => b._pontuacao - a._pontuacao);
                
                if(resultadosRefinados.length === 0) resultadosRefinados = itemsFiltrados;

                setSearchResults(resultadosRefinados.slice(0, 10)); // Mostra os 10 melhores
            }
        } catch (err: any) {
            console.error("Erro na busca:", err);
            setErrorPNCP("Serviço do PNCP indisponível no momento.");
        } finally {
            setIsLoadingPNCP(false);
        }
    };

    const selectPNCPItoFillForm = async (item: any) => {
        setIsLoadingPNCP(true);
        setErrorPNCP(null);
        try {
            // A API do Governo foi atualizada em 2026. Endpoint antigo (/api/pncp/v1) retorna 301 Moved Permanently.
            // O endpoint correto para pegar os detalhes da compra é /api/consulta/v1/
            const url = `https://pncp.gov.br/api/consulta/v1/orgaos/${item.orgao_cnpj}/compras/${item.ano}/${item.numero_sequencial}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Erro ao buscar detalhes da licitação. O servidor do PNCP recusou a conexão.");
            
            const data = await response.json();

            setForm(prev => ({
                ...prev,
                title: data.objetoCompra || item.title || prev.title,
                value: data.valorTotalEstimado 
                    ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.valorTotalEstimado)
                    : prev.value,
                tenderNumber: data.numeroCompra ? `${data.numeroCompra}/${data.anoCompra}` : prev.tenderNumber,
                agency: data.orgaoEntidade?.razaoSocial || item.orgao_nome || prev.agency,
                city: item.municipio_nome && item.uf ? `${item.municipio_nome} - ${item.uf}` : prev.city,
                deadline: data.dataAberturaProposta ? data.dataAberturaProposta.slice(0, 16) : prev.deadline,
                description: data.modalidadeNome ? `Modalidade: ${data.modalidadeNome}` : prev.description,
                nextSessionDate: data.dataAberturaProposta ? data.dataAberturaProposta.slice(0, 16) : prev.nextSessionDate
            }));

            setSearchResults([]);
            setSearchQuery("");
            setSuccessPNCP(true);
            setTimeout(() => setSuccessPNCP(false), 5000);
        } catch (err: any) {
            console.error("Erro no preenchimento detalhado:", err);
            setErrorPNCP(err.message || "Ocorreu um erro inesperado ao importar os dados.");
        } finally {
            setIsLoadingPNCP(false);
        }
    };

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
        responsibleId: "1",
        sessionType: "eletronica" as "presencial" | "eletronica",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const newTender = {
                // ID será gerado no Context para garantir consistência
                tenderNumber: form.tenderNumber,
                title: form.title,
                agency: form.agency,
                city: form.city,
                value: parseCurrencyToNumber(form.value) || 0,
                wonValue: form.status === 'won' ? (parseCurrencyToNumber(form.wonValue) || 0) : undefined,
                status: form.status,
                deadline: form.deadline, // Passa string do input (YYYY-MM-DDTHH:mm), context trata
                description: form.description,
                editalUrl: form.editalUrl,
                nextSessionDate: form.nextSessionDate,
                responsibleId: "1",
                sessionType: form.sessionType,
            };

            await addTender(newTender);
            // setSavedTender é apenas para o modo visual de sucesso
            setSavedTender({ ...newTender, id: 'temp' });
            setIsSuccess(true);

        } catch (error: any) {
            console.error("Erro ao criar licitação:", error);
            alert(`Erro ao salvar: ${error.message || "Verifique os dados e tente novamente."}`);
        }
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
                                        nextSessionDate: "",
                                        responsibleId: "1",
                                        sessionType: "eletronica",
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
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nova Licitação</h1>
                    <p className="text-slate-500 font-medium">Preencha os detalhes para iniciar o acompanhamento.</p>
                </div>

                {/* Integração PNCP */}
                <div className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-200 relative overflow-hidden">
                    {/* Badge de Filtro Regional */}
                    <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-xl border-l border-b border-blue-200 flex items-center gap-1 shadow-sm">
                        📍 Filtrado: Somente Mato Grosso do Sul (MS)
                    </div>

                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2 mt-2">
                        <Search className="w-4 h-4" /> Busca Inteligente no PNCP (Preenchimento Automático)
                    </h3>
                    
                    <form onSubmit={searchPNCP} className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                            <div className="flex-[2]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Palavra-Chave / Órgão</label>
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Ex: Nova Alvorada do Sul, Computador..."
                                    className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 text-sm transition-all shadow-sm"
                                />
                            </div>
                            <div className="flex-[1]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Nº (Opcional)</label>
                                <input 
                                    type="text" 
                                    value={searchNumber}
                                    onChange={(e) => setSearchNumber(e.target.value)}
                                    placeholder="Ex: 04/2026"
                                    className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 text-sm transition-all shadow-sm"
                                />
                            </div>
                            <div className="flex-[1.5]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Modalidade</label>
                                <div className="relative">
                                    <select 
                                        value={searchModalidade}
                                        onChange={(e) => setSearchModalidade(e.target.value)}
                                        className="w-full h-14 pl-4 pr-10 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 text-sm transition-all shadow-sm cursor-pointer hover:border-blue-400 appearance-none truncate"
                                    >
                                        <option value="TODAS">👉 Todas as Modalidades</option>
                                        <option value="Pregão">Pregão Eletrônico / Presencial</option>
                                        <option value="Dispensa">Dispensa de Licitação</option>
                                        <option value="Inexigibilidade">Inexigibilidade</option>
                                        <option value="Concorrência">Concorrência Pública</option>
                                        <option value="Chamamento">Chamamento Público</option>
                                        <option value="Credenciamento">Credenciamento</option>
                                        <option value="Tomada de Preço">Tomada de Preço</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button 
                                    type="submit"
                                    disabled={isLoadingPNCP}
                                    className="h-14 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/30 w-full md:w-auto"
                                >
                                    {isLoadingPNCP ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                    Buscar
                                </button>
                            </div>
                        </div>
                    </form>

                    {searchResults.length > 0 && (
                        <div className="mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Selecione uma licitação abaixo:</span>
                            </div>
                            <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                                {searchResults.map((item, index) => (
                                    <li 
                                        key={item.id || index}
                                        onClick={() => selectPNCPItoFillForm(item)}
                                        className="p-4 hover:bg-blue-50 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 mb-1">{item.title}</h4>
                                                
                                                {/* Exibindo o Objeto/Descrição do Edital */}
                                                {item.description && (
                                                    <p className="text-xs text-slate-600 mb-2 italic line-clamp-2 bg-white/50 p-1 rounded">
                                                        "{item.description}"
                                                    </p>
                                                )}

                                                <p className="text-[10px] uppercase font-bold text-slate-400">
                                                    🏢 {item.orgao_nome} <span className="mx-1">•</span> 📍 {item.municipio_nome}/{item.uf}
                                                </p>
                                            </div>
                                            <div className="shrink-0 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 transition-colors hidden sm:block">
                                              Selecionar
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {errorPNCP && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm font-bold border border-red-100">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{errorPNCP}</p>
                        </div>
                    )}

                    {successPNCP && (
                        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 text-sm font-bold border border-green-100 animate-in fade-in">
                            <CheckCircle2 className="w-5 h-5" />
                            <p>Dados da licitação importados e preenchidos com sucesso!</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                                        (s as string) === 'running' ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200' :
                                                            'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200')
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        {s === 'pending' ? 'Pendente' : s === 'in_progress' ? 'Em Análise' : s === 'running' ? 'Em Andamento' : s === 'won' ? 'Ganha' : s === 'lost' ? 'Perdida' : 'Não Participou'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* TIPO DE SESSÃO */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tipo de Sessão</label>
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
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Valor Estimado / Edital</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                <input
                                    required
                                    type="text"
                                    placeholder="0,00"
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                                    value={form.value}
                                    onChange={(e) => setForm({ ...form, value: maskCurrency(e.target.value) })}
                                />
                            </div>
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
                            <p className="text-[10px] text-slate-400 font-bold ml-1">Opcional: Use se a sessão for suspensa.</p>
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
