export type TenderStatus = 'won' | 'lost' | 'pending' | 'in_progress';

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
    responsibleId: string;
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
