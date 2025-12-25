import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySignupSchema, CompanySignupData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Briefcase, Mail, Phone, Lock, Globe } from "lucide-react";

export function CompanySignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanySignupData>({
    resolver: zodResolver(companySignupSchema),
  });

  const onSubmit = async (data: CompanySignupData) => {
    setIsLoading(true);
    try {
      const { error, userId } = await signUp(data.officialEmail, data.password, {
        role: "company",
        company_name: data.companyName,
        phone: data.phone,
        website: data.website || null,
        status: "pending",
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please login instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (userId) {
        const { error: otpError } = await supabase.functions.invoke("send-otp", {
          body: { userId, email: data.officialEmail },
        });

        if (otpError) {
          toast.error("Account created but failed to send verification code.");
          navigate("/login");
          return;
        }

        toast.success("Account created! Please verify your email.");
        navigate("/verify-otp", { state: { userId, email: data.officialEmail } });
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="companyName" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          Company Name
        </Label>
        <Input
          id="companyName"
          placeholder="Acme Corporation"
          {...register("companyName")}
          className={errors.companyName ? "border-destructive" : ""}
        />
        {errors.companyName && (
          <p className="text-sm text-destructive">{errors.companyName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="officialEmail" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          Official Email
        </Label>
        <Input
          id="officialEmail"
          type="email"
          placeholder="hr@company.com"
          {...register("officialEmail")}
          className={errors.officialEmail ? "border-destructive" : ""}
        />
        {errors.officialEmail && (
          <p className="text-sm text-destructive">{errors.officialEmail.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 234 567 8900"
          {...register("phone")}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          className={errors.password ? "border-destructive" : ""}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Min 8 characters, 1 number, 1 symbol
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website" className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          Website <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="website"
          type="url"
          placeholder="https://company.com"
          {...register("website")}
        />
        {errors.website && (
          <p className="text-sm text-destructive">{errors.website.message}</p>
        )}
      </div>

      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Company Account"
        )}
      </Button>
    </form>
  );
}
