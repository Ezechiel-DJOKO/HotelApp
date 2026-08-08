"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { User } from "@/types";
import {
  Users,
  Mail,
  Phone,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  UserPlus,
  Calendar,
  Filter,
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
  isActive?: boolean;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<UserWithDates[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "blocked">("all");
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getAllClients();
      setClients((res.data?.clients as UserWithDates[]) || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Voulez-vous ${currentStatus ? "bloquer" : "débloquer"} ce client ?`)) return;
    setProcessing(id);
    try {
      await adminService.toggleUserActive(id);
      toast.success(currentStatus ? "Client bloqué" : "Client débloqué");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string, nom: string) => {
    if (!confirm(`Supprimer définitivement le compte de ${nom} ?`)) return;
    setProcessing(id);
    try {
      await adminService.deleteUser(id);
      toast.success("Client supprimé");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <Loader fullPage />;

  const filtered = clients.filter((c) => {
    const matchSearch =
      !search ||
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.prenom.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && c.isVerified) ||
      (filter === "blocked" && !c.isVerified);
    return matchSearch && matchFilter;
  });

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.isVerified).length,
    blocked: clients.filter((c) => !c.isVerified).length,
    thisMonth: clients.filter((c) => {
      if (!c.createdAt) return false;
      const created = new Date(c.createdAt);
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
        title="Clients"
        description={`${clients.length} clients inscrits sur la plateforme`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total clients"
          value={stats.total}
          icon={<Users className="w-5 h-5" />}
          color="blue"
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
          icon={<UserPlus className="w-5 h-5" />}
          color="purple"
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
          icon={<Users className="w-8 h-8" />}
          title="Aucun client"
          description="Les clients inscrits apparaîtront ici."
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          {/* Tableau desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Inscrit le
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((client) => (
                  <tr key={client._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {client.avatar ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={client.avatar}
                            alt={client.nom}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {client.prenom?.charAt(0)}
                            {client.nom?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {client.prenom} {client.nom}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {client._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-900 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {client.email}
                        </p>
                        {client.phone && (
                          <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {client.createdAt ? (
                        <div className="text-sm">
                          <p className="text-slate-700 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(client.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.isVerified ? (
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
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/clients/${client._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleActive(client._id, client.isVerified)
                          }
                          disabled={processing === client._id}
                          className={
                            client.isVerified
                              ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                              : "text-green-600 border-green-200 hover:bg-green-50"
                          }
                        >
                          {client.isVerified ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDelete(
                              client._id,
                              `${client.prenom} ${client.nom}`
                            )
                          }
                          disabled={processing === client._id}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vue mobile */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filtered.map((client) => (
              <div key={client._id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  {client.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={client.avatar}
                      alt={client.nom}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {client.prenom?.charAt(0)}
                      {client.nom?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">
                      {client.prenom} {client.nom}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </p>
                    {client.phone && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </p>
                    )}
                    {client.createdAt && (
                      <p className="text-xs text-slate-400 mt-1">
                        Inscrit le{" "}
                        {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                  {client.isVerified ? (
                    <Badge variant="success">Actif</Badge>
                  ) : (
                    <Badge variant="danger">Bloqué</Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Link href={`/admin/clients/${client._id}`}>
                    <Button variant="outline" size="sm" fullWidth>
                      Voir
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleToggleActive(client._id, client.isVerified)
                    }
                    disabled={processing === client._id}
                    fullWidth
                    className={
                      client.isVerified
                        ? "text-orange-600 border-orange-200"
                        : "text-green-600 border-green-200"
                    }
                  >
                    {client.isVerified ? "Bloquer" : "Débloquer"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDelete(
                        client._id,
                        `${client.prenom} ${client.nom}`
                      )
                    }
                    disabled={processing === client._id}
                    fullWidth
                    className="text-red-600 border-red-200"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}