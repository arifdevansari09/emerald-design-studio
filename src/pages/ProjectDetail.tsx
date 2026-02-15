import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, DollarSign, Maximize, X } from "lucide-react";
import { useState } from "react";

export default function ProjectDetail() {
  const { id } = useParams();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id!)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: images } = useQuery({
    queryKey: ["project-images", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_images")
        .select("*")
        .eq("project_id", id!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center py-20">
          <h1 className="font-serif text-3xl font-bold mb-4">Project Not Found</h1>
          <Button asChild variant="outline">
            <Link to="/portfolio">Back to Portfolio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Portfolio
          </Link>

          {/* Hero image */}
          {project.cover_image_url && (
            <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
              <img src={project.cover_image_url} alt={project.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h1 className="font-serif text-4xl font-bold mb-4">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
              )}

              {/* Image gallery */}
              {images && images.length > 0 && (
                <div className="mt-12">
                  <h2 className="font-serif text-2xl font-bold mb-6">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setLightboxIdx(i)}
                        className="relative aspect-square overflow-hidden rounded-lg group"
                      >
                        <img src={img.image_url} alt={img.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-2 left-2 text-xs bg-charcoal/70 text-white px-2 py-1 rounded">{img.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-muted rounded-lg p-6 space-y-4">
                <h3 className="font-serif text-lg font-bold">Project Details</h3>
                {project.client && <div className="text-sm"><span className="text-muted-foreground">Client:</span> {project.client}</div>}
                {project.location && (
                  <div className="text-sm flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" /> {project.location}</div>
                )}
                {project.budget && (
                  <div className="text-sm flex items-center gap-1"><DollarSign className="h-3 w-3 text-muted-foreground" /> {project.budget}</div>
                )}
                {project.square_feet && (
                  <div className="text-sm flex items-center gap-1"><Maximize className="h-3 w-3 text-muted-foreground" /> {project.square_feet} sq ft</div>
                )}
                <div className="text-sm"><span className="text-muted-foreground">Status:</span> {project.status}</div>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link to="/contact">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxIdx !== null && images && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxIdx(null)}>
            <X className="h-8 w-8" />
          </button>
          <img src={images[lightboxIdx].image_url} alt="" className="max-h-[90vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                className={`w-2 h-2 rounded-full ${i === lightboxIdx ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
