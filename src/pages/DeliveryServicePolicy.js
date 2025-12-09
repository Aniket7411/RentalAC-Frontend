import React from 'react';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';

const DeliveryServicePolicy = () => {
  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-lg shadow-md"
        >
          <div className="flex items-center space-x-3 mb-8">
            <Truck className="w-8 h-8 text-primary-blue" />
            <h1 className="text-4xl md:text-5xl font-bold text-text-dark">
              Delivery & Service Policy
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-text-light">
            <p className="text-sm text-gray-500 mb-8">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">1. Overview</h2>
              <p className="mb-4">
                This Delivery & Service Policy outlines the terms, conditions, and procedures for delivery of AC rentals and execution of repair/maintenance services through ASH Enterprise. This policy ensures transparency and sets clear expectations for our customers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">2. AC Rental Delivery</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.1 Delivery Timeline</h3>
              <p className="mb-4">
                Standard delivery timelines:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Same Day Delivery:</strong> Available in select areas for orders placed before 12:00 PM (subject to vendor availability)</li>
                <li><strong>Next Day Delivery:</strong> Standard delivery for most locations</li>
                <li><strong>2-3 Business Days:</strong> For remote or less accessible locations</li>
                <li>Delivery timelines are estimates and may vary based on location, availability, and external factors</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.2 Delivery Process</h3>
              <p className="mb-4">The delivery process includes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Order confirmation via email/SMS with tracking details</li>
                <li>Pre-delivery call from vendor to confirm delivery address and schedule</li>
                <li>Physical delivery of AC unit</li>
                <li>Installation and setup by certified technicians (if included in the package)</li>
                <li>Functional testing and demonstration</li>
                <li>Documentation handover (rental agreement, warranty card, user manual)</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.3 Delivery Areas</h3>
              <p className="mb-4">
                We currently deliver to major cities and metropolitan areas in India. Delivery to specific locations is subject to vendor coverage. Remote or out-of-coverage areas may incur additional delivery charges.
              </p>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.4 Delivery Charges</h3>
              <p className="mb-4">
                Delivery charges are calculated based on:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Distance from vendor location</li>
                <li>Delivery urgency (same-day/next-day premiums)</li>
                <li>Floor/accessibility (elevator availability, floor number)</li>
                <li>Special requirements (after-hours delivery, weekend delivery)</li>
              </ul>
              <p className="mt-4">
                Delivery charges are displayed at checkout and are non-refundable once delivery is completed.
              </p>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.5 Installation Services</h3>
              <p className="mb-4">
                Professional installation is included with most rental packages:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Installation by certified and trained technicians</li>
                <li>Standard installation includes: wall mounting, electrical connections, drainage setup</li>
                <li>Additional charges may apply for: extra piping, special mounting requirements, electrical modifications</li>
                <li>Installation warranty provided for workmanship (separate from product warranty)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">3. Service Request Execution</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">3.1 Service Scheduling</h3>
              <p className="mb-4">
                Service appointments are scheduled as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Service requests are confirmed within 2-4 hours of booking</li>
                <li>Vendor will contact you within 24 hours to schedule the service</li>
                <li>Standard appointment slots: Morning (9 AM - 12 PM), Afternoon (12 PM - 4 PM), Evening (4 PM - 7 PM)</li>
                <li>Emergency services may be available with additional charges</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">3.2 Service Technician Arrival</h3>
              <p className="mb-4">
                Our service providers commit to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Arriving within the scheduled time window</li>
                <li>Carrying identification and being in uniform</li>
                <li>Providing advance notice if delayed beyond 30 minutes</li>
                <li>Explaining the service process before beginning work</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">3.3 Service Types</h3>
              <p className="mb-4">We provide the following services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Repair Services:</strong> Diagnosis and repair of AC malfunctions</li>
                <li><strong>Maintenance Services:</strong> Cleaning, servicing, and preventive maintenance</li>
                <li><strong>Installation Services:</strong> New AC installation and setup</li>
                <li><strong>Uninstallation Services:</strong> Safe removal and handling of AC units</li>
                <li><strong>Emergency Services:</strong> Priority service for urgent issues (additional charges apply)</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">3.4 Service Execution</h3>
              <p className="mb-4">During service execution:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Technician will diagnose the issue and provide a detailed explanation</li>
                <li>Cost estimate provided before any paid work begins</li>
                <li>Customer approval required for any work beyond the original service request</li>
                <li>Work completed with quality materials and genuine parts (where applicable)</li>
                <li>Testing and demonstration of repaired/maintained AC</li>
                <li>Service report and warranty documentation provided</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">4. Customer Responsibilities</h2>
              <p className="mb-4">To ensure smooth delivery and service execution, customers must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete delivery/service address</li>
                <li>Ensure someone is available at the scheduled time</li>
                <li>Provide clear access to the AC unit (remove obstacles, ensure safe working space)</li>
                <li>Inform about any special requirements, access restrictions, or safety concerns</li>
                <li>Ensure power supply is available and accessible</li>
                <li>Make payment as per the agreed terms</li>
                <li>Be present during delivery/service to inspect and approve</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">5. Rescheduling and Cancellations</h2>
              <p className="mb-4">
                Customers can reschedule or cancel deliveries/services:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Rescheduling:</strong> Free rescheduling up to 24 hours before scheduled time</li>
                <li><strong>Late Rescheduling:</strong> Rescheduling less than 24 hours may incur charges</li>
                <li><strong>Cancellation:</strong> As per our Cancellation & Refund Policy</li>
                <li><strong>No-Show:</strong> Customer not available at scheduled time may result in cancellation charges</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">6. Quality Assurance</h2>
              <p className="mb-4">We ensure quality through:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Verification of vendor credentials and certifications</li>
                <li>Regular quality checks and customer feedback monitoring</li>
                <li>Trained and certified service technicians</li>
                <li>Genuine parts and quality materials</li>
                <li>Warranty on services provided</li>
                <li>Follow-up calls to ensure customer satisfaction</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">7. Issues and Complaints</h2>
              <p className="mb-4">
                If you experience issues with delivery or service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Report immediately to our customer service</li>
                <li>Provide order/service number and detailed description</li>
                <li>We will investigate and resolve within 24-48 hours</li>
                <li>Re-delivery or re-service arranged at no additional cost if the issue is on our end</li>
                <li>Compensation or refund provided as per the circumstances</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">8. Force Majeure</h2>
              <p className="mb-4">
                We are not liable for delays or failures in delivery/service due to circumstances beyond our control, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Natural disasters, weather conditions</li>
                <li>Government restrictions or lockdowns</li>
                <li>Transportation disruptions</li>
                <li>Labor strikes</li>
                <li>Pandemics or health emergencies</li>
              </ul>
              <p className="mt-4">
                In such cases, we will work with you to reschedule at the earliest convenience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">9. Contact Information</h2>
              <p className="mb-4">
                For delivery or service-related inquiries, tracking, or support, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> support@ashenterprises.com</li>
                <li><strong>Phone:</strong> +91 [Insert Number]</li>
                <li><strong>Address:</strong> [Insert Address], Mumbai, India</li>
                <li><strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM IST</li>
                <li><strong>Emergency Service:</strong> Available 24/7 (additional charges apply)</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeliveryServicePolicy;

