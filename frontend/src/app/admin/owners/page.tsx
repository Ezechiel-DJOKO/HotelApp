"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { User } from "@/types";
import {
  UserCog,
  Mail,
  Phone,
  Search,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import Input from "@/components/shared/ui/Input";

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await adminService.getAllOwners();
      setOwners(res.data?.owners || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
      setOwners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = owners.filter(
    (o) =>
      o.nom.toLowerCase().includes(search.toLowerCase()) ||
      o.prenom.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Propriétaires"
        description={`${owners.length} propriétaires enregistrés`}
        action={
          <Link href="/admin/hotels/create">
            <Button icon={<UserCog className="w-4 h-4" />}>
              Créer un propriétaire
            </Button>
          </Link>
        }
      />

      <Card padding="sm">
        <Input
          placeholder="Rechercher par nom, prénom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </Card>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<UserCog className="w-8 h-8" />}
          title="Aucun propriétaire"
          description="Créez le premier propriétaire en créant un hôtel."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((owner) => (
            <Card key={owner._id} hover>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {owner.prenom?.charAt(0)}
                  {owner.nom?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {owner.prenom} {owner.nom}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {owner.email}
                  </p>
                  <div className="mt-1">
                    {owner.isVerified ? (
                      <Badge
                        variant="success"
                        icon={<CheckCircle className="w-3 h-3" />}
                      >
                        Actif
                      </Badge>
                    ) : (
                      <Badge
                        variant="danger"
                        icon={<XCircle className="w-3 h-3" />}
                      >
                        Bloqué
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{owner.email}</span>
                </div>
                {owner.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{owner.phone}</span>
                  </div>
                )}
              </div>

              <Link href={`/admin/owners/${owner._id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  icon={<Eye className="w-4 h-4" />}
                >
                  Voir le profil
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}