import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 py-20 px-4">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1 className="text-4xl font-bold tracking-tight mb-8">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using SkillChain Credentials, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>

          <h2>2. User Accounts</h2>
          <p>You must provide accurate information during registration and keep your account credentials secure. You are responsible for all activity under your account. Each account is assigned a role — student, institute, or company — which determines available features.</p>

          <h2>3. Credential Issuance</h2>
          <p>Institutes and companies may issue digital credentials through the platform. Issuers are solely responsible for the accuracy and legitimacy of credentials they create.</p>

          <h2>4. Prohibited Use</h2>
          <p>You may not use the platform to issue fraudulent credentials, impersonate other users, or attempt to bypass security controls including row-level security policies.</p>

          <h2>5. Intellectual Property</h2>
          <p>All platform content, design, and technology are owned by SkillChain Credentials. Users retain ownership of credential data they upload.</p>

          <h2>6. Limitation of Liability</h2>
          <p>SkillChain Credentials is provided "as is" without warranty. We are not liable for any damages arising from use of the platform.</p>

          <h2>7. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms. Users may delete their account at any time through profile settings.</p>

          <h2>8. Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:rakeshgajre.work@gmail.com" className="text-primary">rakeshgajre.work@gmail.com</a>.</p>, contact us at <a href="mailto:rakeshgajre.work@gmail.com" className="text-primary">rakeshgajre.work@gmail.com</a>.</p></a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
