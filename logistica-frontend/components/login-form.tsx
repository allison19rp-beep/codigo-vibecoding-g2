"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLogin } from "@/hooks/use-login"
import { useAuth } from "@/hooks/use-auth"

export function LoginForm() {
  const router = useRouter()
  const { mutate, isPending } = useLogin()
  const isAuthenticated = useAuth((s) => s.isAuthenticated)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  if (isAuthenticated) {
    router.push("/dashboard")
    return null
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    mutate(
      { username, password },
      {
        onSuccess: () => {
          router.push("/dashboard")
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          type="text"
          placeholder="Ingresa tu usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isPending}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "Ingresando..." : "Iniciar sesión"}
      </Button>
    </form>
  )
}
