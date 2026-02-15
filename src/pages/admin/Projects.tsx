import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

const statuses = ["Design Phase", "Woodwork Started", "Painting in Progress", "Furnishing", "Completed"];

const emptyForm = {
  name: "", client: "", location: "", budget: "", square_feet: "", description: "", status: "Design Phase",
  is_published: false, is_featured: false,
};

export default function Projects() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [imageDialogProject, setImageDialogProject] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: projectImages } = useQuery({
    queryKey: ["admin-project-images", imageDialogProject],
    queryFn: async () => {
      const { data } = await supabase
        .from("project_images")
        .select("*")
        .eq("project_id", imageDialogProject!)
        .order("sort_order");
      return data ?? [];
    },
    enabled: !!imageDialogProject,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from("projects").update(form).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: editId ? "Project updated" : "Project created" });
      setDialogOpen(false);
      setEditId(null);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "Project deleted" });
    },
  });

  const handleEdit = (p: Project) => {
    setEditId(p.id);
    setForm({
      name: p.name, client: p.client ?? "", location: p.location ?? "", budget: p.budget ?? "",
      square_feet: p.square_feet ?? "", description: p.description ?? "", status: p.status,
      is_published: p.is_published, is_featured: p.is_featured,
    });
    setDialogOpen(true);
  };

  const handleUploadImages = async (projectId: string, files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${projectId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("project-images").upload(path, file);
      if (uploadError) { toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" }); continue; }

      const { data: urlData } = supabase.storage.from("project-images").getPublicUrl(path);
      await supabase.from("project_images").insert({
        project_id: projectId,
        image_url: urlData.publicUrl,
        category: "General",
      });
    }
    // Set first image as cover if none exists
    const project = projects?.find((p) => p.id === projectId);
    if (project && !project.cover_image_url) {
      const { data: imgs } = await supabase
        .from("project_images")
        .select("image_url")
        .eq("project_id", projectId)
        .limit(1);
      if (imgs && imgs[0]) {
        await supabase.from("projects").update({ cover_image_url: imgs[0].image_url }).eq("id", projectId);
      }
    }
    qc.invalidateQueries({ queryKey: ["admin-project-images"] });
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
    setUploading(false);
    toast({ title: "Images uploaded" });
  };

  const deleteImage = async (imgId: string) => {
    await supabase.from("project_images").delete().eq("id", imgId);
    qc.invalidateQueries({ queryKey: ["admin-project-images"] });
  };

  const setCover = async (projectId: string, imageUrl: string) => {
    await supabase.from("projects").update({ cover_image_url: imageUrl }).eq("id", projectId);
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
    toast({ title: "Cover image updated" });
  };

  const filtered = projects?.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold">Projects</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">{editId ? "Edit Project" : "New Project"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Client</Label><Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></div>
                <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Budget</Label><Input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
                <div className="space-y-2"><Label>Square Feet</Label><Input value={form.square_feet} onChange={(e) => setForm({ ...form, square_feet: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                  <Label>Published</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                  <Label>Featured</Label>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 max-w-sm" />

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">{p.status}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{p.is_published ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setImageDialogProject(p.id)}><ImageIcon className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this project?")) deleteMutation.mutate(p.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Image manager dialog */}
      <Dialog open={!!imageDialogProject} onOpenChange={(o) => !o && setImageDialogProject(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Manage Images</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="img-upload" className="cursor-pointer inline-flex items-center gap-2 border border-dashed rounded-lg p-4 hover:bg-muted transition-colors w-full justify-center">
                <Upload className="h-5 w-5" /> {uploading ? "Uploading..." : "Click to upload images"}
              </Label>
              <input
                id="img-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && imageDialogProject && handleUploadImages(imageDialogProject, e.target.files)}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {projectImages?.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.image_url} alt={img.category} className="aspect-square object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setCover(imageDialogProject!, img.image_url)}>Cover</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteImage(img.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">{img.category}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
