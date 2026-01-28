import { Tender } from "@/types";
import { formatCurrency, formatDate } from "./utils";

const EMOJI = {
    SUCCESS: '\u2705',
    REPORT: '\uD83D\uDCCB',
    CALENDAR: '\uD83D\uDCC5',
    ROCKET: '\uD83D\uDE80',
    PIN: '\uD83D\uDCCD',
    BUILDING: '\uD83C\uDFDB',
    MONEY: '\uD83D\uDCB0'
};

export function generateSingleTenderWhatsAppLink(tender: Tender) {
    const message = `${EMOJI.SUCCESS} *NOVA LICITAÇÃO!*\n\n` +
        `*OBJETO:* ${tender.title.toUpperCase()}\n` +
        `*ÓRGÃO:* ${tender.agency}\n` +
        `*CIDADE:* ${tender.city}\n` +
        `*DATA:* ${formatDate(tender.deadline)}\n` +
        `*VALOR:* ${formatCurrency(tender.value)}\n\n` +
        `${tender.editalUrl ? `*LINK:* ${tender.editalUrl}\n\n` : ""}` +
        `_Gerado via LicitaGestor_`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function generateWeeklySummaryWhatsAppLink(tenders: Tender[]) {
    // Filtrar apenas licitações dos próximos 7 dias
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const weeklyTenders = tenders.filter(tender => {
        const deadline = new Date(tender.deadline);
        return deadline >= today && deadline <= nextWeek;
    });

    const sortedTenders = [...weeklyTenders].sort((a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );

    const grouped = sortedTenders.reduce((acc, tender) => {
        const date = formatDate(tender.deadline);
        if (!acc[date]) acc[date] = [];
        acc[date].push(tender);
        return acc;
    }, {} as Record<string, Tender[]>);

    let message = `${EMOJI.REPORT} *RELATÓRIO DE LICITAÇÕES*\n` +
        `------------------------------------------\n\n`;

    Object.entries(grouped).forEach(([date, items]) => {
        message += `${EMOJI.CALENDAR} *DATA: ${date}*\n`;
        message += `==========================\n`;
        items.forEach(item => {
            message += `${EMOJI.ROCKET} *${item.title.toUpperCase()}*\n`;
            message += `   ${EMOJI.PIN} ${item.city}\n`;
            message += `   ${EMOJI.BUILDING} ${item.agency}\n`;
            message += `   ${EMOJI.MONEY} ${formatCurrency(item.value)}\n`;
            if (item.editalUrl) {
                message += `   🔗 *Edital:* ${item.editalUrl}\n`;
            }
            message += `\n`;
        });
        message += `\n`;
    });

    message += `_Confira os detalhes no seu painel LicitaGestor_\n\n`;
    message += `🔗 *Acesse:* https://licita-gestor.vercel.app`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
