import { PLine } from "@/components/Line";
import { PublicPageLayout } from "./components/PublicPageLayout";

export function TermsPage() {
  return (
    <PublicPageLayout>
      <PLine />
      <div className="p-6">
        {" "}
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

          <div className="text-sm text-muted-foreground mb-8">
            Last updated: March 19, 2026
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Trackion ("Service"), you agree to be bound
              by these Terms of Service. If you do not agree to these terms, you
              must not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Trackion is a telemetry and event tracking platform that enables
              users to collect, process, and analyze application data. The
              Service is offered in two forms:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>SaaS (hosted by P8labs)</li>
              <li>Self-hosted (deployed and managed by you)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Accounts and Authentication
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              When using Trackion via GitHub OAuth or any authentication method,
              you are responsible for maintaining the security of your account
              and credentials. You agree to accept responsibility for all
              activities that occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Open Source License
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The self-hosted version of Trackion is released under the MIT
              License. Your use of the open-source components is governed by
              that license.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              5. Self-Hosted Responsibility
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you deploy Trackion on your own infrastructure, you are solely
              responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>System security and access control</li>
              <li>Compliance with applicable laws and regulations</li>
              <li>Data protection, storage, and encryption</li>
              <li>Backups and disaster recovery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to use the Service:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>In violation of any applicable laws or regulations</li>
              <li>To collect or process personal data without lawful basis</li>
              <li>To interfere with or disrupt system integrity or security</li>
              <li>To infringe on the rights of others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Ownership</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain all rights to the data you collect and process using
              Trackion. For self-hosted deployments, P8labs has no access to
              your data. For SaaS usage, data is processed only to provide the
              Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              8. Service Availability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The Trackion cloud (SaaS) offering is currently provided in beta.
              As such, it may be unstable and is not guaranteed to be available,
              uninterrupted, or error-free. Features may change or be
              discontinued at any time without notice.
            </p>

            <p className="text-muted-foreground leading-relaxed mt-4">
              For self-hosted deployments, the Service runs on your own
              infrastructure. Availability and uptime are therefore dependent on
              your systems, configuration, and operational practices. P8labs
              does not provide uptime guarantees for self-hosted environments.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, P8labs and contributors
              shall not be liable for any indirect, incidental, special, or
              consequential damages, including loss of data, revenue, or
              profits, arising from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate access to the Service
              at any time, without prior notice, for conduct that we believe
              violates these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. Continued use of the
              Service after changes become effective constitutes acceptance of
              the revised Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with
              the laws of India, without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions regarding these Terms, contact{" "}
              <a
                href="mailto:hello@P8labs.in"
                className="text-primary hover:underline"
              >
                hello@P8labs.in
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </PublicPageLayout>
  );
}
