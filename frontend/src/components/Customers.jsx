import React from 'react'
import Navbar from './Navbar'

const Customers = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-8 text-center">
          <h1 className="text-3xl font-bold text-midnight-800 mb-4">Customer Management</h1>
          <p className="text-navy-600 mb-6">Manage customer information and rental history</p>
          <div className="w-16 h-16 bg-beige-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <p className="text-navy-500">Coming Soon...</p>
        </div>
      </div>
    </div>
  )
}

export default Customers
