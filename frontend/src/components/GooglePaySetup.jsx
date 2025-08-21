import React, { useState, useEffect } from 'react'

const GooglePaySetup = () => {
  const [isGooglePaySupported, setIsGooglePaySupported] = useState(false)
  const [browserInfo, setBrowserInfo] = useState('')

  useEffect(() => {
    // Check if Google Pay is supported
    const checkGooglePaySupport = () => {
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      const isAndroid = /Android/.test(navigator.userAgent)
      const isMobile = /Mobile/.test(navigator.userAgent)
      
      setBrowserInfo(`Browser: ${navigator.userAgent.split(' ')[0]} | Platform: ${navigator.platform}`)
      
      // Google Pay is typically supported on:
      // - Chrome browser (desktop and mobile)
      // - Android devices
      setIsGooglePaySupported(isChrome || isAndroid)
    }

    checkGooglePaySupport()
  }, [])

  return (
    <div className="p-4 border rounded-md bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Google Pay Integration</h3>
      </div>
      
      <div className="space-y-4">
        {/* Support Status */}
        <div className={`p-3 rounded-md ${isGooglePaySupported ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${isGooglePaySupported ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <span className={`text-sm font-medium ${isGooglePaySupported ? 'text-green-800' : 'text-yellow-800'}`}>
              {isGooglePaySupported ? '✅ Google Pay Supported' : '⚠️ Limited Google Pay Support'}
            </span>
          </div>
          <p className={`text-xs mt-1 ${isGooglePaySupported ? 'text-green-700' : 'text-yellow-700'}`}>
            {browserInfo}
          </p>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white p-4 rounded-md border">
          <h4 className="font-medium text-gray-800 mb-2">📱 Google Pay Setup for Testing</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium mr-2 mt-0.5">1</span>
              <div>
                <strong>Browser:</strong> Use Chrome browser (desktop or mobile) for best support
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium mr-2 mt-0.5">2</span>
              <div>
                <strong>Device:</strong> Android devices with Google Pay app work best
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium mr-2 mt-0.5">3</span>
              <div>
                <strong>Add Test Cards:</strong> Go to Google Pay and add these test cards:
                <ul className="ml-4 mt-1 text-xs">
                  <li>• Visa: 4242 4242 4242 4242</li>
                  <li>• Mastercard: 5555 5555 5555 4444</li>
                  <li>• Expiry: Any future date (12/28)</li>
                  <li>• CVC: Any 3 digits (123)</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium mr-2 mt-0.5">4</span>
              <div>
                <strong>Testing:</strong> Google Pay button will appear automatically during checkout if supported
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white p-4 rounded-md border">
          <h4 className="font-medium text-gray-800 mb-2">🚀 Google Pay Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>One-click payments</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>Secure tokenization</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>No card details entry</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>Mobile-optimized</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>Automatic currency support</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span>Multiple card support</span>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-gray-50 p-4 rounded-md border">
          <h4 className="font-medium text-gray-800 mb-2">🔧 Troubleshooting</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div><strong>Google Pay not showing?</strong></div>
            <ul className="ml-4 space-y-1 text-xs">
              <li>• Try Chrome browser instead</li>
              <li>• Ensure Google Pay is set up with test cards</li>
              <li>• Check if you're on a supported device</li>
              <li>• Clear browser cache and try again</li>
            </ul>
            <div className="mt-3"><strong>Payment failing?</strong></div>
            <ul className="ml-4 space-y-1 text-xs">
              <li>• Verify test cards are properly added to Google Pay</li>
              <li>• Ensure minimum amount (₹50) is met</li>
              <li>• Check network connection</li>
              <li>• Try manual card entry as fallback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GooglePaySetup
