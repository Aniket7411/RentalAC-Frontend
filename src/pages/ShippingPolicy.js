import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-lg shadow-md"
        >
          <div className="flex items-center space-x-3 mb-8">
            <Package className="w-8 h-8 text-primary-blue" />
            <h1 className="text-4xl md:text-5xl font-bold text-text-dark">
              Shipping Policy
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-text-light">
            <p className="text-sm text-gray-500 mb-8">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">1. Overview</h2>
              <p className="mb-4">
                This Shipping Policy outlines the terms and conditions for shipping of AC rental products through ASH Enterprise. This policy ensures transparency and sets clear expectations regarding delivery timelines, shipping charges, and related procedures.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">2. Shipping Timeline</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.1 Standard Shipping</h3>
              <p className="mb-4">
                Our standard shipping time for AC rental products is <strong>2-3 business days</strong> from the date of order confirmation. Business days exclude weekends and public holidays.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-primary-blue p-4 mb-4">
                <p className="font-semibold text-primary-blue mb-2">Standard Delivery:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Orders placed on weekdays (Monday-Friday) before 2:00 PM: 2-3 business days</li>
                  <li>Orders placed after 2:00 PM or on weekends: Processing begins next business day</li>
                  <li>Total delivery time: 2-3 business days from order confirmation</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.2 Expedited Shipping</h3>
              <p className="mb-4">
                For customers requiring faster delivery, we offer expedited shipping options:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Same Day Delivery:</strong> Available in select metro cities for orders placed before 10:00 AM (subject to availability and additional charges)</li>
                <li><strong>Next Day Delivery:</strong> Available for orders placed before 2:00 PM on weekdays (additional charges apply)</li>
                <li>Expedited shipping options are subject to product availability and delivery location</li>
                <li>Additional charges for expedited shipping are displayed at checkout</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">2.3 Delivery Time Estimation</h3>
              <p className="mb-4">
                The estimated delivery time is calculated from the moment your order is confirmed, which includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Order processing and confirmation (usually within 2-4 hours during business hours)</li>
                <li>Product preparation and quality check</li>
                <li>Dispatch from warehouse/vendor location</li>
                <li>Transit time to your delivery address</li>
                <li>Installation scheduling (if installation is included)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">3. Shipping Areas and Locations</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">3.1 Delivery Coverage</h3>
              <p className="mb-4">
                We currently provide shipping services to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Major cities and metropolitan areas across India</li>
                <li>Tier-2 and Tier-3 cities (subject to vendor coverage)</li>
                <li>Delivery to specific locations depends on vendor network and coverage area</li>
                <li>Remote or out-of-coverage areas may have extended delivery timelines or may not be serviceable</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">3.2 Delivery Address Verification</h3>
              <p className="mb-4">
                Before placing your order, please ensure:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your delivery address is complete and accurate</li>
                <li>Include landmark, building name, floor, and apartment/unit number</li>
                <li>Provide correct pincode for accurate delivery routing</li>
                <li>Contact number is reachable for delivery coordination</li>
                <li>Address is accessible by delivery vehicle</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">4. Shipping Charges</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">4.1 Free Shipping</h3>
              <p className="mb-4">
                Free standard shipping (2-3 business days) is available for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Orders above a certain value (check current promotions)</li>
                <li>Select delivery locations within standard coverage areas</li>
                <li>Standard delivery addresses (ground floor or elevator-accessible)</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">4.2 Shipping Charges Calculation</h3>
              <p className="mb-4">
                Shipping charges (when applicable) are calculated based on:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Distance:</strong> Distance from vendor/warehouse to delivery location</li>
                <li><strong>Delivery Urgency:</strong> Standard (2-3 days) vs. expedited shipping</li>
                <li><strong>Product Size and Weight:</strong> AC units and packaging dimensions</li>
                <li><strong>Accessibility:</strong> Floor number, elevator availability, parking accessibility</li>
                <li><strong>Special Requirements:</strong> After-hours delivery, weekend delivery, specific time slots</li>
                <li><strong>Location:</strong> Metro, tier-2, tier-3, or remote locations</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">4.3 Additional Charges</h3>
              <p className="mb-4">
                Additional charges may apply for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>High-floor deliveries without elevator (manual carrying charges)</li>
                <li>Remote or hard-to-reach locations</li>
                <li>Expedited or same-day delivery</li>
                <li>Special delivery time requests (evenings, weekends, holidays)</li>
                <li>Redelivery charges (if customer is unavailable during scheduled delivery)</li>
              </ul>
              <p className="mt-4">
                All shipping charges are clearly displayed at checkout before order confirmation. Shipping charges are non-refundable once the order is dispatched.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">5. Order Processing and Tracking</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">5.1 Order Confirmation</h3>
              <p className="mb-4">
                Upon placing your order:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You will receive an order confirmation email/SMS with order details</li>
                <li>Order is processed and confirmed within 2-4 hours during business hours</li>
                <li>Payment verification (if applicable) is completed before dispatch</li>
                <li>You will receive tracking information once the order is dispatched</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">5.2 Shipping Updates</h3>
              <p className="mb-4">
                You will receive regular updates via email/SMS about your order status:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Order confirmation</li>
                <li>Order dispatch notification with tracking details</li>
                <li>Pre-delivery call from delivery team to confirm address and schedule</li>
                <li>Delivery day reminder</li>
                <li>Delivery confirmation</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">5.3 Tracking Your Order</h3>
              <p className="mb-4">
                Track your order status:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Log in to your account and visit "My Orders" section</li>
                <li>View real-time order status and tracking information</li>
                <li>Contact customer support for detailed tracking assistance</li>
                <li>Receive SMS updates with tracking link</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">6. Delivery Process</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">6.1 Pre-Delivery</h3>
              <p className="mb-4">
                Before delivery, our team will:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Contact you 1-2 days before delivery to confirm address and schedule</li>
                <li>Confirm availability and preferred delivery time slot</li>
                <li>Provide estimated delivery date and time window</li>
                <li>Notify you of any special requirements or access restrictions</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">6.2 Delivery Day</h3>
              <p className="mb-4">
                On the day of delivery:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Delivery team arrives within the scheduled time window</li>
                <li>Product is delivered in original packaging</li>
                <li>Product inspection and quality check (if requested)</li>
                <li>Installation and setup by certified technicians (if included)</li>
                <li>Functional testing and demonstration</li>
                <li>Documentation handover (rental agreement, warranty card, user manual)</li>
                <li>Delivery confirmation and signature</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">6.3 Customer Presence Required</h3>
              <p className="mb-4">
                Please ensure someone is available at the delivery address:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Customer or authorized representative must be present</li>
                <li>Valid ID proof required for verification (if applicable)</li>
                <li>Inspection and acceptance of the product</li>
                <li>Signing of delivery documents</li>
                <li>Payment (if payment on delivery option is selected)</li>
              </ul>
              <p className="mt-4">
                If no one is available at the scheduled time, we will attempt to contact you. Failure to be available may result in:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Rescheduling to next available slot</li>
                <li>Additional redelivery charges (if applicable)</li>
                <li>Delay in delivery timeline</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">7. Installation and Setup</h2>
              <p className="mb-4">
                Professional installation services (when included):
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Installation is typically scheduled along with delivery (same day or next day)</li>
                <li>Installation is performed by certified and trained technicians</li>
                <li>Standard installation includes wall mounting, electrical connections, and drainage setup</li>
                <li>Additional charges may apply for extra piping, special mounting, or electrical modifications</li>
                <li>Installation warranty is provided separately from product warranty</li>
                <li>Functional testing is performed before technician departure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">8. Delayed or Failed Deliveries</h2>
              
              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">8.1 Delay in Delivery</h3>
              <p className="mb-4">
                In case of delivery delays beyond the estimated timeline:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We will notify you proactively about any delays</li>
                <li>You will receive updated delivery timeline</li>
                <li>No additional charges for delays caused by us</li>
                <li>You can cancel the order if delay is unacceptable (as per cancellation policy)</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">8.2 Failed Delivery Attempts</h3>
              <p className="mb-4">
                If delivery fails due to customer unavailability:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We will attempt to contact you to reschedule</li>
                <li>Up to 2 additional delivery attempts will be made</li>
                <li>Additional redelivery charges may apply after first failed attempt</li>
                <li>If multiple attempts fail, order may be cancelled with applicable charges</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-dark mb-3 mt-4">8.3 Rescheduling Delivery</h3>
              <p className="mb-4">
                You can reschedule your delivery:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Free rescheduling up to 24 hours before scheduled delivery</li>
                <li>Contact customer support or use order management portal</li>
                <li>Rescheduling within 24 hours may incur charges</li>
                <li>Rescheduling is subject to availability of next slots</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">9. Damaged or Defective Products</h2>
              <p className="mb-4">
                If you receive a damaged or defective product:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Do not accept the delivery if product is visibly damaged</li>
                <li>Report immediately to customer support with photos</li>
                <li>We will arrange replacement or refund as applicable</li>
                <li>Replacement delivery will be prioritized (within 1-2 business days)</li>
                <li>No additional shipping charges for replacement delivery</li>
                <li>Defective products are covered under warranty terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">10. Returns and Exchanges</h2>
              <p className="mb-4">
                Returns and exchanges are subject to our Cancellation & Refund Policy:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Return shipping charges depend on the reason for return</li>
                <li>Returns due to our error: Free return shipping</li>
                <li>Customer-initiated returns: Shipping charges may apply</li>
                <li>Product must be in original condition and packaging</li>
                <li>Return pickup will be scheduled within 2-3 business days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">11. International Shipping</h2>
              <p className="mb-4">
                Currently, we only provide shipping services within India. International shipping is not available at this time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">12. Force Majeure</h2>
              <p className="mb-4">
                We are not liable for delays or failures in shipping due to circumstances beyond our control, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Natural disasters, extreme weather conditions</li>
                <li>Government restrictions, lockdowns, or curfews</li>
                <li>Transportation disruptions or strikes</li>
                <li>Pandemics or health emergencies</li>
                <li>War, terrorism, or civil unrest</li>
                <li>Vendor or logistics partner issues beyond our control</li>
              </ul>
              <p className="mt-4">
                In such cases, we will work with you to reschedule delivery at the earliest convenience once circumstances normalize.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">13. Changes to Shipping Policy</h2>
              <p className="mb-4">
                We reserve the right to modify this Shipping Policy at any time. Changes will be effective immediately upon posting on our website. Continued use of our services after changes constitutes acceptance of the updated policy. We recommend reviewing this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark mb-4">14. Contact Information</h2>
              <p className="mb-4">
                For shipping-related inquiries, tracking assistance, or support, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> support@ashenterprises.com</li>
                <li><strong>Phone:</strong> +91 8169535736</li>
                <li><strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM IST</li>
                <li><strong>Order Tracking:</strong> Visit "My Orders" section in your account</li>
                <li><strong>Shipping Support:</strong> Available during business hours for queries and assistance</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShippingPolicy;

