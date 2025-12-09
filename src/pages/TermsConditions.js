import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-lg shadow-md"
        >
          <div className="flex items-center space-x-3 mb-8">
            <FileText className="w-8 h-8 text-primary-blue" />
            <h1 className="text-4xl md:text-5xl font-bold text-text-dark">
              Terms & Conditions
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-text-light">
            <p className="text-sm text-gray-500 mb-8">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using ASH Enterprise's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">2. Description of Service</h2>
              <p className="mb-4">
                ASH Enterprise provides a platform for AC rentals and repair services. We connect customers with vendors who offer AC rental and maintenance services. We act as an intermediary platform and do not own the ACs listed on our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">3. User Accounts</h2>
              <p className="mb-4">
                To access certain features of our service, you may be required to create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Updating your information promptly if any changes occur</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">4. Rental Terms</h2>
              <p className="mb-4">
                When renting an AC through our platform:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Rental periods are as specified in the rental agreement (monthly, quarterly, or yearly)</li>
                <li>Renters are responsible for the proper care and maintenance of the AC during the rental period</li>
                <li>Any damage beyond normal wear and tear may result in additional charges</li>
                <li>Early termination may be subject to penalties as per the rental agreement</li>
                <li>Vendors are responsible for delivery and installation of ACs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">5. Service Terms</h2>
              <p className="mb-4">
                For repair and maintenance services:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Service requests are subject to vendor availability</li>
                <li>Service charges are as quoted at the time of booking</li>
                <li>Additional charges may apply if additional work is required</li>
                <li>Warranty terms are as specified by the service provider</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">6. Payment Terms</h2>
              <p className="mb-4">
                Payment terms are as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Payment must be made through our secure payment gateway</li>
                <li>Rental payments may be required in advance or as per the rental agreement</li>
                <li>Service payments are typically due upon completion of service</li>
                <li>All prices are in Indian Rupees (INR) unless otherwise stated</li>
                <li>Refunds, if applicable, will be processed according to our Cancellation & Refund Policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">7. User Conduct</h2>
              <p className="mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Transmit any viruses, malware, or harmful code</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Attempt to gain unauthorized access to any portion of the service</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">8. Limitation of Liability</h2>
              <p className="mb-4">
                ASH Enterprise acts as an intermediary platform and shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Any disputes between customers and vendors</li>
                <li>Quality of products or services provided by vendors</li>
                <li>Any damage or loss resulting from the use of rented ACs</li>
                <li>Delays or failures in service delivery</li>
                <li>Any indirect, incidental, or consequential damages</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">9. Intellectual Property</h2>
              <p className="mb-4">
                All content on this platform, including text, graphics, logos, and software, is the property of ASH Enterprise or its content suppliers and is protected by copyright and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">10. Modifications to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of the service after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">11. Termination</h2>
              <p className="mb-4">
                We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">12. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, India.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">13. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms & Conditions, please contact us at:
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

export default TermsConditions;

