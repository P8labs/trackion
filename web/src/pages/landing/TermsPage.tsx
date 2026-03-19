import { PublicPageLayout } from "../components/PublicPageLayout";

export function TermsPage() {
  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

          <div className="text-sm text-muted-foreground mb-8">
            Last updated: January 2025
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Trackion, you accept and agree to be bound
              by the terms and provision of this agreement. If you do not agree
              to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Trackion is a lightweight telemetry infrastructure that allows you
              to track, analyze, and understand your applications through
              real-time analytics and custom events. The service is available in
              both self-hosted and SaaS configurations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Open Source License
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The Trackion software is released under the MIT License. You are
              free to use, modify, and distribute the software in accordance
              with the terms of the MIT License. The full license text is
              available in the project repository.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Self-Hosted Deployments
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              When you deploy Trackion on your own infrastructure (self-hosted),
              you are responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Security and maintenance of your deployment</li>
              <li>Compliance with applicable laws and regulations</li>
              <li>Data protection and privacy measures</li>
              <li>Backup and disaster recovery procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              5. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Trackion is provided "as is" without warranty of any kind. In no
              event shall P8Labs or contributors be liable for any direct,
              indirect, incidental, special, exemplary, or consequential damages
              arising out of the use of this software.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Ownership</h2>
            <p className="text-muted-foreground leading-relaxed">
              For self-hosted deployments, you retain complete ownership of all
              data processed through Trackion. P8Labs does not have access to or
              ownership of your data when you run Trackion on your own
              infrastructure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to use Trackion for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Any unlawful purpose or in violation of applicable laws</li>
              <li>Collecting personal information without proper consent</li>
              <li>
                Activities that could harm the security or performance of
                systems
              </li>
              <li>Any activity that violates the privacy rights of others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Changes
              will be posted on this page and, where appropriate, communicated
              through other channels. Your continued use of Trackion after any
              such changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              9. Support and Community
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Support is provided on a best-effort basis through GitHub Issues
              and community channels. For self-hosted deployments, you are
              responsible for your own support and maintenance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              10. Contact Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact
              us at{" "}
              <a
                href="mailto:hello@p8labs.tech"
                className="text-[#ff6b35] hover:underline"
              >
                hello@p8labs.tech
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </PublicPageLayout>
  );
}
