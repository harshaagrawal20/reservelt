import Document from '../models/document.model.js';
import Booking from '../models/booking.model.js';
import Product from '../models/product.model.js';

// Generate document number
const generateDocumentNumber = (type) => {
  const prefix = type === 'pickup' ? 'PU' : 'RT';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Create pickup document for approved booking
export const createPickupDocument = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title category')
      .populate('renterId', 'firstName lastName email phone');
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if pickup document already exists
    const existingDocument = await Document.findOne({ 
      bookingId: booking._id,
      type: 'pickup'
    });
    
    if (existingDocument) {
      return existingDocument;
    }

    // Create pickup document
    const document = await Document.create({
      bookingId: booking._id,
      type: 'pickup',
      documentNumber: generateDocumentNumber('pickup'),
      status: 'pending',
      scheduledDate: booking.startDate,
      items: [{
        productId: booking.productId._id,
        quantity: 1,
        condition: 'good',
        notes: `Pickup for rental of ${booking.productId.title}`
      }],
      notes: `Pickup document for rental of ${booking.productId.title} to ${booking.renterId.firstName} ${booking.renterId.lastName}`
    });

    // Update booking pickup status
    await Booking.findByIdAndUpdate(bookingId, { pickupStatus: 'scheduled' });

    return document;
  } catch (error) {
    console.error('Error creating pickup document:', error);
    throw error;
  }
};

// Create return document for completed rental
export const createReturnDocument = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title category')
      .populate('renterId', 'firstName lastName email phone');
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if return document already exists
    const existingDocument = await Document.findOne({ 
      bookingId: booking._id,
      type: 'return'
    });
    
    if (existingDocument) {
      return existingDocument;
    }

    // Create return document
    const document = await Document.create({
      bookingId: booking._id,
      type: 'return',
      documentNumber: generateDocumentNumber('return'),
      status: 'pending',
      scheduledDate: booking.endDate,
      items: [{
        productId: booking.productId._id,
        quantity: 1,
        condition: 'good', // Will be updated upon actual return
        notes: `Return for rental of ${booking.productId.title}`
      }],
      notes: `Return document for rental of ${booking.productId.title} from ${booking.renterId.firstName} ${booking.renterId.lastName}`
    });

    // Update booking return status
    await Booking.findByIdAndUpdate(bookingId, { returnStatus: 'scheduled' });

    return document;
  } catch (error) {
    console.error('Error creating return document:', error);
    throw error;
  }
};

// Generate HTML content for document
const generateDocumentHTML = (document, booking, product, user) => {
  const documentType = document.type.charAt(0).toUpperCase() + document.type.slice(1);
  const action = document.type === 'pickup' ? 'Deliver to' : 'Collect from';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const scheduledDate = new Date(document.scheduledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const actionText = document.type === 'pickup' ? 'received from' : 'returned to';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${documentType} Document ${document.documentNumber}</title>
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 0; color: #333; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #4a86e8; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #4a86e8; }
        .company-details { float: right; text-align: right; }
        .document-title { clear: both; text-align: center; margin: 40px 0 20px; }
        .document-title h1 { margin: 0; color: #4a86e8; font-size: 36px; }
        .document-title h2 { margin: 5px 0 0; font-size: 20px; color: #666; font-weight: normal; }
        .document-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .document-info-block { width: 45%; }
        .document-info-block h4 { margin: 0 0 5px; color: #4a86e8; font-size: 16px; }
        .document-info-block p { margin: 0 0 5px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background-color: #f5f5f5; color: #4a86e8; text-align: left; padding: 12px; border-bottom: 2px solid #ddd; }
        .items-table td { padding: 12px; border-bottom: 1px solid #ddd; }
        .terms { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; }
        .terms h4 { color: #4a86e8; margin: 0 0 10px; }
        .signature-area { margin-top: 60px; display: flex; justify-content: space-between; }
        .signature-box { border-top: 1px solid #000; width: 200px; padding-top: 5px; text-align: center; }
        .checklist { margin: 30px 0; }
        .checklist h4 { color: #4a86e8; margin: 0 0 10px; }
        .checklist-item { margin-bottom: 10px; }
        .checklist-item input { margin-right: 10px; }
        .footer { margin-top: 50px; text-align: center; color: #888; font-size: 14px; }
        .legal-text { font-size: 12px; color: #666; margin-top: 20px; }
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
          </div>
        </div>
        
        <div class="document-title">
          <h1>${documentType.toUpperCase()} DOCUMENT</h1>
          <h2>${document.documentNumber}</h2>
        </div>
        
        <div class="document-info">
          <div class="document-info-block">
            <h4>CUSTOMER INFORMATION:</h4>
            <p><strong>${user.firstName} ${user.lastName}</strong></p>
            <p>Email: ${user.email}</p>
            <p>Phone: ${user.phone || 'N/A'}</p>
          </div>
          
          <div class="document-info-block">
            <h4>DOCUMENT DETAILS:</h4>
            <p><strong>Document Number:</strong> ${document.documentNumber}</p>
            <p><strong>Scheduled Date:</strong> ${scheduledDate}</p>
            <p><strong>Status:</strong> ${document.status.toUpperCase()}</p>
            <p><strong>Booking Reference:</strong> ${booking._id}</p>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Condition</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${document.items.map(item => `
              <tr>
                <td>${product.title}</td>
                <td>${item.quantity}</td>
                <td>${item.condition}</td>
                <td>${item.notes || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="checklist">
          <h4>ITEM CONDITION CHECKLIST:</h4>
          <div class="checklist-item"><input type="checkbox"> Item is in working condition</div>
          <div class="checklist-item"><input type="checkbox"> All accessories are included</div>
          <div class="checklist-item"><input type="checkbox"> No visible damage or scratches</div>
          <div class="checklist-item"><input type="checkbox"> Item has been tested and functions properly</div>
          <div class="checklist-item"><input type="checkbox"> Customer has been instructed on proper use</div>
        </div>
        
        <div class="notes">
          <p><strong>Notes:</strong> ${document.notes || 'No additional notes'}</p>
        </div>
        
        <div class="terms">
          <h4>Terms & Conditions</h4>
          <ol>
            <p>1. This document confirms that the listed items have been ${actionText} the Rental Management System.</p>
            <p>2. The customer acknowledges the condition of the items as noted above.</p>
            <p>3. Any damages not noted on this document may result in additional charges.</p>
            <p>4. For returns, all items must be in the same condition as when they were picked up.</p>
          </ol>
        </div>
        
        <div class="signature-area">
          <div class="signature-box">Customer Signature</div>
          <div class="signature-box">Agent Signature</div>
        </div>
        
        <div class="legal-text">
          <p>By signing above, I acknowledge that I have ${actionText} the Rental Management System the item(s) listed in this document in the condition noted. I agree to the terms and conditions of the rental agreement.</p>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated document and does not require a physical signature when electronically acknowledged.</p>
          <p>Document generated on: ${today}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate HTML content for rental agreement
const generateRentalAgreementHTML = (document) => {
  const booking = document.bookingId;
  const owner = booking.ownerId;
  const renter = booking.renterId;
  const product = booking.productId;
  
  // Format dates properly
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const startDate = new Date(booking.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const endDate = new Date(booking.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Calculate rental duration in days
  const startDateObj = new Date(booking.startDate);
  const endDateObj = new Date(booking.endDate);
  const durationMs = endDateObj.getTime() - startDateObj.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rental Agreement ${document.documentNumber}</title>
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 0; color: #333; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #4a86e8; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #4a86e8; }
        .company-details { float: right; text-align: right; }
        .document-title { clear: both; text-align: center; margin: 40px 0 20px; }
        .document-title h1 { margin: 0; color: #4a86e8; font-size: 36px; }
        .document-title h2 { margin: 5px 0 0; font-size: 20px; color: #666; font-weight: normal; }
        .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .party-block { width: 45%; }
        .party-block h4 { margin: 0 0 5px; color: #4a86e8; font-size: 16px; }
        .party-block p { margin: 0 0 5px; }
        .rental-details { margin-bottom: 30px; }
        .rental-details h4 { color: #4a86e8; margin: 0 0 10px; }
        .rental-details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .rental-details-table th { background-color: #f5f5f5; color: #4a86e8; text-align: left; padding: 12px; border-bottom: 2px solid #ddd; }
        .rental-details-table td { padding: 12px; border-bottom: 1px solid #ddd; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background-color: #f5f5f5; color: #4a86e8; text-align: left; padding: 12px; border-bottom: 2px solid #ddd; }
        .items-table td { padding: 12px; border-bottom: 1px solid #ddd; }
        .terms { margin-top: 40px; }
        .terms h4 { color: #4a86e8; margin: 0 0 10px; }
        .terms ol { padding-left: 20px; }
        .terms li { margin-bottom: 10px; }
        .signature-area { margin-top: 60px; display: flex; justify-content: space-between; }
        .signature-box { border-top: 1px solid #000; width: 200px; padding-top: 5px; text-align: center; }
        .footer { margin-top: 50px; text-align: center; color: #888; font-size: 14px; }
        .legal-text { font-size: 12px; color: #666; margin-top: 20px; }
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
        
        <div class="document-title">
          <h1>RENTAL AGREEMENT</h1>
          <h2>${document.documentNumber}</h2>
        </div>
        
        <div class="parties">
          <div class="party-block">
            <h4>OWNER:</h4>
            <p><strong>${owner.firstName} ${owner.lastName}</strong></p>
            <p>Email: ${owner.email}</p>
            <p>Phone: ${owner.phone || 'N/A'}</p>
          </div>
          
          <div class="party-block">
            <h4>RENTER:</h4>
            <p><strong>${renter.firstName} ${renter.lastName}</strong></p>
            <p>Email: ${renter.email}</p>
            <p>Phone: ${renter.phone || 'N/A'}</p>
          </div>
        </div>
        
        <div class="rental-details">
          <h4>RENTAL DETAILS:</h4>
          <table class="rental-details-table">
            <tr>
              <td><strong>Agreement Date:</strong></td>
              <td>${today}</td>
            </tr>
            <tr>
              <td><strong>Rental Period:</strong></td>
              <td>${startDate} to ${endDate} (${durationDays} days)</td>
            </tr>
            <tr>
              <td><strong>Total Amount:</strong></td>
              <td>₹${booking.totalAmount ? booking.totalAmount.toFixed(2) : '0.00'}</td>
            </tr>
            <tr>
              <td><strong>Security Deposit:</strong></td>
              <td>₹${booking.securityDeposit ? booking.securityDeposit.toFixed(2) : '0.00'}</td>
            </tr>
            <tr>
              <td><strong>Payment Status:</strong></td>
              <td>${booking.paymentStatus ? booking.paymentStatus.toUpperCase() : 'PENDING'}</td>
            </tr>
          </table>
        </div>
        
        <div class="rental-item">
          <h4>RENTAL ITEM:</h4>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Description</th>
                <th>Condition</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${product.title || product.name}</td>
                <td>${product.description}</td>
                <td>${document.items[0].condition || 'Good'}</td>
                <td>₹${product.price ? product.price.toFixed(2) : '0.00'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="terms">
          <h4>TERMS & CONDITIONS</h4>
          <ol>
            <li>The Renter agrees to pay the rental fee and security deposit as specified above.</li>
            <li>The Renter shall return the item(s) in the same condition as received, normal wear and tear excepted.</li>
            <li>The Renter is responsible for any damage to the rental item(s) beyond normal wear and tear.</li>
            <li>The security deposit will be refunded within 7 business days after the return of the item(s), less any deductions for damages.</li>
            <li>Late returns will incur additional charges at the daily rate plus a 20% late fee.</li>
            <li>The Owner reserves the right to charge the Renter for any damages or loss of the rental item(s).</li>
            <li>The Renter shall not sublet or transfer the rental item(s) to any other person or entity.</li>
            <li>The Owner makes no warranties, express or implied, as to the fitness of the rental item(s) for any particular purpose.</li>
            <li>The Renter assumes all risks associated with the use of the rental item(s).</li>
            <li>This agreement constitutes the entire understanding between the parties and supersedes all prior agreements.</li>
          </ol>
        </div>
        
        <div class="signature-area">
          <div class="signature-box">Owner Signature</div>
          <div class="signature-box">Renter Signature</div>
        </div>
        
        <div class="legal-text">
          <p>By signing above, both parties acknowledge that they have read, understood, and agree to be bound by the terms and conditions of this rental agreement.</p>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated document and does not require a physical signature when electronically acknowledged.</p>
          <p>Document generated on: ${today}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Download document as PDF
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'renterId' },
          { path: 'productId' },
          { path: 'ownerId' }
        ]
      });
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Generate PDF content based on document type
    let htmlContent;
    if (document.type === 'agreement') {
      htmlContent = generateRentalAgreementHTML(document);
    } else {
      htmlContent = generateDocumentHTML(document);
    }
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.type}-${document.documentNumber}.pdf"`);
    
    // For now, return HTML content that frontend can convert to PDF
    // In a real application, you'd use a library like puppeteer to generate actual PDF
    res.send(htmlContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate document', error: error.message });
  }
};

// View document in browser
export const viewDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'renterId' },
          { path: 'productId' }
        ]
      });
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const booking = document.bookingId;
    const product = booking.productId;
    const user = booking.renterId;

    // Generate HTML content for viewing
    const htmlContent = generateDocumentHTML(document, booking, product, user);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to view document', error: error.message });
  }
};

// Get all documents
export const getAllDocuments = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const numericLimit = Math.min(Number(limit) || 20, 100);
    const numericPage = Math.max(Number(page) || 1, 1);
    
    const [documents, total] = await Promise.all([
      Document.find(filter)
        .populate('bookingId', 'startDate endDate status')
        .populate('items.productId', 'title')
        .sort({ scheduledDate: 1 })
        .limit(numericLimit)
        .skip((numericPage - 1) * numericLimit),
      Document.countDocuments(filter),
    ]);
    
    res.json({ 
      success: true, 
      documents, 
      pagination: { 
        page: numericPage, 
        limit: numericLimit, 
        total, 
        pages: Math.ceil(total / numericLimit) 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents', error: error.message });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('bookingId')
      .populate('items.productId');
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch document', error: error.message });
  }
};

// Update document status
export const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, condition, notes } = req.body;
    
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    // Update document status
    document.status = status || document.status;
    
    if (status === 'completed') {
      document.completedDate = new Date();
    }
    
    // Update item condition if provided
    if (condition && document.items.length > 0) {
      document.items[0].condition = condition;
    }
    
    // Update notes if provided
    if (notes) {
      document.notes = notes;
    }
    
    await document.save();
    
    // Update booking status based on document type and status
    if (status === 'completed') {
      const booking = await Booking.findById(document.bookingId);
      
      if (document.type === 'pickup') {
        await Booking.findByIdAndUpdate(document.bookingId, { pickupStatus: 'completed' });
        
        // If this is a pickup completion, create the return document
        if (booking && booking.returnStatus === 'pending') {
          await createReturnDocument(document.bookingId);
        }
      } else if (document.type === 'return') {
        await Booking.findByIdAndUpdate(document.bookingId, { 
          returnStatus: 'completed',
          status: 'completed'
        });
        
        // Update product availability after return
        if (booking && booking.productId) {
          // Mark the product as available again
          await Product.findByIdAndUpdate(booking.productId, {
            $set: { status: 'available' }
          });
        }
      }
    }
    
    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update document status', error: error.message });
  }
};