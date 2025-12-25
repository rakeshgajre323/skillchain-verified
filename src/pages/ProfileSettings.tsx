import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Briefcase,
  Globe,
  MapPin,
  Lock,
  Save,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

const profileSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  institute_name: z.string().optional(),
  company_name: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfileSettings() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      institute_name: "",
      company_name: "",
      website: "",
      address: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        institute_name: profile.institute_name || "",
        company_name: profile.company_name || "",
        website: profile.website || "",
        address: profile.address || "",
      });
    }
  }, [profile, profileForm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading settings...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name || null,
          phone: data.phone || null,
          institute_name: data.institute_name || null,
          company_name: data.company_name || null,
          website: data.website || null,
          address: data.address || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setChangingPassword(true);
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) throw updateError;

      passwordForm.reset();
      toast.success("Password changed successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleIcon = () => {
    switch (profile?.role) {
      case "student":
        return GraduationCap;
      case "institute":
        return Building2;
      case "company":
        return Briefcase;
      default:
        return User;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-3xl">
          {/* Back Link */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-primary/10">
                <RoleIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Profile Settings
                </h1>
                <p className="text-muted-foreground">
                  Manage your account information and security
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </h2>

            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input value={user.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              {/* Role-specific fields */}
              {profile?.role === "student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      {...profileForm.register("full_name")}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      {...profileForm.register("phone")}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </>
              )}

              {profile?.role === "institute" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="institute_name" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Institute Name
                    </Label>
                    <Input
                      id="institute_name"
                      {...profileForm.register("institute_name")}
                      placeholder="Enter institute name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      {...profileForm.register("website")}
                      placeholder="https://example.com"
                    />
                    {profileForm.formState.errors.website && (
                      <p className="text-xs text-destructive">
                        {profileForm.formState.errors.website.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      {...profileForm.register("address")}
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      {...profileForm.register("phone")}
                      placeholder="Enter phone number"
                    />
                  </div>
                </>
              )}

              {profile?.role === "company" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Company Name
                    </Label>
                    <Input
                      id="company_name"
                      {...profileForm.register("company_name")}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      {...profileForm.register("website")}
                      placeholder="https://example.com"
                    />
                    {profileForm.formState.errors.website && (
                      <p className="text-xs text-destructive">
                        {profileForm.formState.errors.website.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      {...profileForm.register("address")}
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      {...profileForm.register("phone")}
                      placeholder="Enter phone number"
                    />
                  </div>
                </>
              )}

              <Button type="submit" disabled={savingProfile} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>

          {/* Change Password */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </h2>

            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  placeholder="Enter current password"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register("newPassword")}
                  placeholder="Enter new password"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register("confirmPassword")}
                  placeholder="Confirm new password"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={changingPassword} variant="outline" className="w-full sm:w-auto">
                <Lock className="h-4 w-4 mr-2" />
                {changingPassword ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
