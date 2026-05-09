import { Link, useNavigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Shield,
  LogOut,
  Menu,
  X,
  BarChart3,
  LayoutDashboard,
  User as UserIcon,
  Award,
  FileEdit,
  Inbox,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getHomeForRole } from "@/lib/roleRoutes";
import digitalIndiaLogo from "@/assets/digital-india-logo.png";

type NavItem = { to: string; label: string; icon?: typeof Shield };

function getRoleNavItems(role: "student" | "institute" | "company" | undefined): NavItem[] {
  if (!role) return [];
  if (role === "student") {
    return [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/credentials", label: "My Credentials", icon: Award },
      { to: "/request-credential", label: "Request", icon: FileEdit },
    ];
  }
  if (role === "institute") {
    return [
      { to: "/issue-credential", label: "Issue", icon: FileEdit },
      { to: "/manage-requests", label: "Requests", icon: Inbox },
      { to: "/manage-institutions", label: "Logos", icon: ImageIcon },
      { to: "/admin", label: "Admin", icon: BarChart3 },
    ];
  }
  // company
  return [
    { to: "/credentials", label: "Verify", icon: Search },
    { to: "/admin", label: "Admin", icon: BarChart3 },
  ];
}

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName =
    profile?.full_name || profile?.institute_name || profile?.company_name || "User";
  const initials = displayName.charAt(0).toUpperCase();
  const isAuthed = Boolean(user && profile);
  const roleNav = getRoleNavItems(profile?.role);
  const homeHref = isAuthed ? getHomeForRole(profile?.role) : "/";

  // Public top-nav (only when signed out)
  const publicNav: NavItem[] = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/features", label: "Features" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-[72px] items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="https://www.digitalindia.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            title="Digital India — visit website"
            aria-label="Digital India"
          >
            <img
              src={digitalIndiaLogo}
              alt="Digital India logo"
              className="h-9 w-auto md:h-10 object-contain"
              loading="eager"
              decoding="async"
            />
          </a>
          <span className="hidden sm:block h-8 w-px bg-border/70" aria-hidden="true" />
          <Link to={homeHref} className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl">
              Certi<span className="text-primary">Vault</span>
            </span>
            {isAuthed && profile?.role && (
              <span className="hidden lg:inline-flex ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                {profile.role}
              </span>
            )}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {(isAuthed ? roleNav : publicNav).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "text-[15px] px-[14px] py-[10px] rounded-lg transition-colors inline-flex items-center gap-2",
                    isActive
                      ? "text-primary font-semibold bg-primary/5"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isAuthed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-10 pl-1.5 pr-3 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[140px] truncate text-sm font-medium">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-semibold truncate">{displayName}</span>
                  <span className="text-xs font-normal text-muted-foreground capitalize">
                    {profile?.role} account
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={getHomeForRole(profile?.role)} className="cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile-settings" className="cursor-pointer">
                    <UserIcon className="h-4 w-4 mr-2" /> Profile settings
                  </Link>
                </DropdownMenuItem>
                {(profile?.role === "institute" || profile?.role === "company") && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <BarChart3 className="h-4 w-4 mr-2" /> Admin analytics
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="default" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {isAuthed ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-muted/50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{displayName}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {profile?.role} account
                    </div>
                  </div>
                </div>
                {roleNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                    >
                      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  to="/profile-settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  Profile settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-lg hover:bg-muted transition-colors text-left text-destructive flex items-center gap-3"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                {publicNav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-border my-2" />
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full mt-1">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
