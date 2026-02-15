import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FolderOpen, MessageSquare, LogOut } from "lucide-react";

const sidebarLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/projects", icon: FolderOpen, label: "Projects" },
  { to: "/admin/leads", icon: MessageSquare, label: "Leads" },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/" className="font-serif text-lg font-bold text-sidebar-primary">ÉLITE INTERIORS</Link>
          <p className="text-xs text-sidebar-foreground/50 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {sidebarLinks.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                }`}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b">
          <span className="font-serif font-bold text-primary">Admin</span>
          <div className="flex gap-2">
            {sidebarLinks.map((l) => (
              <Link key={l.to} to={l.to}>
                <l.icon className={`h-5 w-5 ${location.pathname === l.to ? "text-primary" : "text-muted-foreground"}`} />
              </Link>
            ))}
            <button onClick={signOut}><LogOut className="h-5 w-5 text-muted-foreground" /></button>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
