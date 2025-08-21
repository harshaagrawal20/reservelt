import Invoice from '../models/invoice.model.js';
import Booking from '../models/booking.model.js';
import User from '../models/user.js';
import Payment from '../models/payment.model.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Generate invoice number
const generateInvoiceNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${timestamp}-${random}`;
};

// Generate Rental Agreement PDF
export const downloadRentalAgreementPDF = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId)
      .populate('productId')
      .populate('renterId')
      .populate('ownerId');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Rental-Agreement-${booking._id.toString().slice(-8)}.pdf"`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(24).font('Helvetica-Bold')
       .text('RENTAL AGREEMENT', 50, 50, { align: 'center' });
    
    doc.fontSize(12).font('Helvetica')
       .text('This agreement is entered into between the Owner and Renter for the rental of equipment/product', 50, 90, { align: 'center' });
    
    // Agreement Details
    doc.fontSize(14).font('Helvetica-Bold')
       .text('AGREEMENT DETAILS', 50, 130);
    
    doc.rect(50, 150, 500, 120).stroke();
    
    doc.fontSize(10).font('Helvetica')
       .text(`Agreement ID: ${booking._id.toString().slice(-8).toUpperCase()}`, 60, 160)
       .text(`Date of Agreement: ${new Date().toLocaleDateString('en-IN')}`, 60, 180)
       .text(`Rental Period: ${new Date(booking.startDate).toLocaleDateString('en-IN')} to ${new Date(booking.endDate).toLocaleDateString('en-IN')}`, 60, 200)
       .text(`Total Amount: ₹${booking.totalPrice}`, 60, 220)
       .text(`Security Deposit: ₹${booking.securityDeposit || 'N/A'}`, 60, 240)
       .text(`Payment Status: ${booking.paymentStatus?.toUpperCase() || 'PENDING'}`, 60, 260);
    
    // Parties Information
    doc.fontSize(14).font('Helvetica-Bold')
       .text('PARTY INFORMATION', 50, 300);
    
    // Owner Information
    doc.fontSize(12).font('Helvetica-Bold')
       .text('OWNER (Lessor)', 50, 330);
    
    doc.rect(50, 350, 240, 120).stroke();
    
    doc.fontSize(10).font('Helvetica')
       .text(`Name: ${booking.ownerId?.firstName || ''} ${booking.ownerId?.lastName || 'Owner'}`, 60, 360)
       .text(`Email: ${booking.ownerId?.email || 'N/A'}`, 60, 380)
       .text(`Phone: ${booking.ownerId?.phone || 'N/A'}`, 60, 400)
       .text(`Clerk ID: ${booking.ownerClerkId || 'N/A'}`, 60, 420)
       .text(`Role: Product Owner/Lessor`, 60, 440);
    
    // Renter Information
    doc.fontSize(12).font('Helvetica-Bold')
       .text('RENTER (Lessee)', 310, 330);
    
    doc.rect(310, 350, 240, 120).stroke();
    
    doc.fontSize(10).font('Helvetica')
       .text(`Name: ${booking.renterId?.firstName || ''} ${booking.renterId?.lastName || 'Customer'}`, 320, 360)
       .text(`Email: ${booking.renterId?.email || 'N/A'}`, 320, 380)
       .text(`Phone: ${booking.renterId?.phone || 'N/A'}`, 320, 400)
       .text(`Clerk ID: ${booking.renterClerkId || 'N/A'}`, 320, 420)
       .text(`Role: Product Renter/Lessee`, 320, 440);
    
    // Product Information
    doc.fontSize(14).font('Helvetica-Bold')
       .text('RENTAL PRODUCT DETAILS', 50, 500);
    
    doc.rect(50, 520, 500, 100).stroke();
    
    doc.fontSize(10).font('Helvetica')
       .text(`Product Name: ${booking.productId?.name || 'N/A'}`, 60, 530)
       .text(`Category: ${booking.productId?.category || 'N/A'}`, 60, 550)
       .text(`Description: ${booking.productId?.description?.substring(0, 80) || 'N/A'}`, 60, 570)
       .text(`Condition: ${booking.productId?.condition || 'N/A'}`, 60, 590)
       .text(`Daily Rate: ₹${booking.productId?.pricePerDay || 'N/A'}`, 60, 610);
    
    // Terms and Conditions
    doc.fontSize(14).font('Helvetica-Bold')
       .text('TERMS AND CONDITIONS', 50, 650);
    
    const terms = [
      '1. The Renter agrees to use the rented product in a responsible manner and return it in the same condition as received.',
      '2. Any damage to the product during the rental period shall be the responsibility of the Renter.',
      '3. The Renter shall pay the full rental amount as specified in this agreement.',
      '4. Late return of the product may result in additional charges at the daily rate.',
      '5. The security deposit (if applicable) will be refunded upon safe return of the product.',
      '6. The Owner reserves the right to terminate this agreement in case of misuse or violation of terms.',
      '7. Any disputes arising from this agreement shall be resolved through mutual discussion.',
      '8. This agreement is governed by the laws of India.',
      '9. The Renter must provide valid identification at the time of pickup.',
      '10. Insurance and liability during the rental period are the responsibility of the Renter.'
    ];
    
    let yPosition = 670;
    terms.forEach(term => {
      doc.fontSize(9).font('Helvetica')
         .text(term, 50, yPosition, { width: 500, align: 'justify' });
      yPosition += 25;
    });
    
    // Add new page if needed
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
    }
    
    // Signatures
    yPosition += 30;
    doc.fontSize(12).font('Helvetica-Bold')
       .text('SIGNATURES', 50, yPosition);
    
    yPosition += 30;
    doc.fontSize(10).font('Helvetica')
       .text('Owner Signature: ___________________________', 50, yPosition)
       .text('Renter Signature: ____________________________', 300, yPosition);
    
    yPosition += 40;
    doc.text('Owner Name: ___________________________', 50, yPosition)
       .text('Renter Name: ____________________________', 300, yPosition);
    
    yPosition += 40;
    doc.text('Date: _____________', 50, yPosition)
       .text('Date: _____________', 300, yPosition);
    
    yPosition += 40;
    doc.text('Witness 1: ___________________________', 50, yPosition)
       .text('Witness 2: ____________________________', 300, yPosition);
    
    // Footer
    yPosition += 60;
    doc.fontSize(8).font('Helvetica')
       .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, yPosition)
       .text('Rental Management System - Official Agreement', 50, yPosition + 15)
       .text('This is a computer-generated document and is valid without physical signature when digitally acknowledged.', 50, yPosition + 30, { width: 500, align: 'center' });
    
    doc.end();
    
  } catch (error) {
    console.error('Error generating rental agreement PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate rental agreement PDF', error: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete invoice', error: error.message });
  }
};

// Download Invoice PDF
export const downloadInvoicePDF = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Get complete booking details with all populated fields
    const booking = await Booking.findById(bookingId)
      .populate('productId')
      .populate('renterId')
      .populate('ownerId');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Get payment details
    const payment = await Payment.findOne({ bookingId: booking._id });
    
    // Get or create invoice
    let invoice = await Invoice.findOne({ bookingId: booking._id });
    if (!invoice) {
      invoice = await createInvoiceForBooking(booking._id);
    }
    
    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Company Header
    doc.fontSize(20).font('Helvetica-Bold')
       .text('RENTAL MANAGEMENT SYSTEM', 50, 50);
    
    doc.fontSize(10).font('Helvetica')
       .text('123 Business Street, Tech City, India', 50, 75)
       .text('Phone: +91 98765 43210 | Email: support@rentalmanagement.com', 50, 90)
       .text('GST: 12ABCDE3456F7GH | PAN: ABCDE3456F', 50, 105);
    
    // Invoice Title
    doc.fontSize(24).font('Helvetica-Bold')
       .text('INVOICE', 400, 50);
    
    // Invoice Details Box
    doc.rect(400, 70, 150, 80).stroke();
    doc.fontSize(10).font('Helvetica')
       .text(`Invoice #: ${invoice.invoiceNumber}`, 410, 80)
       .text(`Date: ${new Date(invoice.issueDate).toLocaleDateString('en-IN')}`, 410, 95)
       .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, 410, 110)
       .text(`Status: ${invoice.status.toUpperCase()}`, 410, 125);
    
    // Billing Information
    doc.fontSize(12).font('Helvetica-Bold')
       .text('BILL TO:', 50, 160);
    
    doc.fontSize(10).font('Helvetica')
       .text(`${booking.renterId?.firstName || ''} ${booking.renterId?.lastName || 'Customer'}`, 50, 180)
       .text(`Email: ${booking.renterId?.email || 'N/A'}`, 50, 195)
       .text(`Phone: ${booking.renterId?.phone || 'N/A'}`, 50, 210);
    
    // Owner Information
    doc.fontSize(12).font('Helvetica-Bold')
       .text('RENTAL FROM:', 300, 160);
    
    doc.fontSize(10).font('Helvetica')
       .text(`${booking.ownerId?.firstName || ''} ${booking.ownerId?.lastName || 'Owner'}`, 300, 180)
       .text(`Email: ${booking.ownerId?.email || 'N/A'}`, 300, 195)
       .text(`Phone: ${booking.ownerId?.phone || 'N/A'}`, 300, 210);
    
    // Rental Details
    doc.fontSize(12).font('Helvetica-Bold')
       .text('RENTAL DETAILS:', 50, 250);
    
    const startDate = new Date(booking.startDate).toLocaleDateString('en-IN');
    const endDate = new Date(booking.endDate).toLocaleDateString('en-IN');
    const duration = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
    
    doc.fontSize(10).font('Helvetica')
       .text(`Product: ${booking.productId?.name || 'N/A'}`, 50, 270)
       .text(`Category: ${booking.productId?.category || 'N/A'}`, 50, 285)
       .text(`Rental Period: ${startDate} to ${endDate}`, 50, 300)
       .text(`Duration: ${duration} day(s)`, 50, 315)
       .text(`Booking ID: ${booking._id.toString().slice(-8).toUpperCase()}`, 50, 330);
    
    // Payment Details
    if (payment) {
      doc.fontSize(12).font('Helvetica-Bold')
         .text('PAYMENT DETAILS:', 300, 250);
      
      doc.fontSize(10).font('Helvetica')
         .text(`Payment Method: ${payment.paymentGateway?.toUpperCase() || 'N/A'}`, 300, 270)
         .text(`Transaction ID: ${payment.gatewayPaymentId?.slice(-12).toUpperCase() || 'N/A'}`, 300, 285)
         .text(`Payment Date: ${payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN') : 'N/A'}`, 300, 300)
         .text(`Payment Status: ${payment.status?.toUpperCase() || 'N/A'}`, 300, 315);
    }
    
    // Invoice Items Table
    const tableTop = 370;
    doc.fontSize(12).font('Helvetica-Bold')
       .text('INVOICE ITEMS:', 50, tableTop);
    
    // Table Headers
    const headerY = tableTop + 25;
    doc.rect(50, headerY, 500, 20).fillAndStroke('#f0f0f0', '#000');
    
    doc.fillColor('#000').fontSize(10).font('Helvetica-Bold')
       .text('DESCRIPTION', 60, headerY + 6)
       .text('QTY', 350, headerY + 6)
       .text('RATE', 400, headerY + 6)
       .text('AMOUNT', 480, headerY + 6);
    
    // Table Rows
    let currentY = headerY + 20;
    const baseAmount = booking.totalPrice - (booking.platformFee || 0);
    const gstAmount = baseAmount * 0.18;
    const subtotalAmount = baseAmount - gstAmount;
    
    // Rental Item
    doc.rect(50, currentY, 500, 25).stroke();
    doc.font('Helvetica').fontSize(9)
       .text(`Rental of ${booking.productId?.name || 'Product'}`, 60, currentY + 8)
       .text(`(${duration} day${duration > 1 ? 's' : ''})`, 60, currentY + 18)
       .text(duration.toString(), 350, currentY + 8)
       .text(`₹${(subtotalAmount/duration).toFixed(2)}`, 400, currentY + 8)
       .text(`₹${subtotalAmount.toFixed(2)}`, 480, currentY + 8);
    
    currentY += 25;
    
    // GST Item
    doc.rect(50, currentY, 500, 20).stroke();
    doc.text('GST (18%)', 60, currentY + 6)
       .text('1', 350, currentY + 6)
       .text(`₹${gstAmount.toFixed(2)}`, 400, currentY + 6)
       .text(`₹${gstAmount.toFixed(2)}`, 480, currentY + 6);
    
    currentY += 20;
    
    // Platform Fee
    if (booking.platformFee > 0) {
      doc.rect(50, currentY, 500, 20).stroke();
      doc.text('Platform Fee', 60, currentY + 6)
         .text('1', 350, currentY + 6)
         .text(`₹${booking.platformFee.toFixed(2)}`, 400, currentY + 6)
         .text(`₹${booking.platformFee.toFixed(2)}`, 480, currentY + 6);
      currentY += 20;
    }
    
    // Totals
    currentY += 10;
    doc.rect(350, currentY, 200, 60).fillAndStroke('#f9f9f9', '#000');
    
    doc.fillColor('#000').font('Helvetica')
       .text(`Subtotal: ₹${subtotalAmount.toFixed(2)}`, 360, currentY + 8)
       .text(`GST (18%): ₹${gstAmount.toFixed(2)}`, 360, currentY + 23)
       .text(`Platform Fee: ₹${(booking.platformFee || 0).toFixed(2)}`, 360, currentY + 38);
    
    doc.font('Helvetica-Bold').fontSize(12)
       .text(`TOTAL: ₹${booking.totalPrice.toFixed(2)}`, 360, currentY + 50);
    
    // Terms and Conditions
    currentY += 100;
    doc.fontSize(10).font('Helvetica-Bold')
       .text('TERMS & CONDITIONS:', 50, currentY);
    
    doc.fontSize(8).font('Helvetica')
       .text('1. Payment is due upon receipt of this invoice.', 50, currentY + 15)
       .text('2. Late fees may apply for overdue returns.', 50, currentY + 27)
       .text('3. Damage charges will be applied as per rental agreement.', 50, currentY + 39)
       .text('4. This is a computer-generated invoice and does not require a signature.', 50, currentY + 51);
    
    // Footer
    const footerY = doc.page.height - 100;
    doc.fontSize(8).font('Helvetica')
       .text('Thank you for choosing Rental Management System!', 50, footerY)
       .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, footerY + 15)
       .text('For support, contact: support@rentalmanagement.com', 50, footerY + 30);
    
    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice PDF', error: error.message });
  }
};

// Generate Pickup Document PDF
export const downloadPickupDocumentPDF = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId)
      .populate('productId')
      .populate('renterId')
      .populate('ownerId');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Pickup-Document-${booking._id.toString().slice(-8)}.pdf"`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).font('Helvetica-Bold')
       .text('RENTAL PICKUP DOCUMENT', 50, 50, { align: 'center' });
    
    doc.fontSize(12).font('Helvetica')
       .text('Please present this document at the time of pickup', 50, 80, { align: 'center' });
    
    // Booking Information
    doc.fontSize(14).font('Helvetica-Bold')
       .text('BOOKING INFORMATION', 50, 120);
    
    doc.rect(50, 140, 500, 120).stroke();
    
    doc.fontSize(10).font('Helvetica')
       .text(`Booking ID: ${booking._id.toString().slice(-8).toUpperCase()}`, 60, 150)
       .text(`Product: ${booking.productId?.name || 'N/A'}`, 60, 170)
       .text(`Category: ${booking.productId?.category || 'N/A'}`, 60, 190)
       .text(`Pickup Date: ${new Date(booking.startDate).toLocaleDateString('en-IN')}`, 60, 210)
       .text(`Return Date: ${new Date(booking.endDate).toLocaleDateString('en-IN')}`, 60, 230)
       .text(`Payment Status: ${booking.paymentStatus?.toUpperCase() || 'PAID'}`, 60, 250);
    
    // Renter Information
    doc.fontSize(14).font('Helvetica-Bold')
       .text('RENTER INFORMATION', 50, 290);
    
    doc.rect(50, 310, 240, 100).stroke();
    
    doc.fontSize(10).font('Helvetica')
       .text(`Name: ${booking.renterId?.firstName || ''} ${booking.renterId?.lastName || 'Customer'}`, 60, 320)
       .text(`Email: ${booking.renterId?.email || 'N/A'}`, 60, 340)
       .text(`Phone: ${booking.renterId?.phone || 'N/A'}`, 60, 360)
       .text(`Clerk ID: ${booking.renterClerkId || 'N/A'}`, 60, 380);
    
    // Owner Information
    doc.fontSize(14).font('Helvetica-Bold')
       .text('OWNER INFORMATION', 310, 290);
    
    doc.rect(310, 310, 240, 100).stroke();
    
    doc.fontSize(10).font('Helvetica')
       .text(`Name: ${booking.ownerId?.firstName || ''} ${booking.ownerId?.lastName || 'Owner'}`, 320, 320)
       .text(`Email: ${booking.ownerId?.email || 'N/A'}`, 320, 340)
       .text(`Phone: ${booking.ownerId?.phone || 'N/A'}`, 320, 360)
       .text(`Clerk ID: ${booking.ownerClerkId || 'N/A'}`, 320, 380);
    
    // Pickup Instructions
    doc.fontSize(14).font('Helvetica-Bold')
       .text('PICKUP INSTRUCTIONS', 50, 440);
    
    doc.fontSize(10).font('Helvetica')
       .text('1. Please bring a valid government ID for verification', 50, 465)
       .text('2. Inspect the product condition before taking possession', 50, 485)
       .text('3. Report any damages or issues immediately', 50, 505)
       .text('4. Ensure you understand the return process and timeline', 50, 525)
       .text('5. Keep this document for your records', 50, 545);
    
    // Signatures
    doc.fontSize(12).font('Helvetica-Bold')
       .text('SIGNATURES', 50, 580);
    
    doc.fontSize(10).font('Helvetica')
       .text('Renter Signature: ___________________________', 50, 610)
       .text('Owner Signature: ____________________________', 300, 610)
       .text('Date: _____________', 50, 640)
       .text('Time: _____________', 300, 640);
    
    // Footer
    doc.fontSize(8).font('Helvetica')
       .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, 700)
       .text('Rental Management System - Pickup Document', 50, 715);
    
    doc.end();
    
  } catch (error) {
    console.error('Error generating pickup document:', error);
    res.status(500).json({ success: false, message: 'Failed to generate pickup document', error: error.message });
  }
};() => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}-${random}`;
};

// Create invoice for approved booking
export const createInvoiceForBooking = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId).populate('productId', 'title category');
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ bookingId: booking._id });
    if (existingInvoice) {
      return existingInvoice;
    }

    // Calculate due date (7 days from creation)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // Calculate rental duration
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Create invoice items
    const basePrice = booking.totalPrice - booking.platformFee;
    const taxAmount = basePrice * 0.18; // 18% GST
    const subtotal = basePrice - taxAmount;

    const items = [
      {
        description: `Rental of ${booking.productId?.title || 'Product'} (${durationDays} day${durationDays > 1 ? 's' : ''})`,
        quantity: durationDays,
        unitPrice: subtotal / durationDays,
        total: subtotal
      },
      {
        description: 'GST (18%)',
        quantity: 1,
        unitPrice: taxAmount,
        total: taxAmount
      }
    ];

    const invoice = await Invoice.create({
      bookingId: booking._id,
      userId: booking.renterId,
      invoiceNumber: generateInvoiceNumber(),
      amount: booking.totalPrice,
      currency: 'inr',
      status: 'unpaid',
      dueDate: dueDate,
      items: items,
      notes: `Invoice for rental of ${booking.productId?.title || 'Product'} from ${startDate.toDateString()} to ${endDate.toDateString()}`
    });

    return invoice;
  } catch (error) {
    console.error('Error creating invoice for booking:', error);
    throw error;
  }
};

// Download invoice as PDF
export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id)
      .populate('bookingId')
      .populate('userId', 'firstName lastName email');
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Generate PDF content (simple HTML that can be converted to PDF)
    const htmlContent = generateInvoiceHTML(invoice);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
    
    // For now, return HTML content that frontend can convert to PDF
    // In a real application, you'd use a library like puppeteer to generate actual PDF
    res.send(htmlContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate invoice', error: error.message });
  }
};

// View invoice in browser
export const viewInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id)
      .populate('bookingId')
      .populate('userId', 'firstName lastName email');
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Generate HTML content for viewing
    const htmlContent = generateInvoiceHTML(invoice);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to view invoice', error: error.message });
  }
};

// Generate HTML content for invoice
const generateInvoiceHTML = (invoice) => {
  const booking = invoice.bookingId;
  const user = invoice.userId;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const invoiceDate = invoice.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dueDate = invoice.dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Calculate subtotal and tax
  let subtotal = 0;
  invoice.items.forEach(item => {
    if (!item.description.includes('GST')) {
      subtotal += item.total;
    }
  });
  
  // Find tax item
  const taxItem = invoice.items.find(item => item.description.includes('GST'));
  const taxAmount = taxItem ? taxItem.total : 0;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 0; color: #333; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #4a86e8; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #4a86e8; }
        .company-details { float: right; text-align: right; }
        .invoice-title { clear: both; text-align: center; margin: 40px 0 20px; }
        .invoice-title h1 { margin: 0; color: #4a86e8; font-size: 36px; }
        .invoice-title h2 { margin: 5px 0 0; font-size: 20px; color: #666; font-weight: normal; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .invoice-info-block { width: 45%; }
        .invoice-info-block h4 { margin: 0 0 5px; color: #4a86e8; font-size: 16px; }
        .invoice-info-block p { margin: 0 0 5px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background-color: #f5f5f5; color: #4a86e8; text-align: left; padding: 12px; border-bottom: 2px solid #ddd; }
        .items-table td { padding: 12px; border-bottom: 1px solid #ddd; }
        .items-table .amount { text-align: right; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .summary-table td { padding: 8px; }
        .summary-table .label { text-align: right; font-weight: normal; width: 80%; }
        .summary-table .amount { text-align: right; width: 20%; }
        .summary-table .total-row td { font-weight: bold; font-size: 18px; border-top: 2px solid #4a86e8; padding-top: 12px; }
        .terms { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; }
        .terms h4 { color: #4a86e8; margin: 0 0 10px; }
        .footer { margin-top: 50px; text-align: center; color: #888; font-size: 14px; }
        .signature-area { margin-top: 60px; display: flex; justify-content: space-between; }
        .signature-box { border-top: 1px solid #000; width: 200px; padding-top: 5px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">RENTAL MANAGEMENT SYSTEM</div>
          <div class="company-details">
            <p>123 Business Street</p>
            <p>City, State 12345</p>
            <p>Phone: (123) 456-7890</p>
            <p>Email: support@rentalsystem.com</p>
            <p>GST No: 29AADCB2230M1ZP</p>
          </div>
        </div>
        
        <div class="invoice-title">
          <h1>INVOICE</h1>
          <h2>${invoice.invoiceNumber}</h2>
        </div>
        
        <div class="invoice-info">
          <div class="invoice-info-block">
            <h4>BILL TO:</h4>
            <p><strong>${user.firstName} ${user.lastName}</strong></p>
            <p>${user.email}</p>
            <p>${user.phone || 'No phone provided'}</p>
          </div>
          
          <div class="invoice-info-block">
            <h4>INVOICE DETAILS:</h4>
            <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
            <p><strong>Payment Terms:</strong> Due on receipt</p>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th class="amount">Unit Price</th>
              <th class="amount">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td class="amount">₹${item.unitPrice.toFixed(2)}</td>
                <td class="amount">₹${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <table class="summary-table">
          <tr>
            <td class="label">Subtotal:</td>
            <td class="amount">₹${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">GST (18%):</td>
            <td class="amount">₹${taxAmount.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td class="label">Total Amount:</td>
            <td class="amount">₹${invoice.amount.toFixed(2)}</td>
          </tr>
        </table>
        
        <div class="terms">
          <h4>Terms & Conditions</h4>
          <ol>
            <p>1. Payment is due within 7 days of invoice date.</p>
            <p>2. This invoice is subject to the terms of the rental agreement.</p>
            <p>3. Late payments are subject to a 2% monthly interest charge.</p>
            <p>4. All disputes must be raised within 7 days of invoice receipt.</p>
          </ol>
        </div>
        
        ${invoice.notes ? `<div class="notes"><h4>Additional Notes</h4><p>${invoice.notes}</p></div>` : ''}
        
        <div class="signature-area">
          <div class="signature-box">Authorized Signature</div>
          <div class="signature-box">Customer Signature</div>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated invoice and does not require a physical signature.</p>
          <p>Thank you for your business!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create invoice', error: error.message });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    const numericLimit = Math.min(Number(limit) || 20, 100);
    const numericPage = Math.max(Number(page) || 1, 1);
    const [invoices, total] = await Promise.all([
      Invoice.find(filter).sort({ createdAt: -1 }).limit(numericLimit).skip((numericPage - 1) * numericLimit),
      Invoice.countDocuments(filter),
    ]);
    res.json({ success: true, invoices, pagination: { page: numericPage, limit: numericLimit, total, pages: Math.ceil(total / numericLimit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch invoices', error: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch invoice', error: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update invoice', error: error.message });
  }
};