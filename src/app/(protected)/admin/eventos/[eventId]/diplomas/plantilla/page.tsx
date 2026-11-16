import { redirect } from "next/navigation";

export default async function RetiredTemplateEditor({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  redirect(`/admin/eventos/${eventId}/diplomas`);
}
