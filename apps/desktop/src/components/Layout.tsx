import { Outlet } from "react-router-dom";
import Topbar from "@/pages/dashboard/components/Topbar";

export function Layout() {
  return (
    <div className="h-screen flex bg-background text-foreground">
      <div />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
