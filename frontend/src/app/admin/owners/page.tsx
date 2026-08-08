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
  Hotel,
  Calendar,
  Ban,
  Unlock,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import Input from "@/components/shared/ui/Input";
import StatCard from "@/components/shared/ui/StatCard";

interface UserWithDates extends User {
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState<UserWithDates[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "blocked">("all");
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getAllOwners();
      setOwners((res.data?.owners as UserWithDates[]) || []);
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

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Voulez-vous ${currentStatus ? "bloquer" : "débloquer"} ce propriétaire ?`)) return;
    setProcessing(id);
    try {
      await adminService.toggleUserActive(id);
      toast.success(currentStatus ? "Propriétaire bloqué" : "Propriétaire débloqué");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string, nom: string) => {
    if (
      !confirm(
        `Supprimer définitivement le compte de ${nom} ?\n\n⚠️ Cette action supprimera aussi tous ses hôtels et données associées.`
      )
    )
      return;
    setProcessing(id);
    try {
      await adminService.deleteUser(id);
      toast.success("Propriétaire supprimé");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <Loader fullPage />;

  const filtered = owners.filter((o) => {
    const matchSearch =
      !search ||
      o.nom.toLowerCase().includes(search.toLowerCase()) ||
      o.prenom.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && o.isVerified) ||
      (filter === "blocked" && !o.isVerified);
    return matchSearch && matchFilter;
  });

  const stats = {
    total: owners.length,
    active: owners.filter((o) => o.isVerified).length,
    blocked: owners.filter((o) => !o.isVerified).length,
    thisMonth: owners.filter((o) => {
      if (!o.createdAt) return false;
      const created = new Date(o.createdAt);
      const now = new Date();
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Propriétaires"
        description={`${owners.length} propriétaires d'hôtels sur la plateforme`}
        action={
          <Link href="/admin/hotels/create">
            <Button icon={<UserCog className="w-4 h-4" />}>
              Créer un propriétaire
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<UserCog className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Actifs"
          value={stats.active}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Bloqués"
          value={stats.blocked}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          label="Ce mois-ci"
          value={stats.thisMonth}
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Filtres */}
      <Card padding="sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom, prénom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: "all", label: `Tous (${stats.total})` },
              { key: "active", label: `Actifs (${stats.active})` },
              { key: "blocked", label: `Bloqués (${stats.blocked})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  filter === f.key
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<UserCog className="w-8 h-8" />}
          title="Aucun propriétaire"
          description="Les propriétaires enregistrés apparaîtront ici."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((owner) => (
            <Card key={owner._id} hover>
              <div className="flex items-start gap-3 mb-4">
                {owner.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={owner.avatar}
                    alt={owner.nom}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {owner.prenom?.charAt(0)}
                    {owner.nom?.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {owner.prenom} {owner.nom}
                  </h3>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3" />
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

              <div className="space-y-2 mb-4 text-sm text-slate-600 pb-4 border-b border-slate-100">
                {owner.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{owner.phone}</span>
                  </div>
                )}
                {owner.createdAt && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    Membre depuis{" "}
                    {new Date(owner.createdAt).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Link href={`/admin/owners/${owner._id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={<Eye className="w-4 h-4" />}
                  >
                    Voir
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(owner._id, owner.isVerified)}
                  disabled={processing === owner._id}
                  fullWidth
                  className={
                    owner.isVerified
                      ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                      : "text-green-600 border-green-200 hover:bg-green-50"
                  }
                >
                  {owner.isVerified ? (
                    <Ban className="w-4 h-4" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDelete(owner._id, `${owner.prenom} ${owner.nom}`)
                  }
                  disabled={processing === owner._id}
                  fullWidth
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}