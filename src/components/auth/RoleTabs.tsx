import { cn } from "@/lib/utils";
import { GraduationCap, Building2, Briefcase } from "lucide-react";

export type UserRole = "student" | "institute" | "company";

interface RoleTabsProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roles = [
  { id: "student" as const, label: "Student", icon: GraduationCap, description: "For learners & graduates" },
  { id: "institute" as const, label: "Institute", icon: Building2, description: "For schools & universities" },
  { id: "company" as const, label: "Company", icon: Briefcase, description: "For employers & recruiters" },
];

export function RoleTabs({ activeRole, onRoleChange }: RoleTabsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {roles.map((role) => {
        const Icon = role.icon;
        const isActive = activeRole === role.id;

        return (
          <button
            key={role.id}
            onClick={() => onRoleChange(role.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 group",
              isActive
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <div
              className={cn(
                "p-3 rounded-lg transition-all duration-300",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "font-medium text-sm transition-colors",
                isActive ? "text-primary" : "text-foreground"
              )}
            >
              {role.label}
            </span>
            <span className="text-xs text-muted-foreground text-center hidden sm:block">
              {role.description}
            </span>
            {isActive && (
              <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
