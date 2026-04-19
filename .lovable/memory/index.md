# Project Memory

## Core
Supabase stack (Auth, Postgres, Deno edge functions). React/Vite environment.
3 roles: Student, Institute, Company. Role-based navigation and registration fields.
Tech-forward dark mode: glassmorphism, gradients, custom HSL palette, context ThemeProvider.
Edge functions: No worker threads (use native Web Crypto), constant-time checks, generic errors.
Robust error handling: 'Failed to fetch' displays and retry buttons for network failures.

## Memories
- [Project Overview](mem://project/overview) — Core roles: Student, Institute, Company
- [Backend Platform](mem://architecture/backend-platform) — Supabase, Lovable Cloud
- [React Constraints](mem://architecture/react-environment-constraints) — Explicit React imports and StrictMode for Vite
- [Edge Functions](mem://architecture/edge-functions) — Deno runtime constraints and Web Crypto API security
- [Design System](mem://style/design-system) — Glassmorphism, HSL palette, custom dark mode React context
- [Contact and Socials](mem://project/contact-and-socials) — Primary email and approved social links (WhatsApp replaces Twitter)
- [Email OTP](mem://features/authentication/email-otp-verification) — 6-digit OTP, pending/active status
- [Password Reset](mem://features/authentication/password-reset) — Supabase native reset and /reset-password page
- [Rate Limiting](mem://security/rate-limiting) — Limits for OTP and password reset
- [Role Fields](mem://features/authentication/role-based-fields) — Specific registration fields per role and password requirements
- [OAuth Flow](mem://auth/oauth-onboarding-flow) — Redirect missing roles to /complete-profile
- [Social Login](mem://auth/social-login-status) — Google active, DigiLocker deferred
- [Admin Dashboard](mem://features/admin/analytics-dashboard) — Recharts, Postgres RPC with SECURITY DEFINER
- [Role Visibility](mem://features/navigation/role-based-visibility) — Admin link restricted to institute/company
- [Network Errors](mem://constraints/error-handling/network-failures) — Explicit error handling with retries
- [Credential Verification](mem://features/credentials/verification) — QR codes linking to public /verify/:id page
- [Issuance Flow](mem://features/credentials-management/issuance-flow) — Future request-based student-to-institute flow
