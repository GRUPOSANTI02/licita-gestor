"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Tender, Ata } from "@/types";
import { supabase } from "@/lib/supabase";

interface TenderContextType {
    tenders: Tender[];
    addTender: (tender: any) => Promise<void>;
    updateTender: (id: string, data: Partial<Tender>) => Promise<void>;
    deleteTender: (id: string) => Promise<void>;

    // Gestão de Atas
    atas: Ata[];
    addAta: (ata: any) => Promise<void>;
    updateAta: (id: string, data: Partial<Ata>) => Promise<void>;
    deleteAta: (id: string) => Promise<void>;

    isLoading: boolean;
}

const TenderContext = createContext<TenderContextType | undefined>(undefined);

// MOCK_TENDERS removido
// import { MOCK_TENDERS } from "@/services/mockData";

export function TenderProvider({ children }: { children: React.ReactNode }) {
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [atas, setAtas] = useState<Ata[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isSupabaseConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 50;

    const fetchData = async () => {
        setIsLoading(true);

        // --- CARREGAR LICITAÇÕES (TENDERS) ---
        const storedTenders = localStorage.getItem("licita_gestor_data");
        if (storedTenders) {
            try {
                let parsedTenders = JSON.parse(storedTenders);

                // AUTO-CORREÇÂO DE DADOS ANTIGOS (FIX AMAMBAI)
                parsedTenders = parsedTenders.map((t: any) => {
                    if (t.city === "Amabai") t.city = "Amambai"; // Corrige erro de digitação
                    if (t.title && t.title.includes("Amabai")) t.title = t.title.replace("Amabai", "Amambai");
                    return t;
                });

                setTenders(parsedTenders);
            } catch (e) {
                console.error("Erro LocalStorage Tenders", e);
            }
        }

        // --- CARREGAR ATAS ---
        const storedAtas = localStorage.getItem("licita_gestor_atas");
        if (storedAtas) {
            try {
                setAtas(JSON.parse(storedAtas));
            } catch (e) {
                console.error("Erro LocalStorage Atas", e);
            }
        } else {
            setAtas([]);
        }

        // Se houver Nuvem, carrega Tenders (Atas por enquanto apenas local para simplificar, expansível depois)
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.from('tenders').select('*').order('deadline', { ascending: true });
                if (!error && data) {
                    const mappedData: Tender[] = data.map((t: any) => ({
                        id: t.id,
                        tenderNumber: t.tender_number,
                        title: t.title,
                        agency: t.agency,
                        city: t.city,
                        value: Number(t.value),
                        wonValue: t.won_value ? Number(t.won_value) : undefined,
                        status: t.status,
                        deadline: t.deadline,
                        description: t.description,
                        editalUrl: t.edital_url,
                        responsibleId: t.responsible_id,
                        createdAt: t.created_at,
                        updatedAt: t.updated_at,
                        nextSessionDate: t.next_session_date
                    }));
                    setTenders(mappedData);
                    localStorage.setItem("licita_gestor_data", JSON.stringify(mappedData));
                }
            } catch (e) {
                console.error("Erro Nuvem", e);
            }
        } else if (!storedTenders) {
            setTenders([]);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
        // Não estamos assinando mudanças em tempo real para Atas ainda
    }, []);

    // Persistência Automática Tenders
    useEffect(() => {
        if (!isLoading) localStorage.setItem("licita_gestor_data", JSON.stringify(tenders));
    }, [tenders, isLoading]);

    // Persistência Automática Atas
    useEffect(() => {
        if (!isLoading) localStorage.setItem("licita_gestor_atas", JSON.stringify(atas));
    }, [atas, isLoading]);

    const addTender = async (data: any) => {
        const newTender: Tender = {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setTenders(prev => [newTender, ...prev]);

        if (isSupabaseConfigured) {
            await supabase.from('tenders').insert([{
                tender_number: data.tenderNumber,
                title: data.title,
                agency: data.agency,
                city: data.city,
                value: data.value,
                won_value: data.wonValue,
                status: data.status,
                deadline: data.deadline,
                description: data.description,
                edital_url: data.editalUrl,
                next_session_date: data.nextSessionDate,
                responsible_id: data.responsibleId || "1",
            }]);
        }
    };

    const updateTender = async (id: string, data: Partial<Tender>) => {
        // Atualiza estado local imediatamente
        setTenders(prev => prev.map(t => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t)));

        // Persiste no Supabase se configurado
        if (isSupabaseConfigured) {
            // Mapeamento camelCase -> snake_case para o Supabase
            const supabaseData: any = {
                updated_at: new Date().toISOString()
            };

            if (data.tenderNumber !== undefined) supabaseData.tender_number = data.tenderNumber;
            if (data.title !== undefined) supabaseData.title = data.title;
            if (data.agency !== undefined) supabaseData.agency = data.agency;
            if (data.city !== undefined) supabaseData.city = data.city;
            if (data.value !== undefined) supabaseData.value = data.value;
            if (data.wonValue !== undefined) supabaseData.won_value = data.wonValue;
            if (data.status !== undefined) supabaseData.status = data.status;
            if (data.deadline !== undefined) supabaseData.deadline = data.deadline;
            if (data.description !== undefined) supabaseData.description = data.description;
            if (data.editalUrl !== undefined) supabaseData.edital_url = data.editalUrl;
            if (data.nextSessionDate !== undefined) supabaseData.next_session_date = data.nextSessionDate;


            await supabase.from('tenders').update(supabaseData).eq('id', id);
        }
    };

    const deleteTender = async (id: string) => {
        setTenders(prev => prev.filter(t => t.id !== id));
        if (isSupabaseConfigured) {
            await supabase.from('tenders').delete().eq('id', id);
        }
    };

    // --- AÇÕES DE ATAS ---
    const addAta = async (data: any) => {
        const newAta: Ata = {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setAtas(prev => [newAta, ...prev]);
        // Salva local via useEffect
    };

    const updateAta = async (id: string, data: Partial<Ata>) => {
        setAtas(prev => prev.map(a => (a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a)));
    };

    const deleteAta = async (id: string) => {
        setAtas(prev => prev.filter(a => a.id !== id));
    };

    return (
        <TenderContext.Provider value={{
            tenders, addTender, updateTender, deleteTender,
            atas, addAta, updateAta, deleteAta,
            isLoading
        }}>
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
