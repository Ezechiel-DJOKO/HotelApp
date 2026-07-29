"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { User } from "@/types";
import {
  UserCog,
  Mail,
  Phone,
  ArrowLeft,
  Trash2,
  Power,
  PowerOff,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";

export default function AdminOwnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getUserById(params.id as string);
      setOwner(res.data?.user || null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
      router.push("/admin/owners");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async () => {
    if (!owner) return;
    try {
      await adminService.toggleUserActive(owner._id);
      toast.success("Statut modifié");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  };

  const handleDelete = async () => {
    if (!owner || !confirm(`Supprimer ${owner.prenom} ${owner.nom} ?`)) return;
    try {
      await adminService.deleteUser(owner._id);
      toast.success("Propriétaire supprimé");
      router.push("/admin/owners");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  };

  if (loading) return <Loader fullPage />;
  if (!owner) return null;

  const isActive = owner.isVerified;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/owners"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </Link>

      <PageHeader
        title={`${owner.prenom} ${owner.nom}`}
        description="Détails du propriétaire"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleToggle}
              icon={
                isActive ? (
                  <PowerOff className="w-4 h-4" />
                ) : (
                  <Power className="w-4 h-4" />
                )
              }
            >
              {isActive ? "Bloquer" : "Débloquer"}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Supprimer
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
            {owner.prenom?.charAt(0)}
            {owner.nom?.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            {owner.prenom} {owner.nom}
          </h2>
          <Badge variant="purple">🏨 Propriétaire</Badge>
          <div className="mt-4">
            {isActive ? (
              <Badge variant="success">Compte actif</Badge>
            ) : (
              <Badge variant="danger">Compte bloqué</Badge>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-bold text-slate-900 mb-4">Informations</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{owner.email}</p>
              </div>
            </div>

            {owner.phone && (
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Téléphone</p>
                  <p className="font-medium text-slate-900">{owner.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <UserCog className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Rôle</p>
                <p className="font-medium text-slate-900">Propriétaire</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}