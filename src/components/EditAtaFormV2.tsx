"use client";

import { useTenders } from "@/context/TenderContext";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Search, CheckCircle2, AlertTriangle, FileText, UploadCloud, Loader2, Trash2, Home } from "lucide-react";
import Link from "next/link";
import { maskCurrency, parseCurrencyToNumber } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export function EditAtaFormV2({ ataId }: { ataId: string }) {
    const { atas, tenders, updateAta, deleteAta } = useTenders();
    const router = useRouter();

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
            <div className="p-10 flex justify-center text-amber-500">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 bg-red-100">
            <h1 className="text-3xl font-bold">Modo de Depuração Ativado</h1>
            <p>Se você vê esta tela, o erro de sintaxe estava no JSX original.</p>
            <p>ID da Ata: {ataId}</p>
        </div>
    );
}
