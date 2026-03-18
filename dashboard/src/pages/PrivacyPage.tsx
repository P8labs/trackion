import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <img src="/trackion_t.png" alt="Trackion" className="w-8 h-8" />
            <span className="font-bold text-xl">Trackion</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

          <div className="text-sm text-muted-foreground mb-8">
            Last updated: January 2025
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              At Trackion, we respect your privacy and are committed to
              protecting your personal data. This privacy policy explains how we
              handle information when you use Trackion, particularly in
              self-hosted deployments where you maintain complete control over
              your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              2. Data Collection and Processing
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Self-Hosted Deployments
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                When you use a self-hosted version of Trackion:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                <li>
                  All data is processed and stored on your own infrastructure
                </li>
                <li>
                  P8Labs does not have access to your data or analytics
                  information
                </li>
                <li>
                  You have complete control over data collection, storage, and
                  deletion
                </li>
                <li>
                  You are responsible for compliance with applicable privacy
                  laws
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Open Source Code</h3>
              <p className="text-muted-foreground leading-relaxed">
                Trackion is open source software. You can audit the complete
                codebase to understand exactly what data is collected and how
                it's processed. The source code is available on GitHub under the
                MIT License.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              3. Types of Data Collected
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Trackion typically collects the following types of analytics data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>
                <strong>Page Views:</strong> URLs, page titles, and referrer
                information
              </li>
              <li>
                <strong>User Sessions:</strong> Session identifiers and duration
              </li>
              <li>
                <strong>Custom Events:</strong> Application-specific events you
                choose to track
              </li>
              <li>
                <strong>Technical Information:</strong> Browser type, device
                information, IP addresses
              </li>
              <li>
                <strong>Performance Metrics:</strong> Page load times and user
                interaction data
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              The exact data collected depends on your implementation and
              configuration. You have full control over what data is tracked.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              4. Data Storage and Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For self-hosted deployments:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>
                Data is stored in your PostgreSQL database on your
                infrastructure
              </li>
              <li>
                You are responsible for implementing appropriate security
                measures
              </li>
              <li>
                You control database access, encryption, and backup procedures
              </li>
              <li>No data is transmitted to P8Labs or third-party services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              In self-hosted deployments, you control data retention policies.
              Trackion does not automatically delete data - you can implement
              your own retention and deletion policies based on your
              requirements and applicable regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              6. User Rights and Control
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Since you control the data in self-hosted deployments, you can:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Access and export any data collected</li>
              <li>Modify or delete specific data points</li>
              <li>Implement data subject access requests</li>
              <li>Control who has access to the analytics data</li>
              <li>
                Implement consent mechanisms as needed for your jurisdiction
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              7. Third-Party Integrations
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Trackion itself does not integrate with third-party analytics or
              tracking services. However, you may choose to integrate Trackion
              data with other tools or services. Any such integrations are under
              your control and responsibility.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              8. Compliance Considerations
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              When implementing Trackion, consider compliance with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>
                <strong>GDPR:</strong> If processing EU personal data
              </li>
              <li>
                <strong>CCPA:</strong> If processing California resident data
              </li>
              <li>
                <strong>Other Local Laws:</strong> Applicable data protection
                regulations in your jurisdiction
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              As the data controller, you are responsible for ensuring
              compliance with applicable privacy laws and regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              9. Updates to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. Any changes
              will be posted on this page. For self-hosted deployments, this
              policy serves as guidance - you may need to create your own
              privacy policy based on your specific implementation and legal
              requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this privacy policy or about privacy
              aspects of Trackion, please contact us at{" "}
              <a
                href="mailto:hello@p8labs.dev"
                className="text-[#ff6b35] hover:underline"
              >
                hello@p8labs.dev
              </a>
              .
            </p>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="font-semibold mb-2">Important Note</h3>
            <p className="text-sm text-muted-foreground">
              This privacy policy applies to the Trackion software and general
              guidance. For specific legal advice regarding your implementation
              and compliance requirements, please consult with qualified legal
              professionals in your jurisdiction.
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            Built with ❤️ by P8Labs. Released under the MIT License.
          </p>
        </div>
      </footer>
    </div>
  );
}
