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
import { Loader2, User, Mail, Phone, Lock, IdCard } from "lucide-react";

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

      <div className="space-y-2">
        <Label htmlFor="apparId" className="flex items-center gap-2">
          <IdCard className="h-4 w-4 text-muted-foreground" />
          APPAR ID
        </Label>
        <Input
          id="apparId"
          placeholder="Enter your unique APPAR ID"
          {...register("apparId")}
          className={errors.apparId ? "border-destructive" : ""}
        />
        {errors.apparId && (
          <p className="text-sm text-destructive">{errors.apparId.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Your APPAR ID is your unique student identifier. It cannot be shared with another account.
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
