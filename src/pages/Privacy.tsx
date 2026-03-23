import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 py-20 px-4">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1 className="text-4xl font-bold tracking-tight mb-8">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly, including your name, email address, phone number, role (student, institute, or company), and credential data you upload to the platform.</p>

          <h2>2. How We Use Your Information</h2>
          <p>Your information is used to provide and improve our services, including credential issuance, verification via QR codes, and personalized dashboards. We do not sell your personal data to third parties.</p>

          <h2>3. Data Storage & Security</h2>
          <p>All data is stored securely with encryption at rest and in transit. We use row-level security policies to ensure users can only access their own data. Passwords are hashed and never stored in plain text.</p>

          <h2>4. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use third-party tracking cookies.</p>

          <h2>5. Third-Party Services</h2>
          <p>We may use third-party services such as email delivery providers to send OTP codes and password reset links. These services only receive the minimum data necessary to perform their function.</p>

          <h2>6. Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:rakeshgajre.work@gmail.com" className="text-primary">rakeshgajre.work@gmail.com</a>.</p>

          <h2>7. Changes to This Policy</h2>
          <p>We may update this policy from time to time. Changes will be posted on this page with an updated revision date.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
