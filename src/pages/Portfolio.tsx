import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function Portfolio() {
  const [filter, setFilter] = useState("All");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["public-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const locations = projects
    ? ["All", ...Array.from(new Set(projects.map((p) => p.location).filter(Boolean)))]
    : ["All"];

  const filtered = filter === "All" ? projects : projects?.filter((p) => p.location === filter);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.2em] uppercase text-primary mb-2">Our Work</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold">Portfolio</h1>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {locations.map((loc) => (
              <Button
                key={loc}
                variant={filter === loc ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(loc as string)}
              >
                {loc}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <Link key={p.id} to={`/project/${p.id}`} className="group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                    {p.cover_image_url ? (
                      <img
                        src={p.cover_image_url}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/40 transition-colors duration-300 flex items-end p-6">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="font-serif text-xl font-bold">{p.name}</h3>
                        <p className="text-sm opacity-80">{p.location}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">No projects published yet.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
