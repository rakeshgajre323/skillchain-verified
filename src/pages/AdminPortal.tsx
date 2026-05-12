import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, LogOut, RefreshCw, Trash2, Users, Building2, Briefcase, FileBadge, Activity } from "lucide-react";

type Overview = {
  total_users: number;
  total_students: number;
  total_institutes: number;
  total_companies: number;
  total_certs: number;
  verified_certs: number;
};

type LiveStudent = {
  user_id: string;
  full_name: string | null;
  email: string;
  appar_id: string | null;
  phone: string | null;
  last_sign_in_at: string;
};

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  institute_name: string | null;
  company_name: string | null;
  website: string | null;
  address: string | null;
  appar_id: string | null;
  status: string;
  created_at: string;
  last_sign_in_at: string | null;
};

type CredRow = {
  id: string;
  title: string;
  credential_type: string;
  issuer_name: string;
  student_full_name: string;
  student_email: string | null;
  verification_status: string;
  issued_date: string;
};

export default function AdminPortal() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [liveStudents, setLiveStudents] = useState<LiveStudent[]>([]);
  const [students, setStudents] = useState<ProfileRow[]>([]);
  const [institutes, setInstitutes] = useState<ProfileRow[]>([]);
  const [companies, setCompanies] = useState<ProfileRow[]>([]);
  const [credentials, setCredentials] = useState<CredRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [ov, ls, st, ins, co, cr] = await Promise.all([
      supabase.rpc("admin_get_overview"),
      supabase.rpc("admin_get_logged_in_students"),
      supabase.rpc("admin_list_profiles", { _role: "student" }),
      supabase.rpc("admin_list_profiles", { _role: "institute" }),
      supabase.rpc("admin_list_profiles", { _role: "company" }),
      supabase.rpc("admin_list_credentials"),
    ]);
    if (ov.data?.[0]) setOverview(ov.data[0] as Overview);
    setLiveStudents((ls.data as LiveStudent[]) || []);
    setStudents((st.data as ProfileRow[]) || []);
    setInstitutes((ins.data as ProfileRow[]) || []);
    setCompanies((co.data as ProfileRow[]) || []);
    setCredentials((cr.data as CredRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
    const t = setInterval(() => {
      supabase.rpc("admin_get_logged_in_students").then(({ data }) => {
        setLiveStudents((data as LiveStudent[]) || []);
      });
    }, 30000);
    return () => clearInterval(t);
  }, [loadAll]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/sys-control-7k9x2m", { replace: true });
  };

  const toggleStatus = async (userId: string, current: string) => {
    const next = current === "suspended" ? "active" : "suspended";
    const { error } = await supabase.rpc("admin_update_user_status", { _user_id: userId, _status: next });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: `User ${next}` });
    loadAll();
  };

  const deleteCred = async (id: string) => {
    if (!confirm("Delete this credential permanently?")) return;
    const { error } = await supabase.rpc("admin_delete_credential", { _id: id });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Credential deleted" });
    loadAll();
  };

  const filterRows = <T extends Record<string, unknown>>(rows: T[]): T[] => {
    if (!filter) return rows;
    const f = filter.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(f))
    );
  };

  if (loading && !overview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    { label: "Total Users", value: overview?.total_users ?? 0, icon: Users },
    { label: "Students", value: overview?.total_students ?? 0, icon: Users },
    { label: "Institutes", value: overview?.total_institutes ?? 0, icon: Building2 },
    { label: "Companies", value: overview?.total_companies ?? 0, icon: Briefcase },
    { label: "Certificates", value: overview?.total_certs ?? 0, icon: FileBadge },
    { label: "Verified", value: overview?.verified_certs ?? 0, icon: FileBadge },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Control Panel</h1>
            <p className="text-sm text-muted-foreground">Restricted system access</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadAll}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <k.icon className="w-3.5 h-3.5" /> {k.label}
                </div>
                <div className="text-2xl font-bold text-foreground">{k.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="live">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="live"><Activity className="w-4 h-4 mr-1" />Live Students ({liveStudents.length})</TabsTrigger>
            <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
            <TabsTrigger value="institutes">Institutes ({institutes.length})</TabsTrigger>
            <TabsTrigger value="companies">Companies ({companies.length})</TabsTrigger>
            <TabsTrigger value="creds">Credentials ({credentials.length})</TabsTrigger>
          </TabsList>

          <div className="my-4">
            <Input placeholder="Search…" value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-sm" />
          </div>

          <TabsContent value="live">
            <Card>
              <CardHeader><CardTitle>Currently logged-in students (last 15 min)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Email</TableHead>
                      <TableHead>APAAR</TableHead><TableHead>Phone</TableHead>
                      <TableHead>Last sign-in</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterRows(liveStudents).map((s) => (
                      <TableRow key={s.user_id}>
                        <TableCell>
                          <button onClick={() => navigate(`/sys-control-7k9x2m/user/${s.user_id}`)} className="text-primary hover:underline font-medium text-left">
                            {s.full_name || "—"}
                          </button>
                        </TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>{s.appar_id || "—"}</TableCell>
                        <TableCell>{s.phone || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(s.last_sign_in_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {liveStudents.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No active sessions</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader><CardTitle>All Students</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>APAAR</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last sign-in</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterRows(students).map((s) => (
                      <TableRow key={s.user_id}>
                        <TableCell>{s.full_name || "—"}</TableCell>
                        <TableCell className="text-xs">{s.email}</TableCell>
                        <TableCell>{s.appar_id || "—"}</TableCell>
                        <TableCell className="text-xs">{s.phone || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === "active" ? "default" : "destructive"}>{s.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.last_sign_in_at ? new Date(s.last_sign_in_at).toLocaleString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => toggleStatus(s.user_id, s.status)}>
                            {s.status === "suspended" ? "Activate" : "Suspend"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {students.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No students found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {(["institutes", "companies"] as const).map((key) => {
            const rows = key === "institutes" ? institutes : companies;
            return (
              <TabsContent key={key} value={key}>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>{key === "institutes" ? "Institute" : "Company"}</TableHead>
                          <TableHead>Email</TableHead><TableHead>Phone</TableHead>
                          <TableHead>Status</TableHead><TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterRows(rows).map((r) => (
                          <TableRow key={r.user_id}>
                            <TableCell>{r.full_name || "—"}</TableCell>
                            <TableCell>{key === "institutes" ? r.institute_name : r.company_name}</TableCell>
                            <TableCell className="text-xs">{r.email}</TableCell>
                            <TableCell className="text-xs">{r.phone || "—"}</TableCell>
                            <TableCell>
                              <Badge variant={r.status === "active" ? "default" : "destructive"}>{r.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => toggleStatus(r.user_id, r.status)}>
                                {r.status === "suspended" ? "Activate" : "Suspend"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}

          <TabsContent value="creds">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead><TableHead>Type</TableHead>
                      <TableHead>Issuer</TableHead><TableHead>Student</TableHead>
                      <TableHead>Status</TableHead><TableHead>Issued</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterRows(credentials).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell>{c.credential_type}</TableCell>
                        <TableCell className="text-xs">{c.issuer_name}</TableCell>
                        <TableCell className="text-xs">{c.student_full_name}<br/><span className="text-muted-foreground">{c.student_email}</span></TableCell>
                        <TableCell><Badge>{c.verification_status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(c.issued_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" onClick={() => deleteCred(c.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
