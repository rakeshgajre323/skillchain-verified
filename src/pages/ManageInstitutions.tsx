import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Upload, Image as ImageIcon } from "lucide-react";

interface InstitutionLogo {
  id: string;
  name: string;
  logo_url: string;
  display_order: number;
  is_active: boolean;
}

const BUCKET = "institution-logos";

export default function ManageInstitutions() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<InstitutionLogo[]>([]);
  const [fetching, setFetching] = useState(true);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAll = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("institution_logos")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      toast({ title: "Failed to load logos", description: error.message, variant: "destructive" });
    } else {
      setItems(data ?? []);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (profile?.role === "institute") fetchAll();
  }, [profile?.role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (profile && profile.role !== "institute") return <Navigate to="/dashboard" replace />;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) {
      toast({ title: "Missing fields", description: "Name and image are required.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2 MB per logo.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const nextOrder = (items[items.length - 1]?.display_order ?? -1) + 1;
      const { error: insErr } = await supabase.from("institution_logos").insert({
        name: name.trim(),
        logo_url: pub.publicUrl,
        display_order: nextOrder,
        is_active: true,
        created_by: user.id,
      });
      if (insErr) throw insErr;

      toast({ title: "Logo added", description: name.trim() });
      setName("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      fetchAll();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message ?? String(err), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (item: InstitutionLogo) => {
    const { error } = await supabase
      .from("institution_logos")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i)));
    }
  };

  const updateOrder = async (item: InstitutionLogo, value: number) => {
    const { error } = await supabase
      .from("institution_logos")
      .update({ display_order: value })
      .eq("id", item.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setItems((prev) =>
        [...prev.map((i) => (i.id === item.id ? { ...i, display_order: value } : i))].sort(
          (a, b) => a.display_order - b.display_order,
        ),
      );
    }
  };

  const remove = async (item: InstitutionLogo) => {
    if (!confirm(`Remove "${item.name}" from the carousel?`)) return;
    // Best-effort storage cleanup (ignore if URL isn't ours)
    try {
      const marker = `/${BUCKET}/`;
      const idx = item.logo_url.indexOf(marker);
      if (idx !== -1) {
        const path = item.logo_url.slice(idx + marker.length);
        await supabase.storage.from(BUCKET).remove([path]);
      }
    } catch {
      /* noop */
    }
    const { error } = await supabase.from("institution_logos").delete().eq("id", item.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast({ title: "Logo removed" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 sm:py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Manage Institution Logos</h1>
          <p className="text-muted-foreground">
            Add, reorder, hide, or remove the partner logos that appear on the home page carousel.
          </p>
        </div>

        {/* Upload form */}
        <form
          onSubmit={handleUpload}
          className="surface-card mb-10 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="inst-name">Institution name</Label>
            <Input
              id="inst-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Indian Institute of Technology, Madras"
              maxLength={120}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="inst-file">Logo image (PNG/JPG/WebP, ≤ 2 MB)</Label>
            <Input
              id="inst-file"
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </div>
          <Button type="submit" disabled={uploading} className="gap-2">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Add logo
          </Button>
        </form>

        {/* List */}
        <div>
          <h2 className="text-xl font-display font-semibold mb-4">Current logos ({items.length})</h2>
          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="surface-card text-center text-muted-foreground py-12">
              <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
              No logos yet. The home page is showing the default set until you add some.
            </div>
          ) : (
            <ul className="grid gap-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="surface-card flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-background border border-border flex items-center justify-center p-2">
                    <img
                      src={item.logo_url}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.logo_url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`order-${item.id}`} className="text-xs text-muted-foreground">
                      Order
                    </Label>
                    <Input
                      id={`order-${item.id}`}
                      type="number"
                      className="w-20"
                      value={item.display_order}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isNaN(v)) updateOrder(item, v);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`active-${item.id}`}
                      checked={item.is_active}
                      onCheckedChange={() => toggleActive(item)}
                    />
                    <Label htmlFor={`active-${item.id}`} className="text-xs text-muted-foreground">
                      {item.is_active ? "Visible" : "Hidden"}
                    </Label>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(item)} aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
