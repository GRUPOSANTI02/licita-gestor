import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

export function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR');
}

export function maskCurrency(value: string) {
    let cleanValue = value.replace(/\D/g, "");
    let numberValue = Number(cleanValue) / 100;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numberValue);
}

export function parseCurrencyToNumber(value: string) {
    let cleanValue = value.replace(/\D/g, "");
    return Number(cleanValue) / 100;
}
