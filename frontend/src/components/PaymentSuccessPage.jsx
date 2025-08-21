import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const bookingId = searchParams.get('bookingId')
  const invoiceId = searchParams.get('invoiceId')
  
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadInvoice = async () => {
    if (!invoiceId) {
      alert('Invoice not available for download')
      return
    }
    
    setIsDownloading(true)
    
    try {
      // Make API call to download invoice
      const response = await fetch(`http://localhost:3000/api/invoices/${invoiceId}/download`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }
      
      // Create blob from response
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      alert('Invoice downloaded successfully!')
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download invoice. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleViewInvoice = () => {
    if (invoiceId) {
      // Open invoice in new tab for viewing
      window.open(`http://localhost:3000/api/invoices/${invoiceId}/view`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-green-600 text-white p-6 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-green-100 mt-2">Your rental booking has been confirmed</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              What's Next?
            </h2>
            <p className="text-gray-600 text-sm">
              Your payment has been processed successfully. You can now download your invoice and the owner will be notified to prepare your rental item.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {invoiceId && (
              <>
                <button
                  onClick={handleDownloadInvoice}
                  disabled={isDownloading}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                    isDownloading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isDownloading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download Invoice
                    </div>
                  )}
                </button>

                <button
                  onClick={handleViewInvoice}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    View Invoice
                  </div>
                </button>
              </>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => navigate('/browse-products')}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Browse More Products
            </button>
          </div>

          {/* Important Notes */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Important Notes:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Keep your invoice for your records</li>
              <li>• The owner has been notified of your payment</li>
              <li>• You'll receive pickup/delivery instructions soon</li>
              <li>• Check your notifications for updates</li>
            </ul>
          </div>

          {/* Booking Details */}
          {bookingId && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Booking ID:</span> {bookingId}
              </p>
              {invoiceId && (
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">Invoice ID:</span> {invoiceId}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage
