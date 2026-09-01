"use client"

import { useState, useEffect, useMemo } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export interface UserFormData {
  name: string
  email: string
  password?: string
  /** Legacy — conservé pour compatibilité DB */
  role?: "ADMIN" | "EDITOR" | "VIEWER"
  roleId?: string
  structureId?: string
  isActive: boolean
}

interface RbacRoleOption {
  id: string
  name: string
  isRoot: boolean
  isActive: boolean
  structureId: string | null
}

interface StructureOption {
  id: string
  name: string
}

interface UserModalInitialData extends Partial<UserFormData> {
  rbacRoles?: Array<{ roleName: string; structureName: string; isRoot: boolean }>
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: UserFormData) => void
  initialData?: UserModalInitialData | null
}

/**
 * Modal pour ajouter/modifier un utilisateur
 */
export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    roleId: "",
    structureId: "",
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [structures, setStructures] = useState<StructureOption[]>([])
  const [roles, setRoles] = useState<RbacRoleOption[]>([])
  const [isLoadingRbac, setIsLoadingRbac] = useState(false)

  const isEditMode = Boolean(initialData?.email)

  const availableRoles = useMemo(
    () =>
      roles.filter(
        (r) =>
          r.isActive &&
          formData.structureId &&
          (!r.structureId || r.structureId === formData.structureId)
      ),
    [roles, formData.structureId]
  )

  useEffect(() => {
    if (!isOpen) return

    setIsLoadingRbac(true)
    Promise.all([
      fetch("/api/admin/structures").then((r) => r.json()),
      fetch("/api/admin/roles").then((r) => r.json()),
    ])
      .then(([sRes, rRes]) => {
        if (sRes.success) {
          const list = (sRes.data ?? []) as StructureOption[]
          setStructures(list)
          if (!initialData && list[0]) {
            setFormData((prev) => ({ ...prev, structureId: list[0].id }))
          }
        }
        if (rRes.success) {
          setRoles(rRes.data ?? [])
        }
      })
      .catch((error) => {
        console.error("[UserModal] Erreur chargement RBAC:", error)
        toast.error("Impossible de charger les rôles")
      })
      .finally(() => setIsLoadingRbac(false))
  }, [isOpen, initialData])

  useEffect(() => {
    if (isEditMode || !formData.structureId) return
    if (!formData.roleId && availableRoles[0]) {
      setFormData((prev) => ({ ...prev, roleId: availableRoles[0].id }))
    }
  }, [availableRoles, formData.structureId, formData.roleId, isEditMode])

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        roleId: "",
        structureId: "",
        isActive: initialData.isActive ?? true,
      })
      setShowPassword(false)
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        roleId: "",
        structureId: structures[0]?.id ?? "",
        isActive: true,
      })
      setShowPassword(true)
    }
  }, [initialData, isOpen, structures])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isEditMode) {
      if (!formData.structureId || !formData.roleId) {
        toast.error("Veuillez sélectionner une structure et un rôle")
        return
      }
    }

    setIsSubmitting(true)

    toast.info("Processus en cours...", {
      duration: 2000,
    })

    try {
      const dataToSubmit: UserFormData = { ...formData, role: "VIEWER" }
      if (initialData && !dataToSubmit.password) {
        delete dataToSubmit.password
      }
      if (isEditMode) {
        delete dataToSubmit.roleId
        delete dataToSubmit.structureId
        delete dataToSubmit.role
      }

      await onSubmit?.(dataToSubmit)
      setFormData({
        name: "",
        email: "",
        password: "",
        roleId: "",
        structureId: structures[0]?.id ?? "",
        isActive: true,
      })
      setShowPassword(true)
      onClose()
    } catch (error) {
      // L'erreur sera gérée par la page admin
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal coulissante depuis la droite */}
      <div
        className={`fixed right-0 top-0 h-screen w-full sm:w-96 bg-background border-l border-border shadow-xl z-50 overflow-y-auto transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* En-tête modal */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {initialData ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Jean Dupont"
              required
              className="w-full mt-2"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jean.dupont@example.com"
              required
              className="w-full mt-2"
            />
          </div>

          {/* Mot de passe */}
          {(!initialData || showPassword) && (
            <div>
              <Label htmlFor="password">
                Mot de passe * {initialData && "(laisser vide pour ne pas changer)"}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password || ""}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 caractères"
                required={!initialData}
                minLength={8}
                className="w-full mt-2"
              />
              {initialData && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(false)}
                  className="mt-2"
                >
                  Annuler le changement de mot de passe
                </Button>
              )}
            </div>
          )}

          {initialData && !showPassword && (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPassword(true)}
                className="w-full"
              >
                Changer le mot de passe
              </Button>
            </div>
          )}

          {/* Rôles RBAC — création */}
          {!isEditMode && (
            <>
              <div>
                <Label htmlFor="structure">Structure *</Label>
                <Select
                  value={formData.structureId || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, structureId: value, roleId: "" })
                  }
                  disabled={isLoadingRbac}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder={isLoadingRbac ? "Chargement..." : "Choisir une structure"} />
                  </SelectTrigger>
                  <SelectContent>
                    {structures.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="roleId">Rôle *</Label>
                <Select
                  value={formData.roleId || ""}
                  onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                  disabled={isLoadingRbac || !formData.structureId}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue
                      placeholder={
                        isLoadingRbac
                          ? "Chargement..."
                          : availableRoles.length === 0
                            ? "Aucun rôle disponible"
                            : "Choisir un rôle"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                        {r.isRoot ? " (ROOT)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Rôles configurés dans Administration → Rôles
                </p>
              </div>
            </>
          )}

          {/* Rôles RBAC — édition (lecture seule) */}
          {isEditMode && (
            <div className="space-y-2">
              <Label>Rôles attribués</Label>
              {initialData?.rbacRoles && initialData.rbacRoles.length > 0 ? (
                <div className="space-y-2 rounded-md border border-border p-3">
                  {initialData.rbacRoles.map((r, index) => (
                    <div key={`${r.roleName}-${r.structureName}-${index}`} className="text-sm">
                      <span className="font-medium">{r.roleName}</span>
                      {r.isRoot ? " (ROOT)" : ""}
                      <span className="text-muted-foreground"> — {r.structureName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun rôle RBAC attribué</p>
              )}
              <p className="text-xs text-muted-foreground">
                Utilisez le bouton d&apos;attribution (icône engrenage) dans la liste pour modifier les rôles.
              </p>
            </div>
          )}

          {/* Statut actif */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Compte actif
            </Label>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? initialData
                  ? "Modification en cours..."
                  : "Création en cours..."
                : initialData
                  ? "Modifier"
                  : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

