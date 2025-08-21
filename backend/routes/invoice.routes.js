import express from 'express';
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  downloadInvoice,
  viewInvoice,
  downloadInvoicePDF,
  downloadPickupDocumentPDF,
  downloadRentalAgreementPDF
} from '../controllers/invoice.controller.js';

const router = express.Router();

router.post('/', createInvoice);
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.get('/:id/download', downloadInvoice);
router.get('/:id/view', viewInvoice);
router.get('/booking/:bookingId/pdf', downloadInvoicePDF);
router.get('/booking/:bookingId/pickup-document', downloadPickupDocumentPDF);
router.get('/booking/:bookingId/rental-agreement', downloadRentalAgreementPDF);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;