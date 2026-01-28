"use client";

import { EditAtaForm } from "@/components/EditAtaForm";

export default function EditAtaPage({ params }: { params: { id: string } }) {
    return <EditAtaForm ataId={params.id} />;
}
