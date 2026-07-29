import PageHeader from "@/components/shared/ui/PageHeader";
import CreateHotelWithOwnerForm from "@/components/admin/hotels/CreateHotelWithOwnerForm";

export default function AdminCreateHotelPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Créer un nouvel hôtel"
        description="Crée l'hôtel et le compte propriétaire en une seule étape"
      />
      <CreateHotelWithOwnerForm />
    </div>
  );
}