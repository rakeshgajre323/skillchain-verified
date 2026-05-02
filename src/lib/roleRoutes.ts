import type { Profile } from "@/hooks/useAuth";

type Role = "student" | "institute" | "company";

/**
 * The page a user should land on after login (or when visiting `/` while
 * authenticated). Centralized so Login, route guards, and the home page agree.
 */
export function getHomeForRole(role: Role | null | undefined): string {
  switch (role) {
    case "institute":
      return "/issue-credential";
    case "company":
      return "/credentials";
    case "student":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

export function getHomeForProfile(profile: Pick<Profile, "role"> | null | undefined): string {
  return getHomeForRole(profile?.role);
}
