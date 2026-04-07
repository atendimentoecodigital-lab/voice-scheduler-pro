import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TeamBadge } from "./TeamBadge";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-[240px] transition-all duration-300">
        <div className="flex items-center justify-end px-6 py-3 border-b border-border">
          <TeamBadge />
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
