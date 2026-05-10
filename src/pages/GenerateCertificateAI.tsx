import React, { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowLeft, Loader2, Download, Upload } from "lucide-react";

export default function GenerateCertificateAI() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !rollNumber.trim() || !purpose.trim()) {
      toast({
        title: "Missing details",
        description: "Please fill in name, roll number and purpose.",
        variant: "destructive",
      });
      return;
    }
    setGenerating(true);
    setImageUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-certificate-ai", {
        body: {
          studentName: studentName.trim(),
          rollNumber: rollNumber.trim(),
          purpose: purpose.trim(),
          issuerName: profile?.institute_name || profile?.full_name || "Institute",
        },
      });
      if (error) throw error;
      if (!data?.imageUrl) throw new Error("No certificate generated");
      setImageUrl(data.imageUrl);
      toast({ title: "Certificate generated", description: "Review and download below." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      toast({ title: "Could not generate", description: msg, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `certificate-${rollNumber || "ai"}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleUseInIssue = () => {
    // Pre-fill the issue page with these details
    const params = new URLSearchParams({
      ai_name: studentName,
      ai_roll: rollNumber,
      ai_purpose: purpose,
    });
    navigate(`/issue-credential?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-3xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to dashboard
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                Create Certificate with AI
              </h1>
              <p className="text-muted-foreground">
                Generate a professional certificate image from a few details.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleGenerate}
            className="rounded-2xl border border-border bg-card p-6 space-y-4"
          >
            <div>
              <Label htmlFor="studentName">Student Name *</Label>
              <Input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                maxLength={100}
                disabled={generating}
              />
            </div>
            <div>
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. CS-2024-018"
                maxLength={50}
                disabled={generating}
              />
            </div>
            <div>
              <Label htmlFor="purpose">Purpose of Certificate *</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={3}
                placeholder="e.g. Completion of Advanced Web Development workshop with distinction"
                maxLength={500}
                disabled={generating}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" /> Generate with AI
                  </>
                )}
              </Button>
            </div>
          </form>

          {imageUrl && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-display font-semibold text-lg">Preview</h2>
              <div className="rounded-xl overflow-hidden border border-border bg-muted">
                <img
                  src={imageUrl}
                  alt="AI generated certificate"
                  className="w-full h-auto block"
                />
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                <Button onClick={handleUseInIssue}>
                  <Upload className="h-4 w-4 mr-2" /> Issue to Student
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Download the image, then upload it on the Issue Certificate page to officially issue it to the student.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
