import { Tender, User } from "@/types";

export const MOCK_USERS: User[] = [
    { id: '1', name: 'Ana Silva', email: 'ana@empresa.com', role: 'admin' },
    { id: '2', name: 'Carlos Souza', email: 'carlos@empresa.com', role: 'editor' },
];

export const MOCK_TENDERS: Tender[] = [
    {
        id: '1',
        title: 'Aquisição de Notebooks',
        agency: 'Prefeitura de São Paulo',
        city: 'São Paulo - SP',
        value: 150000.00,
        status: 'pending',
        deadline: '2026-02-15T10:00:00Z',
        responsibleId: '1',
        createdAt: '2026-01-20T14:00:00Z',
        updatedAt: '2026-01-20T14:00:00Z',
        description: 'Licitação para compra de 30 notebooks i5.'
    },
    {
        id: '2',
        title: 'Reforma Escola Municipal',
        agency: 'Governo do Estado',
        city: 'Campinas - SP',
        value: 450000.00,
        status: 'in_progress',
        deadline: '2026-02-10T09:00:00Z',
        responsibleId: '2',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-21T09:00:00Z',
    },
    {
        id: '3',
        title: 'Serviço de Limpeza',
        agency: 'Câmara Municipal',
        city: 'Santos - SP',
        value: 80000.00,
        status: 'won',
        deadline: '2026-01-10T14:00:00Z',
        responsibleId: '1',
        createdAt: '2025-12-20T11:00:00Z',
        updatedAt: '2026-01-12T16:00:00Z',
    }
];

// Simula chamada assíncrona
export async function getTenders(): Promise<Tender[]> {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...MOCK_TENDERS]), 500);
    });
}
