import { EditAtaFormV3 } from "@/components/EditAtaFormV3";

export default function EditAtaPage({ params }: { params: { id: string } }) {
    return <EditAtaFormV3 ataId={params.id} />;
}
