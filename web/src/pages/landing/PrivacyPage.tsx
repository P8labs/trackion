import { PublicPageLayout } from "./components/PublicPageLayout";

export function PrivacyPage() {
  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

          <div className="text-sm text-muted-foreground mb-8">
            Last updated: March 19, 2026
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy describes how Trackion ("Service") handles
              data in both its cloud (SaaS) and self-hosted forms. Your privacy
              and control over data are core to the design of Trackion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Service Modes and Data Roles
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Cloud (SaaS)</h3>
              <p className="text-muted-foreground leading-relaxed">
                When using the Trackion cloud offering:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>P8labs acts as a data processor on your behalf</li>
                <li>You remain the data controller of your collected data</li>
                <li>
                  Data is processed only to provide and improve the Service
                </li>
              </ul>

              <p className="text-muted-foreground leading-relaxed mt-4">
                The cloud version is currently in beta and may not be stable or
                fully reliable.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Self-Hosted Deployment
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                When using a self-hosted version of Trackion:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>All data is stored and processed on your infrastructure</li>
                <li>P8labs has no access to your data</li>
                <li>You act as the sole data controller and processor</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Data We Process</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your configuration, Trackion may process:
            </p>

            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Page views, URLs, and referrer data</li>
              <li>Session identifiers and session duration</li>
              <li>Custom events defined by you</li>
              <li>Device, browser, and technical metadata</li>
              <li>IP addresses and performance metrics</li>
            </ul>

            <p className="text-muted-foreground leading-relaxed mt-4">
              You determine what data is collected and are responsible for
              ensuring lawful collection and use.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Data Storage and Security
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              For cloud usage, data is stored on infrastructure managed by
              P8labs with reasonable security measures in place.
            </p>

            <p className="text-muted-foreground leading-relaxed mt-4">
              For self-hosted deployments, you are fully responsible for:
            </p>

            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Database and infrastructure security</li>
              <li>Access control and encryption</li>
              <li>Backup and recovery procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              In cloud deployments, data is retained only as long as necessary
              to provide the Service.
            </p>

            <p className="text-muted-foreground leading-relaxed mt-4">
              In self-hosted environments, you define and manage your own data
              retention policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. User Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on applicable laws, users may have rights to access,
              correct, or delete personal data.
            </p>

            <p className="text-muted-foreground leading-relaxed mt-4">
              For self-hosted deployments, you are responsible for handling such
              requests. For cloud usage, you may contact us for assistance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              7. Third-Party Services
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Trackion does not include third-party tracking by default. Any
              integrations you configure are your responsibility.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Compliance</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for ensuring compliance with applicable data
              protection laws, including but not limited to:
            </p>

            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>GDPR (European Union)</li>
              <li>CCPA (California)</li>
              <li>DPDP Act (India)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              9. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Continued use
              of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related questions, contact{" "}
              <a
                href="mailto:hello@P8labs.tech"
                className="text-primary hover:underline"
              >
                hello@P8labs.tech
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </PublicPageLayout>
  );
}
