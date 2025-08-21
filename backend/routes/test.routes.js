import express from 'express';
import { createInvoiceForBooking, downloadInvoice } from '../controllers/invoice.controller.js';
import { createPickupDocument, createReturnDocument, downloadDocument } from '../controllers/document.controller.js';
import { generateRentalAgreement, createPickupDocument as serviceCreatePickupDocument, createReturnDocument as serviceCreateReturnDocument } from '../services/document.service.js';

const router = express.Router();

// Test route for invoice generation
router.post('/generate-invoice/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const invoice = await createInvoiceForBooking(bookingId);
    res.status(200).json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate invoice'
    });
  }
});

// Test route for invoice download
router.get('/download-invoice/:invoiceId', async (req, res) => {
  try {
    await downloadInvoice(req, res);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to download invoice'
    });
  }
});

// Test route for pickup document generation
router.post('/generate-pickup-document/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const document = await serviceCreatePickupDocument(bookingId);
    res.status(200).json({
      success: true,
      message: 'Pickup document generated successfully',
      data: document
    });
  } catch (error) {
    console.error('Error generating pickup document:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate pickup document'
    });
  }
});

// Test route for return document generation
router.post('/generate-return-document/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const document = await serviceCreateReturnDocument(bookingId);
    res.status(200).json({
      success: true,
      message: 'Return document generated successfully',
      data: document
    });
  } catch (error) {
    console.error('Error generating return document:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate return document'
    });
  }
});

// Generate and download a rental agreement
router.get('/generate-rental-agreement/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const document = await generateRentalAgreement(bookingId);
    
    // Save the document to the database if it doesn't exist yet
    let savedDocument = await Document.findOne({ 
      bookingId, 
      type: 'agreement' 
    });
    
    if (!savedDocument) {
      savedDocument = await Document.create(document);
    }
    
    res.json({ success: true, document: savedDocument });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test route for document download
router.get('/download-document/:documentId', async (req, res) => {
  try {
    await downloadDocument(req, res);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to download document'
    });
  }
});

export default router;