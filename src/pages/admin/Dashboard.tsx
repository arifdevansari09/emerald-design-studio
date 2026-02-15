import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, MessageSquare, Eye, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: projectCount } = useQuery({
    queryKey: ["admin-project-count"],
    queryFn: async () => {
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: publishedCount } = useQuery({
    queryKey: ["admin-published-count"],
    queryFn: async () => {
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true }).eq("is_published", true);
      return count ?? 0;
    },
  });

  const { data: newLeads } = useQuery({
    queryKey: ["admin-new-leads"],
    queryFn: async () => {
      const { count } = await supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "New");
      return count ?? 0;
    },
  });

  const { data: activeProjects } = useQuery({
    queryKey: ["admin-active-projects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, name, status, updated_at")
        .neq("status", "Completed")
        .order("updated_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const stats = [
    { label: "Total Projects", value: projectCount, icon: FolderOpen },
    { label: "Published", value: publishedCount, icon: Eye },
    { label: "New Leads", value: newLeads, icon: MessageSquare },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-accent">
                <s.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Clock className="h-4 w-4" /> Active Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeProjects && activeProjects.length > 0 ? (
            <div className="space-y-3">
              {activeProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="font-medium text-sm">{p.name}</span>
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">{p.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No active projects</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
