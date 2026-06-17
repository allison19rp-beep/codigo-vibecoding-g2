"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateUser, useUpdateUser } from "@/hooks/use-users"
import { useAllGroups } from "@/hooks/use-groups"
import type { User } from "@/types/users"

interface UsersFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSuccess?: () => void
}

interface FieldErrors {
  username?: string
  email?: string
  password?: string
  first_name?: string
  last_name?: string
}

export function UsersForm({ open, onOpenChange, user, onSuccess }: UsersFormProps) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const { data: groups } = useAllGroups()
  const isPending = createUser.isPending || updateUser.isPending

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isStaff, setIsStaff] = useState(false)
  const [isSuperuser, setIsSuperuser] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [selectedGroups, setSelectedGroups] = useState<number[]>([])
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setEmail(user.email)
      setPassword("")
      setFirstName(user.first_name)
      setLastName(user.last_name)
      setIsStaff(user.is_staff)
      setIsSuperuser(user.is_superuser)
      setIsActive(user.is_active)
      setSelectedGroups(user.groups)
    } else {
      setUsername("")
      setEmail("")
      setPassword("")
      setFirstName("")
      setLastName("")
      setIsStaff(false)
      setIsSuperuser(false)
      setIsActive(true)
      setSelectedGroups([])
    }
    setFieldErrors({})
  }, [user, open])

  function toggleGroup(groupId: number) {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const formData: any = {
      username,
      email,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      is_staff: isStaff,
      is_superuser: isSuperuser,
      is_active: isActive,
      groups: selectedGroups,
    }

    if (!user) {
      if (!password) {
        setFieldErrors({ password: "La contraseña es requerida" })
        return
      }
      formData.password = password
    } else if (password) {
      formData.password = password
    }

    try {
      if (user) {
        await updateUser.mutateAsync({ id: user.id, data: formData })
        toast.success("Usuario actualizado correctamente")
      } else {
        await createUser.mutateAsync(formData)
        toast.success("Usuario creado correctamente")
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      const data = error?.response?.data
      if (data && typeof data === "object") {
        const errors: FieldErrors = {}
        for (const key of Object.keys(data)) {
          const val = data[key]
          if (Array.isArray(val)) {
            errors[key as keyof FieldErrors] = val.join(", ")
          }
        }
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors)
          return
        }
      }
      toast.error("Error al guardar el usuario")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogTitle>{user ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
        <DialogDescription>
          {user ? "Modifica los datos del usuario" : "Ingresa los datos del nuevo usuario"}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Usuario *</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              {fieldErrors.username && <p className="text-xs text-destructive">{fieldErrors.username}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input id="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input id="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">
              Contraseña {user ? "(dejar vacío para mantener actual)" : "*"}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!user}
            />
            {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(c) => setIsActive(c)}
              />
              <Label htmlFor="is_active">Activo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_staff"
                checked={isStaff}
                onCheckedChange={(c) => setIsStaff(c)}
              />
              <Label htmlFor="is_staff">Staff</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_superuser"
                checked={isSuperuser}
                onCheckedChange={(c) => setIsSuperuser(c)}
              />
              <Label htmlFor="is_superuser">Superadmin</Label>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Grupos / Roles</Label>
            <div className="max-h-40 overflow-y-auto rounded-lg border p-2 space-y-1">
              {groups?.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay grupos disponibles</p>
              )}
              {groups?.map((group) => (
                <label
                  key={group.id}
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={() => toggleGroup(group.id)}
                    className="size-4"
                  />
                  {group.name}
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
