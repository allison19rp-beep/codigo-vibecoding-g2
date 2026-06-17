import type { CustomerType } from "@/types/customers"

export function formatCustomerType(value: CustomerType): string {
  return value === "COMPANY" ? "Empresa" : "Individual"
}

export function getCustomerTypeVariant(value: CustomerType): "default" | "secondary" {
  return value === "COMPANY" ? "default" : "secondary"
}

export function formatIsActive(value: boolean): string {
  return value ? "Activo" : "Inactivo"
}

export function getIsActiveVariant(value: boolean): "success" | "secondary" {
  return value ? "success" : "secondary"
}
