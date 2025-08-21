import Report from '../models/report.model.js';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';

// Example CRUD endpoints (add your own as needed)
export const getAllReports = async (req, res) => {
  try {
    const { clerkId, role, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (clerkId) {
      // If role=renter, filter by reports created by that renter (reportedBy via bookings)
      // For simplicity, we filter by reportedBy via User clerkId lookup on client; here we only support bookings pre-linked
      // Leaving as no-op for clerkId unless we expand schema; reports still accessible globally.
    }

    const numericLimit = Math.min(Number(limit) || 20, 100);
    const numericPage = Math.max(Number(page) || 1, 1);

    const [reports, total] = await Promise.all([
      Report.find(filter).sort({ createdAt: -1 }).limit(numericLimit).skip((numericPage - 1) * numericLimit),
      Report.countDocuments(filter),
    ]);

    res.json({ success: true, reports, pagination: { page: numericPage, limit: numericLimit, total, pages: Math.ceil(total / numericLimit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports', error: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch report', error: error.message });
  }
};

export const createReport = async (req, res) => {
  try {
    const report = await Report.create(req.body);
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create report', error: error.message });
  }
};

export const updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.reportId, req.body, { new: true });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update report', error: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.reportId);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete report', error: error.message });
  }
};

export const exportReportsCSV = async (req, res) => {
  try {
    const reports = await Report.find().lean();
    const parser = new Parser();
    const csv = parser.parse(reports);
    res.header('Content-Type', 'text/csv');
    res.attachment('reports.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export CSV', error: error.message });
  }
};

export const exportReportsXLSX = async (req, res) => {
  try {
    const reports = await Report.find().lean();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reports');
    worksheet.columns = Object.keys(reports[0] || {}).map(key => ({ header: key, key }));
    worksheet.addRows(reports);
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('reports.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export XLSX', error: error.message });
  }
};
