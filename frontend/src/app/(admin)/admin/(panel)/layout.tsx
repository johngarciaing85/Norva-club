import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Toaster } from "@/components/ui/sonner";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AdminShell>{children}</AdminShell>
      <Toaster richColors position="top-right" />
    </Suspense>
  );
}
