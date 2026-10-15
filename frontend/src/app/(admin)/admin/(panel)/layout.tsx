"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Toaster } from "@/components/ui/sonner";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (!user) {
    router.push("/admin/login");
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense>
        <AuthGate>{children}</AuthGate>
        <Toaster richColors position="top-right" />
      </Suspense>
    </AuthProvider>
  );
}
