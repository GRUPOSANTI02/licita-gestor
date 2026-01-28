export type TenderStatus = 'won' | 'lost' | 'pending' | 'in_progress' | 'not_participated' | 'Ganha' | 'Perdida' | 'Em Análise' | 'Aguardando' | 'Não Participou';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    avatar?: string;
}

export interface Tender {
    id: string;
    tenderNumber?: string; // Ex: 001/2026
    title: string;
    agency: string;
    city: string;
    value: number; // Valor Estimado
    wonValue?: number; // Valor Real Ganhado
    status: TenderStatus;
    deadline: string;
    description?: string;
    editalUrl?: string; // Link para o edital (PDF/Site)
    responsibleId: string;
    nextSessionDate?: string; // Data da próxima sessão/retomada
    createdAt: string;
    updatedAt: string;
}

export interface ActivityLog {
    id: string;
    userId: string;
    tenderId?: string;
    action: string;
    timestamp: string;
}

export interface Ata {
    id: string;
    tenderId?: string; // Opcional (Pode não ter licitação vinculada)

    // Campos manuais (usados se não houver tenderId)
    manualTitle?: string;
    manualAgency?: string;
    manualCity?: string;

    value?: number; // Valor da Ata
    ataNumber: string;
    startDate: string;
    endDate: string;
    canExtend: boolean;
    canAdhere: boolean; // Carona
    pdfUrl?: string; // Link externo (Drive/Dropbox)
    attachmentUrl?: string; // Upload no Supabase
    observations?: string;
    isExtended: boolean;
    company?: string; // Nome da empresa detentora da ata
    createdAt: string;
    updatedAt: string;
}
