"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const raw = localStorage.getItem("licita_gestor_data");
            try {
                setData(raw ? JSON.parse(raw) : "Vazio");
            } catch (e) {
                setData("Erro ao parsear JSON");
            }
        }
    }, []);

    return (
        <div className="p-10 font-mono text-xs">
            <h1 className="text-xl font-bold mb-4">Diagnóstico de Dados (Raio-X)</h1>
            <pre className="bg-slate-100 p-4 rounded border overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
