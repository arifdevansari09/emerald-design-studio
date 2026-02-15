import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-charcoal-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4">ÉLITE INTERIORS</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Transforming spaces into timeless masterpieces. Luxury interior design
              tailored to your vision.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/portfolio", label: "Portfolio" },
                { to: "/contact", label: "Get a Quote" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="block text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold mb-4">Contact</h4>
            <div className="space-y-3 text-sm opacity-70">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> hello@eliteinteriors.com
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> New York, NY
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs opacity-50">
          © {new Date().getFullYear()} Élite Interiors. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
