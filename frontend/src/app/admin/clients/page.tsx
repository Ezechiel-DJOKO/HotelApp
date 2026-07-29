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
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import Input from "@/components/shared/ui/Input";

export default function AdminClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await adminService.getAllClients();
      setClients(res.data?.clients || []);
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

  const filtered = clients.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.prenom.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description={`${clients.length} clients inscrits sur la plateforme`}
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
          icon={<Users className="w-8 h-8" />}
          title="Aucun client"
          description="Les clients qui s'inscrivent apparaîtront ici."
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          {/* Vue Desktop : Tableau */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Téléphone
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
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {client.prenom?.charAt(0)}
                          {client.nom?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {client.prenom} {client.nom}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {client.phone || "—"}
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
                      <Link href={`/admin/clients/${client._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                        >
                          Voir
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vue Mobile : Cartes */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filtered.map((client) => (
              <div key={client._id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {client.prenom?.charAt(0)}
                    {client.nom?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {client.prenom} {client.nom}
                    </p>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </p>
                    {client.phone && (
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </p>
                    )}
                  </div>
                  {client.isVerified ? (
                    <Badge variant="success">Actif</Badge>
                  ) : (
                    <Badge variant="danger">Bloqué</Badge>
                  )}
                </div>
                <Link href={`/admin/clients/${client._id}`}>
                  <Button variant="outline" size="sm" fullWidth>
                    Voir le profil
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}