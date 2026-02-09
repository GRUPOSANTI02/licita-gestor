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

                // AUTO-CORREÇÂO DE DADOS ANTIGOS (FIX AMAMBAI E STATUS)
                parsedTenders = parsedTenders.map((t: any) => {
                    if (t.city === "Amabai") t.city = "Amambai"; // Corrige erro de digitação
                    if (t.title && t.title.includes("Amabai")) t.title = t.title.replace("Amabai", "Amambai");

                    // Normalizar Status Legado
                    if (t.status === 'Não Participou') t.status = 'not_participated';
                    if (t.status === 'Em Andamento') t.status = 'running';
                    if (t.status === 'Ganha') t.status = 'won';
                    if (t.status === 'Perdida') t.status = 'lost';
                    if (t.status === 'Em Análise') t.status = 'in_progress';
                    if (t.status === 'Aguardando') t.status = 'pending';

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

        // Se houver Nuvem, carrega Tenders E Atas
        if (isSupabaseConfigured) {
            try {
                // TENDERS
                const { data: tendersData, error: tendersError } = await supabase.from('tenders').select('*').order('deadline', { ascending: true });
                if (!tendersError && tendersData) {
                    const mappedTenders: Tender[] = tendersData.map((t: any) => ({
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
                        nextSessionDate: t.next_session_date,
                        sessionType: t.session_type,
                    }));
                    setTenders(prev => {
                        const merged = mappedTenders.map(cloudTender => {
                            const localTender = prev.find(p => p.id === cloudTender.id);
                            if (localTender && localTender.updatedAt && cloudTender.updatedAt) {
                                const localTime = new Date(localTender.updatedAt).getTime();
                                const cloudTime = new Date(cloudTender.updatedAt).getTime();
                                if (localTime > cloudTime + 2000) return localTender;
                            }
                            return cloudTender;
                        });
                        const cloudIds = new Set(mappedTenders.map(t => t.id));
                        const localOnly = prev.filter(p => !cloudIds.has(p.id));
                        const final = [...merged, ...localOnly];
                        localStorage.setItem("licita_gestor_data", JSON.stringify(final));
                        return final;
                    });
                }

                // ATAS
                const { data: atasData, error: atasError } = await supabase.from('atas').select('*').order('created_at', { ascending: false });
                if (!atasError && atasData) {
                    const mappedAtas: Ata[] = atasData.map((a: any) => ({
                        id: a.id,
                        tenderId: a.tender_id,
                        manualTitle: a.manual_title,
                        manualAgency: a.manual_agency,
                        manualCity: a.manual_city,
                        value: Number(a.value),
                        ataNumber: a.ata_number,
                        startDate: a.start_date,
                        endDate: a.end_date,
                        canExtend: a.can_extend,
                        canAdhere: a.can_adhere,
                        pdfUrl: a.pdf_url,
                        attachmentUrl: a.attachment_url,
                        observations: a.observations,
                        isExtended: a.is_extended,
                        isNew: a.is_new,
                        company: a.company,
                        createdAt: a.created_at,
                        updatedAt: a.updated_at,
                    }));

                    setAtas(prev => {
                        const merged = mappedAtas.map(cloudAta => {
                            const localAta = prev.find(p => p.id === cloudAta.id);
                            if (localAta && localAta.updatedAt && cloudAta.updatedAt) {
                                const localTime = new Date(localAta.updatedAt).getTime();
                                const cloudTime = new Date(cloudAta.updatedAt).getTime();
                                if (localTime > cloudTime + 2000) return localAta;
                            }
                            return cloudAta;
                        });
                        const cloudIds = new Set(mappedAtas.map(a => a.id));
                        const localOnly = prev.filter(p => !cloudIds.has(p.id));
                        const final = [...merged, ...localOnly];
                        localStorage.setItem("licita_gestor_atas", JSON.stringify(final));
                        return final;
                    });
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

    // Persistência Automática Tenders (Mantido como backup)
    useEffect(() => {
        if (!isLoading) localStorage.setItem("licita_gestor_data", JSON.stringify(tenders));
    }, [tenders, isLoading]);

    // Persistência Automática Atas
    useEffect(() => {
        if (!isLoading) localStorage.setItem("licita_gestor_atas", JSON.stringify(atas));
    }, [atas, isLoading]);

    const addTender = async (data: any) => {
        // Garantir que as datas estejam em ISO String se existirem
        const deadlineISO = data.deadline ? new Date(data.deadline).toISOString() : null;
        const nextSessionDateISO = data.nextSessionDate ? new Date(data.nextSessionDate).toISOString() : null;

        const newTender: Tender = {
            ...data,
            id: crypto.randomUUID(),
            deadline: deadlineISO || data.deadline, // Fallback se falhar
            nextSessionDate: nextSessionDateISO || data.nextSessionDate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // 1. Atualizar estado local imediatamente
        setTenders(prev => {
            const updated = [newTender, ...prev];
            localStorage.setItem("licita_gestor_data", JSON.stringify(updated));
            return updated;
        });

        // 2. Persistir no Supabase se configurado
        if (isSupabaseConfigured) {
            console.log("Criando na nuvem (Supabase)...");

            const supabaseData = {
                id: newTender.id, // Força o mesmo ID gerado localmente
                tender_number: data.tenderNumber,
                title: data.title,
                agency: data.agency,
                city: data.city,
                value: data.value,
                won_value: data.wonValue,
                status: data.status,
                deadline: deadlineISO,
                description: data.description,
                edital_url: data.editalUrl,
                next_session_date: nextSessionDateISO,
                responsible_id: data.responsibleId || "1",
                updated_at: newTender.updatedAt,
                session_type: data.sessionType
            };

            const { error } = await supabase.from('tenders').insert([supabaseData]);

            if (error) {
                console.error("Erro CRÍTICO ao criar no Supabase:", error);
                throw new Error(`Erro ao salvar na nuvem: ${error.message}`);
            }
        }
    };

    const updateTender = async (id: string, data: Partial<Tender>) => {
        // Prepare updated data with valid ISO string for dates if present
        const updates = { ...data, updatedAt: new Date().toISOString() };

        // 1. Atualizar estado local imediatamente
        setTenders(prev => {
            const updatedList = prev.map(t => (t.id === id ? { ...t, ...updates } : t));
            // Atualizar localStorage imediatamente para garantir persistência local
            try {
                localStorage.setItem("licita_gestor_data", JSON.stringify(updatedList));
            } catch (err) {
                console.error("Erro ao salvar no LocalStorage:", err);
            }
            return updatedList;
        });

        // 2. Persistir no Supabase se configurado
        if (isSupabaseConfigured) {
            console.log("Salvando na nuvem (Supabase)...", id);

            // Mapeamento camelCase -> snake_case para o Supabase
            const supabaseData: any = {
                updated_at: updates.updatedAt
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
            if (data.sessionType !== undefined) supabaseData.session_type = data.sessionType;


            const { error } = await supabase.from('tenders').update(supabaseData).eq('id', id);

            if (error) {
                console.error("Erro CRÍTICO ao atualizar Supabase:", error);
                // Reverter? Opcional. Por enquanto, vamos lançar o erro para o UI saber.
                throw new Error(`Erro ao salvar na nuvem: ${error.message || error.details}`);
            }
        }
    };

    const deleteTender = async (id: string) => {
        setTenders(prev => prev.filter(t => t.id !== id));
        if (isSupabaseConfigured) {
            await supabase.from('tenders').delete().eq('id', id);
        }
    };

    // --- AÇÕES DE ATAS ---
    // --- AÇÕES DE ATAS ---
    const addAta = async (data: any) => {
        const newAta: Ata = {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setAtas(prev => {
            const updated = [newAta, ...prev];
            localStorage.setItem("licita_gestor_atas", JSON.stringify(updated));
            return updated;
        });

        if (isSupabaseConfigured) {
            const supabaseData = {
                id: newAta.id,
                tender_id: data.tenderId,
                manual_title: data.manualTitle,
                manual_agency: data.manualAgency,
                manual_city: data.manualCity,
                value: data.value,
                ata_number: data.ataNumber,
                start_date: data.startDate,
                end_date: data.endDate,
                can_extend: data.canExtend,
                can_adhere: data.canAdhere,
                pdf_url: data.pdfUrl,
                attachment_url: data.attachmentUrl,
                observations: data.observations,
                is_extended: data.isExtended,
                is_new: data.isNew,
                company: data.company,
                updated_at: newAta.updatedAt
            };

            const { error } = await supabase.from('atas').insert([supabaseData]);
            if (error) console.error("Erro ao salvar Ata no Supabase:", error);
        }
    };

    const updateAta = async (id: string, data: Partial<Ata>) => {
        const updates = { ...data, updatedAt: new Date().toISOString() };

        setAtas(prev => {
            const updated = prev.map(a => (a.id === id ? { ...a, ...updates } : a));
            localStorage.setItem("licita_gestor_atas", JSON.stringify(updated));
            return updated;
        });

        if (isSupabaseConfigured) {
            const supabaseData: any = { updated_at: updates.updatedAt };
            if (data.tenderId !== undefined) supabaseData.tender_id = data.tenderId;
            if (data.manualTitle !== undefined) supabaseData.manual_title = data.manualTitle;
            if (data.manualAgency !== undefined) supabaseData.manual_agency = data.manualAgency;
            if (data.manualCity !== undefined) supabaseData.manual_city = data.manualCity;
            if (data.value !== undefined) supabaseData.value = data.value;
            if (data.ataNumber !== undefined) supabaseData.ata_number = data.ataNumber;
            if (data.startDate !== undefined) supabaseData.start_date = data.startDate;
            if (data.endDate !== undefined) supabaseData.end_date = data.endDate;
            if (data.canExtend !== undefined) supabaseData.can_extend = data.canExtend;
            if (data.canAdhere !== undefined) supabaseData.can_adhere = data.canAdhere;
            if (data.pdfUrl !== undefined) supabaseData.pdf_url = data.pdfUrl;
            if (data.attachmentUrl !== undefined) supabaseData.attachment_url = data.attachmentUrl;
            if (data.observations !== undefined) supabaseData.observations = data.observations;
            if (data.isExtended !== undefined) supabaseData.is_extended = data.isExtended;
            if (data.isNew !== undefined) supabaseData.is_new = data.isNew;
            if (data.company !== undefined) supabaseData.company = data.company;

            const { error } = await supabase.from('atas').update(supabaseData).eq('id', id);
            if (error) console.error("Erro ao atualizar Ata no Supabase:", error);
        }
    };

    const deleteAta = async (id: string) => {
        setAtas(prev => {
            const updated = prev.filter(a => a.id !== id);
            localStorage.setItem("licita_gestor_atas", JSON.stringify(updated));
            return updated;
        });

        if (isSupabaseConfigured) {
            await supabase.from('atas').delete().eq('id', id);
        }
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
