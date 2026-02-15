import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().max(20).optional(),
  project_type: z.string().optional(),
  budget_range: z.string().optional(),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

type FormData = z.infer<typeof schema>;

const projectTypes = ["Residential", "Commercial", "Renovation", "New Construction", "Consultation"];
const budgetRanges = ["Under $25,000", "$25,000 - $50,000", "$50,000 - $100,000", "$100,000 - $250,000", "$250,000+"];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const onSubmit = async (values: FormData) => {
    const { error } = await supabase.from("inquiries").insert({
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      project_type: values.project_type || null,
      budget_range: values.budget_range || null,
      message: values.message,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[70vh]">
          <div className="text-center max-w-md px-4 animate-fade-in">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="font-serif text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-muted-foreground mb-8">
              Your inquiry has been received. We'll get back to you within 24 hours.
            </p>
            <Button asChild variant="outline">
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.2em] uppercase text-primary mb-2">Get in Touch</p>
            <h1 className="font-serif text-4xl font-bold">Request a Quote</h1>
            <p className="text-muted-foreground mt-4">
              Tell us about your project and we'll create a custom proposal for you.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="+1 (555) 000-0000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="project_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {projectTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="budget_range" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {budgetRanges.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="message" render={({ field }) => (
                <FormItem>
                  <FormLabel>Message *</FormLabel>
                  <FormControl><Textarea placeholder="Describe your project..." rows={5} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
