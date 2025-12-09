import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const CancellationRefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-lg shadow-md"
        >
          <div className="flex items-center space-x-3 mb-8">
            <RefreshCw className="w-8 h-8 text-primary-blue" />
            <h1 className="text-4xl md:text-5xl font-bold text-text-dark">
              Cancellation & Refund Policy
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-text-light">
            <p className="text-sm text-gray-500 mb-8">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">1. Overview</h2>
              <p className="mb-4">
                This Cancellation & Refund Policy outlines the terms and conditions for canceling orders and requesting refunds for AC rentals and services booked through ASH Enterprise. Please read this policy carefully before making a booking.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">2. AC Rental Cancellations</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.1 Before Delivery</h3>
              <p className="mb-4">
                If you cancel your AC rental booking before the AC is delivered:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Full Refund:</strong> Cancellation 48 hours or more before scheduled delivery - 100% refund</li>
                <li><strong>Partial Refund:</strong> Cancellation between 24-48 hours before delivery - 80% refund</li>
                <li><strong>No Refund:</strong> Cancellation less than 24 hours before delivery - No refund (delivery charges may apply)</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.2 After Delivery</h3>
              <p className="mb-4">
                If you wish to cancel after the AC has been delivered and installed:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cancellation within 24 hours of installation - 70% refund (after deduction of delivery and installation charges)</li>
                <li>Cancellation within 3 days - 50% refund (after deduction of delivery, installation, and service charges)</li>
                <li>Cancellation after 3 days - No refund (rental contract continues for the agreed period)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">3. Service Booking Cancellations</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">3.1 Before Service</h3>
              <p className="mb-4">
                If you cancel your service booking before the service is rendered:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Full Refund:</strong> Cancellation 24 hours or more before scheduled service - 100% refund</li>
                <li><strong>Partial Refund:</strong> Cancellation 4-24 hours before service - 50% refund</li>
                <li><strong>No Refund:</strong> Cancellation less than 4 hours before service or no-show - No refund</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">3.2 After Service Commencement</h3>
              <p className="mb-4">
                Once the service has commenced:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>If service is incomplete due to customer request - Charges for work completed will apply, balance refunded</li>
                <li>If service is incomplete due to technical issues - Full refund or service completion at no extra charge</li>
                <li>If service is completed - No refund (except for warranty claims as per service terms)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">4. Refund Processing</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">4.1 Refund Method</h3>
              <p className="mb-4">
                Refunds will be processed to the original payment method used for the transaction:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Credit/Debit Cards - 5-7 business days</li>
                <li>Net Banking - 3-5 business days</li>
                <li>UPI/Wallets - 2-3 business days</li>
                <li>Cash on Delivery - Refund via bank transfer (account details required) - 7-10 business days</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">4.2 Processing Time</h3>
              <p className="mb-4">
                Once your cancellation request is approved, refunds are typically processed within the timeframes mentioned above. Actual credit to your account may take additional time depending on your bank or payment provider.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">5. How to Cancel</h2>
              <p className="mb-4">You can cancel your booking through the following methods:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Online:</strong> Log into your account and cancel from the Orders section</li>
                <li><strong>Email:</strong> Send a cancellation request to support@ashenterprises.com with your order number</li>
                <li><strong>Phone:</strong> Call our customer service at +91 [Insert Number]</li>
              </ul>
              <p className="mt-4">
                All cancellation requests must include your order number and reason for cancellation. Cancellation requests will be processed within 24-48 hours of receipt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">6. Special Circumstances</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">6.1 Vendor Cancellation</h3>
              <p className="mb-4">
                If a vendor cancels your booking, you will receive a full refund and assistance in finding an alternative solution.
              </p>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">6.2 Force Majeure</h3>
              <p className="mb-4">
                In cases of natural disasters, pandemics, or other force majeure events preventing service delivery, we will work with you to reschedule or provide full refunds as applicable.
              </p>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">6.3 Defective Products</h3>
              <p className="mb-4">
                If you receive a defective AC or unsatisfactory service, please contact us immediately. We will arrange for replacement, repair, or full refund based on the circumstances.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">7. Non-Refundable Charges</h2>
              <p className="mb-4">The following charges are typically non-refundable:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Delivery charges (if cancellation occurs after dispatch)</li>
                <li>Installation charges (if installation has been completed)</li>
                <li>Service fees for completed work</li>
                <li>Any damage charges or penalties as per rental agreement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">8. Early Termination of Rental</h2>
              <p className="mb-4">
                For early termination of active rental agreements:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Early termination fees may apply as per the rental agreement</li>
                <li>Outstanding rental charges up to the date of termination must be paid</li>
                <li>Refund of advance payments, if any, will be calculated after deducting applicable charges</li>
                <li>AC must be returned in good condition (normal wear and tear excepted)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">9. Dispute Resolution</h2>
              <p className="mb-4">
                If you are not satisfied with a cancellation or refund decision, you can:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Contact our customer service team with your concerns</li>
                <li>Submit a written complaint with supporting documents</li>
                <li>We will review your case and respond within 5-7 business days</li>
                <li>If unresolved, disputes will be handled as per our Terms & Conditions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">10. Contact Information</h2>
              <p className="mb-4">
                For cancellation requests, refund inquiries, or questions about this policy, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> support@ashenterprises.com</li>
                <li><strong>Phone:</strong> +91 [Insert Number]</li>
                <li><strong>Address:</strong> [Insert Address], Mumbai, India</li>
                <li><strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM IST</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CancellationRefundPolicy;

