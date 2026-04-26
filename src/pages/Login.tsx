import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Shield,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  Briefcase,
  IdCard,
  Hash,
} from "lucide-react";

type LoginRole = "student" | "university" | "company";

const roles: {
  id: LoginRole;
  label: string;
  title: string;
  description: string;
  icon: typeof GraduationCap;
}[] = [
  {
    id: "student",
    label: "Student",
    title: "Login as Student",
    description: "Access your verified credentials",
    icon: GraduationCap,
  },
  {
    id: "university",
    label: "University",
    title: "Login as University",
    description: "Issue and manage certificates",
    icon: Building2,
  },
  {
    id: "company",
    label: "Company",
    title: "Login as Company",
    description: "Verify candidate credentials",
    icon: Briefcase,
  },
];

const baseSchema = {
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
};

const studentSchema = z.object({
  ...baseSchema,
  appar_id: z.string().min(3, "APPAR ID is required"),
});

const orgSchema = z.object({
  ...baseSchema,
  registration_number: z.string().min(3, "Registration number is required"),
});

type StudentForm = z.infer<typeof studentSchema>;
type OrgForm = z.infer<typeof orgSchema>;

export default function Login() {
  const [activeRole, setActiveRole] = useState<LoginRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();

  const isStudent = activeRole === "student";
  const schema = isStudent ? studentSchema : orgSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentForm | OrgForm>({
    resolver: zodResolver(schema),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRoleChange = (role: LoginRole) => {
    setActiveRole(role);
    reset();
  };

  const onSubmit = async (data: StudentForm | OrgForm) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email before logging in.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Enforce portal/role separation: a Student cannot sign in via the
      // University or Company portal, and vice versa.
      const expectedRole =
        activeRole === "student"
          ? "student"
          : activeRole === "university"
          ? "institute"
          : "company";

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        toast.error("Could not establish a session. Please try again.");
        await supabase.auth.signOut();
        return;
      }

      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (profileError || !profileRow) {
        await supabase.auth.signOut();
        toast.error("Account profile not found. Please contact support.");
        return;
      }

      if (profileRow.role !== expectedRole) {
        await supabase.auth.signOut();
        toast.error(
          `Invalid credentials or insufficient permissions. This account is not registered as a ${active.label}.`
        );
        return;
      }

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const active = roles.find((r) => r.id === activeRole)!;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Choose your role to sign in to CertiVault
            </p>
          </div>

          {/* Role tabs */}
          <div
            role="tablist"
            aria-label="Select login role"
            className="grid grid-cols-3 gap-2 sm:gap-3 mb-6"
          >
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleRoleChange(r.id)}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-4 rounded-xl border-2 transition-all duration-300 group",
                    isActive
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 sm:p-2.5 rounded-lg transition-all duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span
                    className={cn(
                      "font-medium text-xs sm:text-sm transition-colors",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {r.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="glass-card rounded-2xl p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-display font-semibold">
                {active.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {active.description}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              {isStudent ? (
                <div className="space-y-2">
                  <Label htmlFor="appar_id" className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                    APPAR ID
                  </Label>
                  <Input
                    id="appar_id"
                    type="text"
                    placeholder="Enter your APPAR ID"
                    {...register("appar_id" as const)}
                    className={
                      (errors as Record<string, { message?: string }>).appar_id
                        ? "border-destructive"
                        : ""
                    }
                  />
                  {(errors as Record<string, { message?: string }>).appar_id && (
                    <p className="text-sm text-destructive">
                      {
                        (errors as Record<string, { message?: string }>).appar_id
                          ?.message
                      }
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label
                    htmlFor="registration_number"
                    className="flex items-center gap-2"
                  >
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    Registration Number
                  </Label>
                  <Input
                    id="registration_number"
                    type="text"
                    placeholder={
                      activeRole === "university"
                        ? "University registration number"
                        : "Company registration number"
                    }
                    {...register("registration_number" as const)}
                    className={
                      (errors as Record<string, { message?: string }>)
                        .registration_number
                        ? "border-destructive"
                        : ""
                    }
                  />
                  {(errors as Record<string, { message?: string }>)
                    .registration_number && (
                    <p className="text-sm text-destructive">
                      {
                        (errors as Record<string, { message?: string }>)
                          .registration_number?.message
                      }
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`pr-10 ${
                      errors.password ? "border-destructive" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message as string}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In as {active.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary font-medium hover:underline"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
