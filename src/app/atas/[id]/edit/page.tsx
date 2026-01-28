import { EditAtaFormV2 } from "@/components/EditAtaFormV2";

export default function EditAtaPage({ params }: { params: { id: string } }) {
    return <EditAtaFormV2 ataId={params.id} />;
}
