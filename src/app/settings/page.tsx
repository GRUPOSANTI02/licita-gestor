"use client";

import { useTenders } from "@/context/TenderContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, AlertTriangle, Save, RefreshCw, Key, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const { tenders, atas } = useTenders();
    const { changePassword } = useAuth();

    // Password states
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [pwdStatus, setPwdStatus] = useState({ type: "", message: "" });

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setPwdStatus({ type: "", message: "" });

        if (newPwd !== confirmPwd) {
            setPwdStatus({ type: "error", message: "As novas senhas não coincidem." });
            return;
        }

        if (newPwd.length < 4) {
            setPwdStatus({ type: "error", message: "A senha deve ter pelo menos 4 caracteres." });
            return;
        }

        const result = changePassword(currentPwd, newPwd);
        if (result.success) {
            setPwdStatus({ type: "success", message: result.message });
            setCurrentPwd("");
            setNewPwd("");
            setConfirmPwd("");
        } else {
            setPwdStatus({ type: "error", message: result.message });
        }
    };

    const handleSmartFix = () => {
        let count = 0;
        const correctedTenders = tenders.map(t => {
            let changed = false;
            // Corrigir Cidade
            if (t.city === "Amabai") {
                t.city = "Amambai";
                changed = true;
            }
            // Corrigir Título
            if (t.title && t.title.includes("Amabai")) {
                t.title = t.title.replace("Amabai", "Amambai");
                changed = true;
            }
            if (changed) count++;
            return t;
        });

        if (count > 0) {
            // Forçamos a atualização do LocalStorage manualmente para garantir
            localStorage.setItem("licita_gestor_data", JSON.stringify(correctedTenders));
            // Recarregamos a página para refletir nos estados
            alert(`Sucesso! ${count} licitação(ões) de Amambai foram corrigidas.`);
            window.location.reload();
        } else {
            alert("Nenhum erro de grafia 'Amabai' foi encontrado. Seus dados parecem estar corretos.");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configurações</h1>
                <p className="text-slate-500 font-medium">Gestão de conta e ferramentas do sistema</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">

                {/* SEÇÃO ALTERAR SENHA */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Key className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">Segurança da Conta</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Alterar sua senha de acesso</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Senha Atual</label>
                            <input
                                required
                                type="password"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 transition-all"
                                placeholder="••••••••"
                                value={currentPwd}
                                onChange={(e) => setCurrentPwd(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nova Senha</label>
                            <input
                                required
                                type="password"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 transition-all"
                                placeholder="••••••••"
                                value={newPwd}
                                onChange={(e) => setNewPwd(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirmar Nova Senha</label>
                            <input
                                required
                                type="password"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 transition-all"
                                placeholder="••••••••"
                                value={confirmPwd}
                                onChange={(e) => setConfirmPwd(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {pwdStatus.message && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold animate-fade-in ${pwdStatus.type === "success" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
                                    }`}>
                                    {pwdStatus.type === "success" ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                    {pwdStatus.message}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ml-auto"
                            >
                                Atualizar Senha
                            </button>
                        </div>
                    </form>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* FERRAMENTA DE CORREÇÃO INTELIGENTE (SAFE) */}
                <div className="flex items-start gap-4 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                    <RefreshCw className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-black text-blue-700 text-lg mb-1">Corretor Automático</h3>
                        <p className="text-sm text-blue-600/80 mb-4">
                            Está vendo "Amabai" escrito errado e não consegue arrumar? Clique abaixo para o sistema varrer e corrigir todos os erros de digitação automaticamente.
                            <br /><span className="font-bold text-xs uppercase mt-1 inline-block">Seus outros dados estão seguros.</span>
                        </p>

                        <button
                            onClick={handleSmartFix}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Corrigir "Amabai" para "Amambai"
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Estatísticas do Sistema</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">Licitações</span>
                            <span className="text-2xl font-black text-slate-700">{tenders.length}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">Atas</span>
                            <span className="text-2xl font-black text-slate-700">{atas.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest opacity-50">
                LicitaGestor v1.5 • Build 2026
            </div>
        </div>
    );
}
