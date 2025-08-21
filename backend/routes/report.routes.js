import express from 'express';
import {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  exportReportsCSV,
  exportReportsXLSX
} from '../controllers/report.controller.js';

const router = express.Router();

router.get('/', getAllReports);
router.get('/:reportId', getReportById);
router.post('/', createReport);
router.put('/:reportId', updateReport);
router.delete('/:reportId', deleteReport);
router.get('/export/csv', exportReportsCSV);
router.get('/export/xlsx', exportReportsXLSX);

export default router;
