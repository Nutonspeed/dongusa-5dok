"use client"

import type React from "react"
import { ProtectedRoute } from "../components/ProtectedRoute"
import { AdminSidebar } from "./components/AdminSidebar"
import { AdminHeader } from "./components/AdminHeader"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager", "staff"]} fallbackPath="/login">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-1 flex-col">
            <AdminHeader />
            <main className="flex-1 p-6 bg-gray-50">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
