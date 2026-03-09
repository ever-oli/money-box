import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 bg-background">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-primary hover:text-accent transition-colors text-sm mb-6 inline-block">
          ← Back to Savings Box
        </Link>

        <h1 className="text-3xl font-bold text-primary mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">Last updated: March 8, 2026</p>

        <div className="space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">1. Introduction</h2>
            <p>
              Welcome to Digital Savings Box ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">2. Information We Collect</h2>
            <p className="mb-3">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Payment Information:</strong> When you make a contribution, your payment is processed securely by Stripe, Inc. We do not store your credit card number, bank account details, or other sensitive payment credentials on our servers. Stripe collects and processes payment data in accordance with their own <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent underline">Privacy Policy</a>.</li>
              <li><strong>Transaction Data:</strong> We store records of which grid cells have been filled, the associated amounts, and Stripe session identifiers to track your savings progress.</li>
              <li><strong>Usage Data:</strong> We may collect non-personal information such as browser type, device type, pages visited, and time spent on the application for analytics and improvement purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To process and confirm your contributions via Stripe.</li>
              <li>To display your savings progress on the grid.</li>
              <li>To communicate with you regarding transactions (e.g., payment confirmations).</li>
              <li>To improve and optimize our application.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">4. Payment Processing</h2>
            <p>
              All payment transactions are processed through <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent underline">Stripe, Inc.</a>, a PCI-DSS Level 1 certified payment processor. When you make a payment, you are redirected to Stripe's secure checkout page. We never have access to your full credit card number or banking credentials. For more information on how Stripe handles your data, please review <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent underline">Stripe's Privacy Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">5. Data Sharing and Disclosure</h2>
            <p className="mb-3">We do not sell your personal information. We may share information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe:</strong> For payment processing as described above.</li>
              <li><strong>Service Providers:</strong> Third-party services that help us operate, maintain, and improve our application (e.g., hosting, analytics).</li>
              <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">6. Data Retention</h2>
            <p>
              We retain transaction and grid data for as long as your savings box is active. You may request a reset of your savings data at any time using the "Reset Savings" feature, which clears all cell statuses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">7. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">8. Your Rights</h2>
            <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Object to or restrict processing of your data.</li>
              <li>Data portability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">9. Cookies</h2>
            <p>
              We may use essential cookies required for the application to function properly. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">10. Children's Privacy</h2>
            <p>
              Our application is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-3">12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:everolivares07@gmail.com" className="text-primary hover:text-accent underline">
                everolivares07@gmail.com
              </a>.
            </p>
          </section>
        </div>

        <footer className="mt-12 pt-6 border-t border-muted text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Digital Savings Box. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
