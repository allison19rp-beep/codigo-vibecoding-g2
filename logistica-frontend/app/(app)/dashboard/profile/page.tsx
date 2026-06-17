"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function ProfilePage() {
  const authUsername = useAuth((s) => s.username)
  const authId = useAuth((s) => s.userId)
  const authEmail = useAuth((s) => s.email)
  const authFirstName = useAuth((s) => s.firstName)
  const authLastName = useAuth((s) => s.lastName)
  const authSuperuser = useAuth((s) => s.isSuperuser)
  const { data: currentUser, isLoading } = useCurrentUser()

  const user = currentUser
  const username = user?.username ?? authUsername
  const userId = user?.id ?? authId
  const email = user?.email ?? authEmail
  const firstName = user?.first_name ?? authFirstName
  const lastName = user?.last_name ?? authLastName
  const isSuperuser = user?.is_superuser ?? authSuperuser

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || username || "Usuario"
  const initial = displayName.charAt(0).toUpperCase()
  const groups = user?.groups ?? []

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Perfil</h1>

      <Card>
        <CardHeader className="flex flex-col items-center gap-3 sm:flex-row">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {initial}
          </div>
          <div className="text-center sm:text-left">
            <CardTitle>{displayName}</CardTitle>
            <CardDescription>ID de usuario: {userId ?? "—"}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de la cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Usuario</span>
            <span className="font-medium">{username ?? "—"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{email ?? "—"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Nombre</span>
            <span className="font-medium">{firstName || "—"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Apellido</span>
            <span className="font-medium">{lastName || "—"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">ID de usuario</span>
            <span className="font-medium">{userId ?? "—"}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-muted-foreground">Rol</span>
            <span className="font-medium">
              {isLoading ? (
                <Skeleton className="inline-block h-4 w-20" />
              ) : isSuperuser ? (
                "Superadmin"
              ) : groups.length > 0 ? (
                groups.map((g) => g.name).join(", ")
              ) : (
                "Usuario"
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grupos / Roles</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <Badge key={g.id} variant="secondary">
                {g.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
