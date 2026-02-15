import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Ruler, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

const services = [
  { icon: Sparkles, title: "Luxury Design", desc: "Bespoke interiors that reflect your unique style and personality." },
  { icon: Ruler, title: "Space Planning", desc: "Optimized layouts that maximize functionality and flow." },
  { icon: Palette, title: "Color Consulting", desc: "Expert palettes that create the perfect atmosphere." },
];

const testimonials = [
  { name: "Sarah Mitchell", role: "Homeowner", text: "They transformed our living space into something we never imagined possible. Absolutely stunning work." },
  { name: "James Rodriguez", role: "Business Owner", text: "Our office now reflects the premium brand we've built. The attention to detail is remarkable." },
  { name: "Priya Sharma", role: "Homeowner", text: "From concept to completion, the entire experience was seamless and the results are breathtaking." },
];

export default function Index() {
  const { data: featuredProjects } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Luxury interior" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl animate-fade-in">
          <p className="text-sm tracking-[0.3em] uppercase mb-4 opacity-80">Interior Design Studio</p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Crafting Timeless <br /> Living Spaces
          </h1>
          <p className="text-lg md:text-xl opacity-80 mb-8 max-w-xl mx-auto">
            Where architectural vision meets refined elegance. We create interiors that inspire.
          </p>
          <Button asChild size="lg" className="text-base px-8">
            <Link to="/contact">
              Book a Consultation <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-warm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.2em] uppercase text-primary mb-2">What We Do</p>
            <h2 className="font-serif text-4xl font-bold text-foreground">Our Expertise</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((s) => (
              <Card key={s.title} className="border-0 shadow-none bg-background">
                <CardContent className="p-8 text-center">
                  <s.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.2em] uppercase text-primary mb-2">Portfolio</p>
            <h2 className="font-serif text-4xl font-bold text-foreground">Featured Projects</h2>
          </div>
          {featuredProjects && featuredProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((p) => (
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
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="font-serif text-xl font-bold">{p.name}</h3>
                        <p className="text-sm opacity-80">{p.location}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Projects coming soon. Stay tuned!</p>
          )}
          <div className="text-center mt-12">
            <Button variant="outline" asChild>
              <Link to="/portfolio">View All Projects <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.2em] uppercase opacity-70 mb-2">Testimonials</p>
            <h2 className="font-serif text-4xl font-bold">What Our Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
                <p className="text-sm leading-relaxed opacity-90 mb-6">"{t.text}"</p>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs opacity-70">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
