import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import SignInCheck from "./pages/SignInCheck";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Credentials from "./pages/Credentials";
import IssueCredential from "./pages/IssueCredential";
import GenerateCertificateAI from "./pages/GenerateCertificateAI";
import AdminDashboard from "./pages/AdminDashboard";
import RequestCredential from "./pages/RequestCredential";
import MyRequests from "./pages/MyRequests";
import ManageRequests from "./pages/ManageRequests";
import ManageInstitutions from "./pages/ManageInstitutions";
import ProfileSettings from "./pages/ProfileSettings";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Documentation from "./pages/Documentation";
import Careers from "./pages/Careers";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Security from "./pages/Security";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminPortal from "./pages/AdminPortal";
import AdminUserView from "./pages/AdminUserView";
import { BackButton } from "./components/BackButton";
import { ScrollReveal } from "./components/ScrollReveal";
import { RequireAuth } from "./components/RequireAuth";
import { RequireAdmin } from "./components/RequireAdmin";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollReveal />
            <BackButton />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/security" element={<Security />} />

              {/* Pending users allowed (verification step) */}
              <Route
                path="/verify-otp"
                element={
                  <RequireAuth requireActive={false}>
                    <VerifyOtp />
                  </RequireAuth>
                }
              />

              {/* Any active signed-in user */}
              <Route path="/sign-in-check" element={<RequireAuth><SignInCheck /></RequireAuth>} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/credentials" element={<RequireAuth><Credentials /></RequireAuth>} />
              <Route path="/profile-settings" element={<RequireAuth><ProfileSettings /></RequireAuth>} />

              {/* Student-only */}
              <Route
                path="/request-credential"
                element={<RequireAuth roles={["student"]}><RequestCredential /></RequireAuth>}
              />
              <Route
                path="/my-requests"
                element={<RequireAuth roles={["student"]}><MyRequests /></RequireAuth>}
              />

              {/* Institute-only */}
              <Route
                path="/issue-credential"
                element={<RequireAuth roles={["institute"]}><IssueCredential /></RequireAuth>}
              />
              <Route
                path="/generate-certificate-ai"
                element={<RequireAuth roles={["institute"]}><GenerateCertificateAI /></RequireAuth>}
              />
              <Route
                path="/manage-requests"
                element={<RequireAuth roles={["institute"]}><ManageRequests /></RequireAuth>}
              />
              <Route
                path="/manage-institutions"
                element={<RequireAuth roles={["institute"]}><ManageInstitutions /></RequireAuth>}
              />

              {/* Institute + Company analytics */}
              <Route
                path="/admin"
                element={<RequireAuth roles={["institute", "company"]}><AdminDashboard /></RequireAuth>}
              />

              {/* Hidden admin portal — do not link from anywhere */}
              <Route path="/sys-control-7k9x2m" element={<AdminLogin />} />
              <Route path="/sys-control-7k9x2m/portal" element={<RequireAdmin><AdminPortal /></RequireAdmin>} />
              <Route path="/sys-control-7k9x2m/user/:userId" element={<RequireAdmin><AdminUserView /></RequireAdmin>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
