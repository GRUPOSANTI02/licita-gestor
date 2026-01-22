"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Tender } from "@/types";
import { MOCK_TENDERS } from "@/services/mockData";

interface TenderContextType {
    tenders: Tender[];
    addTender: (tender: Omit<Tender, "id" | "createdAt" | "updatedAt">) => void;
    updateTender: (id: string, data: Partial<Tender>) => void;
    deleteTender: (id: string) => void;
    isLoading: boolean;
}

const TenderContext = createContext<TenderContextType | undefined>(undefined);

export function TenderProvider({ children }: { children: React.ReactNode }) {
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("licita_gestor_data");
        if (stored) {
            try {
                setTenders(JSON.parse(stored));
            } catch (e) {
                console.error("Erro ao carregar dados locais", e);
                setTenders(MOCK_TENDERS);
            }
        } else {
            setTenders(MOCK_TENDERS);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem("licita_gestor_data", JSON.stringify(tenders));
        }
    }, [tenders, isLoading]);

    const addTender = (data: Omit<Tender, "id" | "createdAt" | "updatedAt">) => {
        const newTender: Tender = {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setTenders((prev) => [newTender, ...prev]);
    };

    const updateTender = (id: string, data: Partial<Tender>) => {
        setTenders((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t))
        );
    };

    const deleteTender = (id: string) => {
        setTenders((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <TenderContext.Provider value={{ tenders, addTender, updateTender, deleteTender, isLoading }}>
            {children}
        </TenderContext.Provider>
    );
}

export function useTenders() {
    const context = useContext(TenderContext);
    if (context === undefined) {
        throw new Error("useTenders must be used within a TenderProvider");
    }
    return context;
}
