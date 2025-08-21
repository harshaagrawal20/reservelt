import express from 'express';
import {
  getAllDocuments,
  getDocumentById,
  downloadDocument,
  viewDocument,
  updateDocumentStatus
} from '../controllers/document.controller.js';
import { extractClerkId } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all documents (with optional filters)
router.get('/', extractClerkId, getAllDocuments);

// Get document by ID
router.get('/:id', extractClerkId, getDocumentById);

// Download document as PDF
router.get('/:id/download', extractClerkId, downloadDocument);

// View document in browser
router.get('/:id/view', extractClerkId, viewDocument);

// Update document status
router.patch('/:id/status', extractClerkId, updateDocumentStatus);

export default router;