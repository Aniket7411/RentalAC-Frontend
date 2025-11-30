/**
 * Invoice Generator Utility
 * Generates and downloads order invoices as PDF
 */

import jsPDF from 'jspdf';

/**
 * Format date for invoice
 */
const formatInvoiceDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * Format time slot for service bookings
 */
const formatTimeSlot = (time) => {
  const timeMap = {
    '10-12': '10 AM - 12 PM',
    '12-2': '12 PM - 2 PM',
    '2-4': '2 PM - 4 PM',
    '4-6': '4 PM - 6 PM',
    '6-8': '6 PM - 8 PM',
  };
  return timeMap[time] || time;
};

/**
 * Get product details from order item
 */
const getProductDetails = (item) => {
  if (item.productDetails) return item.productDetails;
  if (item.productId && typeof item.productId === 'object') {
    return {
      brand: item.productId.brand,
      model: item.productId.model,
      capacity: item.productId.capacity,
      type: item.productId.type,
      location: item.productId.location,
      images: item.productId.images || []
    };
  }
  if (item.product && typeof item.product === 'object') {
    return {
      brand: item.product.brand,
      model: item.product.model,
      capacity: item.product.capacity,
      type: item.product.type,
      location: item.product.location,
      images: item.product.images || []
    };
  }
  return {};
};

/**
 * Add text with word wrap
 */
const addWrappedText = (doc, text, x, y, maxWidth, lineHeight = 7) => {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return lines.length * lineHeight;
};

/**
 * Generate PDF Invoice
 */
const generatePDFInvoice = (order) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    const orderId = order.orderId || order.id || order._id || 'N/A';
    const orderDate = formatInvoiceDate(order.createdAt || order.orderDate || order.date);

    // Get customer info
    let customerInfo = order.customerInfo || {};
    if (order.userId && typeof order.userId === 'object') {
      customerInfo = {
        userId: customerInfo.userId || order.userId._id || order.userId,
        name: customerInfo.name || order.userId.name || 'N/A',
        email: customerInfo.email || order.userId.email || 'N/A',
        phone: customerInfo.phone || order.userId.phone || 'N/A',
        address: customerInfo.address || {}
      };
    }

    const items = order.items || [];
    const total = order.total || 0;
    const discount = order.discount || 0;
    const finalTotal = order.finalTotal || total;

    // Colors
    const primaryColor = [37, 99, 235]; // Blue
    const textColor = [51, 51, 51];
    const lightTextColor = [102, 102, 102];

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Rental Service', margin, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('AC & Appliance Rental Services', margin, 28);
    doc.text('Email: support@rentalservice.com | Phone: +91 1234567890', margin, 34);

    yPos = 50;

    // Invoice Title
    doc.setTextColor(...textColor);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin, yPos, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order #${orderId}`, pageWidth - margin, yPos + 7, { align: 'right' });
    doc.text(`Date: ${orderDate}`, pageWidth - margin, yPos + 13, { align: 'right' });

    yPos += 25;

    // Bill To Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Bill To:', margin, yPos);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    yPos += 7;
    doc.text(`Name: ${customerInfo.name || 'N/A'}`, margin, yPos);
    yPos += 6;
    doc.text(`Email: ${customerInfo.email || 'N/A'}`, margin, yPos);
    yPos += 6;
    doc.text(`Phone: ${customerInfo.phone || 'N/A'}`, margin, yPos);

    if (customerInfo.address?.homeAddress) {
      yPos += 6;
      doc.text(`Address: ${customerInfo.address.homeAddress}`, margin, yPos);
      if (customerInfo.address.nearLandmark) {
        yPos += 6;
        doc.text(`Landmark: ${customerInfo.address.nearLandmark}`, margin, yPos);
      }
      if (customerInfo.address.pincode) {
        yPos += 6;
        doc.text(`Pincode: ${customerInfo.address.pincode}`, margin, yPos);
      }
    }

    // Order Information (Right side)
    const rightX = pageWidth - margin - 60;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Order Information:', rightX, yPos - 30);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(`Order ID: ${orderId}`, rightX, yPos - 23);
    doc.text(`Order Date: ${orderDate}`, rightX, yPos - 17);
    doc.text(`Status: ${order.status || 'Pending'}`, rightX, yPos - 11);
    doc.text(`Payment: ${order.paymentOption === 'payNow' ? 'Pay Now' : 'Pay Later'}`, rightX, yPos - 5);
    doc.text(`Payment Status: ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}`, rightX, yPos + 1);

    yPos += 15;

    // Items Table Header
    doc.setFillColor(...primaryColor);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Item', margin + 2, yPos + 7);
    doc.text('Description', margin + 50, yPos + 7);
    doc.text('Qty', margin + 120, yPos + 7);
    doc.text('Price', margin + 140, yPos + 7);
    doc.text('Total', pageWidth - margin - 2, yPos + 7, { align: 'right' });

    yPos += 12;

    // Items
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');

    items.forEach((item, idx) => {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }

      let itemName = '';
      let itemDescription = '';

      if (item.type === 'rental') {
        const productDetails = getProductDetails(item);
        itemName = `${productDetails.brand || ''} ${productDetails.model || ''}`.trim() || 'Rental Product';
        const descParts = [];
        if (productDetails.capacity) descParts.push(`Capacity: ${productDetails.capacity}`);
        if (productDetails.type) descParts.push(`Type: ${productDetails.type}`);
        if (productDetails.location) descParts.push(`Location: ${productDetails.location}`);
        if (item.duration) descParts.push(`Duration: ${item.duration} months`);
        itemDescription = descParts.join(', ');
      } else if (item.type === 'service') {
        itemName = item.serviceDetails?.title || 'Service';
        itemDescription = item.serviceDetails?.description || '';
        if (item.bookingDetails) {
          const bookingParts = [];
          if (item.bookingDetails.preferredDate) {
            bookingParts.push(`Date: ${formatInvoiceDate(item.bookingDetails.preferredDate)}`);
          }
          if (item.bookingDetails.preferredTime) {
            bookingParts.push(`Time: ${formatTimeSlot(item.bookingDetails.preferredTime)}`);
          }
          if (item.bookingDetails.address) {
            bookingParts.push(`Address: ${item.bookingDetails.address}`);
          }
          if (bookingParts.length > 0) {
            itemDescription += (itemDescription ? ' | ' : '') + bookingParts.join(', ');
          }
        }
      } else {
        itemName = `${item.brand || ''} ${item.model || item.name || 'Item'}`.trim();
        itemDescription = item.description || '';
      }

      const quantity = item.quantity || 1;
      const price = item.price || 0;
      const itemTotal = price * quantity;

      // Draw item row
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);

      // Item name (max width 45mm)
      const nameLines = doc.splitTextToSize(itemName || 'Item', 45);
      doc.text(nameLines, margin + 2, yPos + 5);

      // Description (max width 60mm)
      const descText = itemDescription || '-';
      const descLines = doc.splitTextToSize(descText, 60);
      doc.text(descLines, margin + 50, yPos + 5);

      // Quantity
      doc.text(String(quantity), margin + 120, yPos + 5);

      // Price
      doc.text(`₹${price.toLocaleString('en-IN')}`, margin + 140, yPos + 5);

      // Total
      doc.text(`₹${itemTotal.toLocaleString('en-IN')}`, pageWidth - margin - 2, yPos + 5, { align: 'right' });

      // Calculate height needed for this row (minimum 8mm, or based on text lines)
      const maxLines = Math.max(nameLines.length, descLines.length, 1);
      yPos += Math.max(8, maxLines * 4.5);
    });

    // Summary Section
    yPos += 10;
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }

    const summaryX = pageWidth - margin - 60;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);

    doc.text('Subtotal:', summaryX, yPos);
    doc.text(`₹${total.toLocaleString('en-IN')}`, pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 7;

    if (discount > 0) {
      doc.setTextColor(16, 185, 129); // Green
      doc.text('Discount:', summaryX, yPos);
      doc.text(`-₹${discount.toLocaleString('en-IN')}`, pageWidth - margin - 2, yPos, { align: 'right' });
      yPos += 7;
    }

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(summaryX, yPos, pageWidth - margin, yPos);
    yPos += 5;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Total Amount:', summaryX, yPos);
    doc.text(`₹${finalTotal.toLocaleString('en-IN')}`, pageWidth - margin - 2, yPos, { align: 'right' });

    // Cancellation Notice
    if (order.cancellationReason) {
      yPos += 15;
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFillColor(254, 226, 226); // Light red
      doc.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F');

      doc.setDrawColor(220, 38, 38); // Red border
      doc.setLineWidth(0.5);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 20);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(153, 27, 27); // Dark red
      doc.text('Order Cancelled', margin + 5, yPos + 8);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Reason: ${order.cancellationReason}`, margin + 5, yPos + 14);

      if (order.cancelledAt) {
        doc.text(`Cancelled on: ${formatInvoiceDate(order.cancelledAt)}`, margin + 5, yPos + 19);
      }
    }

    // Footer
    yPos = pageHeight - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightTextColor);
    doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('This is a computer-generated invoice. No signature required.', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('For any queries, please contact us at support@rentalservice.com', pageWidth / 2, yPos, { align: 'center' });

    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Download invoice as PDF
 */
export const downloadInvoice = (order) => {
  try {
    if (!order) {
      throw new Error('Order data is required');
    }
    const doc = generatePDFInvoice(order);
    const orderId = order.orderId || order.id || order._id || 'Order';
    const fileName = `Invoice-${orderId}.pdf`;
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};

/**
 * Print invoice
 */
export const printInvoice = (order) => {
  try {
    if (!order) {
      throw new Error('Order data is required');
    }
    const doc = generatePDFInvoice(order);
    doc.autoPrint();
    doc.output('dataurlnewwindow');
    return true;
  } catch (error) {
    console.error('Error printing invoice:', error);
    throw error;
  }
};

/**
 * Generate and download invoice (combines both options)
 */
export const generateInvoice = (order, action = 'download') => {
  if (action === 'print') {
    return printInvoice(order);
  } else {
    return downloadInvoice(order);
  }
};
