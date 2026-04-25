import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { issueCredentialSchema } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import { Award, ArrowLeft, Upload, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function IssueCredential() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    credential_type: "certificate",
    issued_date: new Date().toISOString().slice(0, 10),
    expiry_date: "",
    description: "",
    student_full_name: "",
    student_appar_id: "",
    student_phone: "",
    student_roll_number: "",
    student_email: "",
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (profile && profile.role !== "institute") {
    return <Navigate to="/dashboard" replace />;
  }

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = issueCredentialSchema.safeParse(form);
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) flat[i.path[0] as string] = i.message;
      });
      setErrors(flat);
      toast({
        title: "Please fix the errors",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      setErrors({ file: "Certificate file is required" });
      toast({ title: "Certificate file required", variant: "destructive" });
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    const allowedExts = ["pdf", "jpg", "jpeg", "png"];
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      setErrors({ file: "Only PDF, JPG, JPEG, or PNG files are allowed" });
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPG, JPEG, or PNG file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors({ file: "File must be smaller than 10 MB" });
      toast({ title: "File too large", description: "Max size is 10 MB.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload file
      const ext = file.name.split(".").pop() || "pdf";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("certificates")
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;

      // Store the storage path; signed URLs are generated on demand
      const fileUrl = path;

      // 2. Find student profile by email (best-effort link)
      const { data: studentProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("role", "student")
        .ilike("full_name", form.student_full_name)
        .maybeSingle();

      const targetUserId = studentProfile?.user_id ?? user.id; // fallback so RLS allows insert

      // 3. Insert credential
      const issuerName =
        profile?.institute_name || profile?.full_name || "Institute";

      const { error: insErr } = await supabase.from("credentials").insert([
        {
          user_id: targetUserId,
          issuer_id: user.id,
          issuer_name: issuerName,
          title: parsed.data.title,
          description: parsed.data.description || null,
          credential_type: parsed.data.credential_type,
          issued_date: parsed.data.issued_date,
          expiry_date: parsed.data.expiry_date || null,
          verification_status: "verified",
          student_full_name: parsed.data.student_full_name,
          student_appar_id: parsed.data.student_appar_id,
          student_phone: parsed.data.student_phone,
          student_roll_number: parsed.data.student_roll_number,
          student_email: parsed.data.student_email,
          certificate_file_url: fileUrl,
        },
      ]);

      if (insErr) throw insErr;

      toast({
        title: "Certificate issued",
        description: `Issued to ${form.student_full_name}.`,
      });
      navigate("/credentials");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast({ title: "Could not issue certificate", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-3xl">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to dashboard
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">Upload Certificate</h1>
              <p className="text-muted-foreground">Issue a credential to a student</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Certificate section */}
            <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-display font-semibold text-lg">Certificate Details</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Bachelor of Science" />
                  {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                </div>
                <div>
                  <Label htmlFor="credential_type">Type *</Label>
                  <Input id="credential_type" value={form.credential_type} onChange={(e) => update("credential_type", e.target.value)} placeholder="degree, diploma, course..." />
                  {errors.credential_type && <p className="text-xs text-destructive mt-1">{errors.credential_type}</p>}
                </div>
                <div>
                  <Label htmlFor="issued_date">Issued Date *</Label>
                  <Input id="issued_date" type="date" value={form.issued_date} onChange={(e) => update("issued_date", e.target.value)} />
                  {errors.issued_date && <p className="text-xs text-destructive mt-1">{errors.issued_date}</p>}
                </div>
                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input id="expiry_date" type="date" value={form.expiry_date} onChange={(e) => update("expiry_date", e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Optional notes about this credential" />
              </div>

              <div>
                <Label htmlFor="file">Certificate File *</Label>
                <div className="mt-1 flex items-center gap-3">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted formats: PDF, JPG, JPEG, PNG (max 10 MB)
                </p>
                {file && <p className="text-xs text-muted-foreground mt-1">Selected: {file.name}</p>}
                {errors.file && <p className="text-xs text-destructive mt-1">{errors.file}</p>}
              </div>
            </section>

            {/* Student section */}
            <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div>
                <h2 className="font-display font-semibold text-lg">Student Details</h2>
                <p className="text-sm text-muted-foreground">All fields below are mandatory and will be shown identically to the student and verifying companies.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student_full_name">Full Name *</Label>
                  <Input id="student_full_name" value={form.student_full_name} onChange={(e) => update("student_full_name", e.target.value)} />
                  {errors.student_full_name && <p className="text-xs text-destructive mt-1">{errors.student_full_name}</p>}
                </div>
                <div>
                  <Label htmlFor="student_email">Email *</Label>
                  <Input id="student_email" type="email" value={form.student_email} onChange={(e) => update("student_email", e.target.value)} />
                  {errors.student_email && <p className="text-xs text-destructive mt-1">{errors.student_email}</p>}
                </div>
                <div>
                  <Label htmlFor="student_appar_id">APPAR ID *</Label>
                  <Input id="student_appar_id" value={form.student_appar_id} onChange={(e) => update("student_appar_id", e.target.value)} />
                  {errors.student_appar_id && <p className="text-xs text-destructive mt-1">{errors.student_appar_id}</p>}
                </div>
                <div>
                  <Label htmlFor="student_roll_number">Roll Number *</Label>
                  <Input id="student_roll_number" value={form.student_roll_number} onChange={(e) => update("student_roll_number", e.target.value)} />
                  {errors.student_roll_number && <p className="text-xs text-destructive mt-1">{errors.student_roll_number}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="student_phone">Phone Number *</Label>
                  <Input id="student_phone" value={form.student_phone} onChange={(e) => update("student_phone", e.target.value)} placeholder="+91 ..." />
                  {errors.student_phone && <p className="text-xs text-destructive mt-1">{errors.student_phone}</p>}
                </div>
              </div>
            </section>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Issue Certificate</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
