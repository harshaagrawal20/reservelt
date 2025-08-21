# Document Generation Test Page

## Overview
This test page provides a simple interface to test the generation and download of various documents in the Rental Management System:
- Invoices
- Rental Agreements
- Pickup Documents
- Return Documents

## How to Use

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Access the test page at:
   ```
   http://localhost:3000/test-documents
   ```

3. For each document type:
   - Enter a valid booking ID in the input field
   - Click the "Generate" button
   - If successful, a "Download" button will appear
   - Click the "Download" button to download the PDF document

## API Endpoints

The test page uses the following API endpoints:

### Invoice Generation
- **POST** `/api/test/generate-invoice/:bookingId` - Generate an invoice for a booking
- **GET** `/api/test/download-invoice/:invoiceId` - Download an invoice as PDF

### Rental Agreement Generation
- **POST** `/api/test/generate-rental-agreement/:bookingId` - Generate a rental agreement for a booking

### Pickup Document Generation
- **POST** `/api/test/generate-pickup-document/:bookingId` - Generate a pickup document for a booking

### Return Document Generation
- **POST** `/api/test/generate-return-document/:bookingId` - Generate a return document for a booking

### Document Download
- **GET** `/api/test/download-document/:documentId` - Download any document as PDF

## Troubleshooting

- If you encounter errors, check the browser console for detailed error messages
- Ensure you're using a valid booking ID that exists in the database
- For pickup and return documents, the booking must be in the appropriate status