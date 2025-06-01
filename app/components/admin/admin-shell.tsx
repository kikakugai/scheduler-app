import { NavLink } from "react-router";
import type { ReactNode } from "react";
import { AdminHeader } from "./admin-header";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col mx-auto w-full max-w-5xl">
        <header className="sticky top-0 z-10 border-b bg-background px-4 sm:px-6 md:px-8 py-4">
          <AdminHeader />
        </header>
        <main className="flex-1 space-y-6 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
