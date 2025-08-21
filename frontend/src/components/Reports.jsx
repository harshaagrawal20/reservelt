import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import { useUser } from '@clerk/clerk-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const Reports = () => {
  const { user } = useUser()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`${API_BASE_URL}/reports`)
        if (!res.ok) throw new Error('Failed to fetch reports')
        const data = await res.json()
        if (!cancelled) setReports(data.reports || [])
      } catch (e) {
        if (!cancelled) setError('Failed to load reports')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200 p-8">
          <h1 className="text-3xl font-bold text-midnight-800 mb-6">Reports & Analytics</h1>
          {loading && <div className="text-navy-600">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-navy-600 border-b">
                    <th className="py-2 pr-4">Report</th>
                    <th className="py-2 pr-4">Reason</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r._id} className="border-b">
                      <td className="py-2 pr-4 font-mono">{r._id.slice(-6)}</td>
                      <td className="py-2 pr-4">{r.reason}</td>
                      <td className="py-2 pr-4 capitalize">{r.status}</td>
                      <td className="py-2 pr-4">{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
