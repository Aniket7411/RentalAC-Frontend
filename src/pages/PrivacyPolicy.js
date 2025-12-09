import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-lg shadow-md"
        >
          <div className="flex items-center space-x-3 mb-8">
            <Shield className="w-8 h-8 text-primary-blue" />
            <h1 className="text-4xl md:text-5xl font-bold text-text-dark">
              Privacy Policy
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-text-light">
            <p className="text-sm text-gray-500 mb-8">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">1. Introduction</h2>
              <p className="mb-4">
                ASH Enterprise ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.1 Personal Information</h3>
              <p className="mb-4">We may collect the following personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely through payment gateways)</li>
                <li>Account credentials (username, password)</li>
                <li>Profile information and preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.2 Usage Information</h3>
              <p className="mb-4">We automatically collect information about your use of our service:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage patterns and preferences</li>
                <li>Pages visited and time spent on our platform</li>
                <li>Search queries and interactions</li>
                <li>Location data (if permitted)</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.3 Cookies and Tracking Technologies</h3>
              <p className="mb-4">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage, and assist with marketing efforts. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide, maintain, and improve our services</li>
                <li>To process transactions and manage your account</li>
                <li>To communicate with you about your orders, services, and account</li>
                <li>To send promotional emails and updates (with your consent)</li>
                <li>To personalize your experience and recommend relevant products</li>
                <li>To detect and prevent fraud and unauthorized access</li>
                <li>To comply with legal obligations</li>
                <li>To analyze usage patterns and improve our platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">4.1 Service Providers</h3>
              <p className="mb-4">
                We may share your information with third-party service providers who assist us in operating our platform, processing payments, delivering services, or conducting business operations.
              </p>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">4.2 Vendors</h3>
              <p className="mb-4">
                When you rent an AC or book a service, we share relevant information (name, contact details, address) with the vendor to facilitate the transaction.
              </p>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">4.3 Legal Requirements</h3>
              <p className="mb-4">
                We may disclose your information if required by law, regulation, legal process, or governmental request, or to protect our rights, property, or safety.
              </p>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">4.4 Business Transfers</h3>
              <p className="mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">4.5 With Your Consent</h3>
              <p className="mb-4">
                We may share your information with third parties when you explicitly consent to such sharing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure payment processing through certified payment gateways</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">6. Your Rights and Choices</h2>
              <p className="mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for processing your data</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the information provided in the Contact section below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">7. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">8. Third-Party Links</h2>
              <p className="mb-4">
                Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies before providing any information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">9. Children's Privacy</h2>
              <p className="mb-4">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">10. Changes to Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">11. Contact Information</h2>
              <p className="mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> support@ashenterprises.com</li>
                <li><strong>Phone:</strong> +91 [Insert Number]</li>
                <li><strong>Address:</strong> [Insert Address], Mumbai, India</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

