import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSignupSchema, StudentSignupData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, User, Mail, Phone, Lock, IdCard, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function StudentSignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentSignupData>({
    resolver: zodResolver(studentSignupSchema),
  });

  const onSubmit = async (data: StudentSignupData) => {
    setIsLoading(true);
    try {
      const { error, userId } = await signUp(data.email, data.password, {
        role: "student",
        full_name: data.fullName,
        phone: data.phone,
        appar_id: data.apparId || null,
        status: "active",
      });

      if (error) {
        const msg = error.message || "";
        if (msg.includes("already registered")) {
          toast.error("This email is already registered. Please login instead.");
        } else if (
          msg.includes("profiles_student_appar_id_unique") ||
          (msg.toLowerCase().includes("duplicate") && msg.toLowerCase().includes("appar"))
        ) {
          toast.error("This APPAR ID is already registered to another student.");
        } else {
          toast.error(msg);
        }
        return;
      }

      if (userId) {
        toast.success("Account created! You can now sign in.");
        navigate("/login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* APAAR ID — primary, most important field */}
      <div className="relative space-y-2 rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 shadow-sm ring-1 ring-primary/10">
        <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          Required
        </span>
        <Label htmlFor="apparId" className="flex items-center gap-2 text-base font-semibold">
          <IdCard className="h-5 w-5 text-primary" />
          APAAR ID
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger type="button" aria-label="Why is APAAR ID required?">
                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                APAAR ID (Automated Permanent Academic Account Registry) is a
                government-issued 12-digit lifetime ID linked to your Aadhaar.
                It uniquely identifies you as a student so issued credentials
                are tied to the right person and can be verified across
                institutions.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Input
          id="apparId"
          placeholder="Enter your 12-digit APAAR ID"
          {...register("apparId")}
          className={`h-12 text-base font-mono tracking-wider bg-background ${errors.apparId ? "border-destructive" : "border-primary/30 focus-visible:ring-primary"}`}
        />
        {errors.apparId && (
          <p className="text-sm text-destructive">{errors.apparId.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Your APAAR ID is your unique lifetime student identifier. It cannot be shared with another account and is required to receive verified credentials.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Full Name
        </Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          {...register("fullName")}
          className={errors.fullName ? "border-destructive" : ""}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
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



      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Student Account"
        )}
      </Button>
    </form>
  );
}
