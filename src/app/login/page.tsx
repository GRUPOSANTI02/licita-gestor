"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, User, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Pequeno delay para sensação de processamento
        setTimeout(() => {
            const success = login(username, password, rememberMe);
            if (!success) {
                setError("Usuário ou senha inválidos.");
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Elementos Decorativos de Fundo */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-md z-10">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 rounded-[40px] shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/40 rotate-3 transform transition-transform hover:rotate-0 duration-500">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight mb-2">LicitaGestor</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Acesso Restrito</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Usuário</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    required
                                    type="text"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl outline-none text-white font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase placeholder:normal-case"
                                    placeholder="Digite seu usuário..."
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    required
                                    type="password"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl outline-none text-white font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* MANTER CONECTADO */}
                        <div className="flex items-center gap-3 px-1">
                            <label className="relative flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Manter conectado</span>
                            </label>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-2xl border border-red-400/20 text-xs font-bold animate-shake">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20 transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Entrar no Sistema"
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                            © 2026 LicitaGestor • Gruposanti v1.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
