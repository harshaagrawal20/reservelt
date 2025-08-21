import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

const DeliveryManagement = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('delivery-schedule')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'

  const [deliveries, setDeliveries] = useState([
    {
      id: 1,
      orderId: 'R-2025-001',
      customer: 'John Smith',
      address: '123 Main St, Downtown, City 12345',
      phone: '(555) 123-4567',
      type: 'delivery',
      status: 'scheduled',
      timeSlot: '09:00 - 11:00',
      driver: 'Mike Johnson',
      vehicle: 'VAN-001',
      items: ['Professional Camera x2', 'Sound System x1', 'Lighting Kit x1'],
      priority: 'high',
      notes: 'Customer will be available at location'
    },
    {
      id: 2,
      orderId: 'R-2025-002',
      customer: 'Sarah Wilson',
      address: '456 Oak Avenue, Suburbs, City 12346',
      phone: '(555) 987-6543',
      type: 'pickup',
      status: 'in-progress',
      timeSlot: '11:00 - 13:00',
      driver: 'Tom Davis',
      vehicle: 'TRUCK-002',
      items: ['Party Tent x1', 'Tables & Chairs x8', 'DJ Equipment x1'],
      priority: 'medium',
      notes: 'Large items - need assistance'
    },
    {
      id: 3,
      orderId: 'R-2025-003',
      customer: 'Corporate Events Inc.',
      address: '789 Business Blvd, Commercial District, City 12347',
      phone: '(555) 456-7890',
      type: 'delivery',
      status: 'completed',
      timeSlot: '13:00 - 15:00',
      driver: 'Alex Brown',
      vehicle: 'VAN-003',
      items: ['Projector x2', 'Screen x2', 'Microphone System x1'],
      priority: 'low',
      notes: 'Delivered to reception desk'
    }
  ])

  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: 'Mike Johnson',
      vehicle: 'VAN-001',
      status: 'available',
      location: 'Warehouse',
      phone: '(555) 111-2222',
      currentDeliveries: 1
    },
    {
      id: 2,
      name: 'Tom Davis',
      vehicle: 'TRUCK-002',
      status: 'on-route',
      location: 'Downtown',
      phone: '(555) 333-4444',
      currentDeliveries: 1
    },
    {
      id: 3,
      name: 'Alex Brown',
      vehicle: 'VAN-003',
      status: 'available',
      location: 'Warehouse',
      phone: '(555) 555-6666',
      currentDeliveries: 0
    }
  ])

  const [newDelivery, setNewDelivery] = useState({
    orderId: '',
    customer: '',
    address: '',
    phone: '',
    type: 'delivery',
    date: '',
    timeSlot: '',
    driver: '',
    vehicle: '',
    priority: 'medium',
    notes: ''
  })

  const handleInputChange = (field, value) => {
    setNewDelivery(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleScheduleDelivery = () => {
    const delivery = {
      ...newDelivery,
      id: Date.now(),
      status: 'scheduled',
      items: ['Sample items'] // In real app, get from order
    }
    
    setDeliveries(prev => [...prev, delivery])
    setNewDelivery({
      orderId: '',
      customer: '',
      address: '',
      phone: '',
      type: 'delivery',
      date: '',
      timeSlot: '',
      driver: '',
      vehicle: '',
      priority: 'medium',
      notes: ''
    })
    alert('Delivery scheduled successfully!')
  }

  const updateDeliveryStatus = (deliveryId, newStatus) => {
    setDeliveries(prev => 
      prev.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, status: newStatus }
          : delivery
      )
    )
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDriverStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'on-route': return 'bg-blue-100 text-blue-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const tabs = [
    { id: 'delivery-schedule', label: 'Delivery Schedule', icon: '📅' },
    { id: 'drivers', label: 'Drivers', icon: '🚚' },
    { id: 'new-delivery', label: 'Schedule New', icon: '➕' },
    { id: 'routes', label: 'Route Planning', icon: '🗺️' }
  ]

  const renderDeliverySchedule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-midnight-800">Delivery Schedule</h3>
          <p className="text-navy-600">Manage deliveries and pickups</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          
          <div className="flex bg-purple-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-600'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map' ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-600'
              }`}
            >
              Map
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-lg border border-purple-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-midnight-800">
                      {delivery.type === 'delivery' ? '📦' : '📥'} {delivery.orderId}
                    </h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}>
                      {delivery.priority} priority
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-navy-700">Customer:</span>
                      <p className="text-navy-600">{delivery.customer}</p>
                    </div>
                    <div>
                      <span className="font-medium text-navy-700">Time Slot:</span>
                      <p className="text-navy-600">{delivery.timeSlot}</p>
                    </div>
                    <div>
                      <span className="font-medium text-navy-700">Driver:</span>
                      <p className="text-navy-600">{delivery.driver}</p>
                    </div>
                    <div>
                      <span className="font-medium text-navy-700">Vehicle:</span>
                      <p className="text-navy-600">{delivery.vehicle}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="font-medium text-navy-700">Address:</span>
                    <p className="text-navy-600">{delivery.address}</p>
                  </div>
                  
                  <div className="mt-3">
                    <span className="font-medium text-navy-700">Items:</span>
                    <p className="text-navy-600">{delivery.items.join(', ')}</p>
                  </div>
                  
                  {delivery.notes && (
                    <div className="mt-3">
                      <span className="font-medium text-navy-700">Notes:</span>
                      <p className="text-navy-600 italic">{delivery.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {delivery.status === 'scheduled' && (
                    <button
                      onClick={() => updateDeliveryStatus(delivery.id, 'in-progress')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Start
                    </button>
                  )}
                  {delivery.status === 'in-progress' && (
                    <button
                      onClick={() => updateDeliveryStatus(delivery.id, 'completed')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  <button className="px-3 py-1 border border-purple-200 text-purple-600 text-sm rounded hover:bg-purple-50 transition-colors">
                    Edit
                  </button>
                  <button className="px-3 py-1 border border-purple-200 text-purple-600 text-sm rounded hover:bg-purple-50 transition-colors">
                    Track
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-purple-200 p-6 h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-midnight-800 mb-2">Map View</h3>
            <p className="text-navy-600">Interactive map with delivery locations would be displayed here</p>
          </div>
        </div>
      )}
    </div>
  )

  const renderDrivers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-midnight-800">Driver Management</h3>
          <p className="text-navy-600">Monitor driver status and availability</p>
        </div>
        
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Add Driver
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <div key={driver.id} className="bg-white rounded-lg border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold">{driver.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-midnight-800">{driver.name}</h4>
                  <p className="text-sm text-navy-600">{driver.vehicle}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDriverStatusColor(driver.status)}`}>
                {driver.status}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-700">Location:</span>
                <span className="text-navy-600">{driver.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-700">Phone:</span>
                <span className="text-navy-600">{driver.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-700">Active Deliveries:</span>
                <span className="text-navy-600">{driver.currentDeliveries}</span>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 px-3 py-2 border border-purple-200 text-purple-600 text-sm rounded hover:bg-purple-50 transition-colors">
                Contact
              </button>
              <button className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                Assign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderNewDelivery = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-midnight-800 mb-2">Schedule New Delivery</h3>
        <p className="text-navy-600">Create a new delivery or pickup schedule</p>
      </div>

      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Order ID</label>
            <input
              type="text"
              value={newDelivery.orderId}
              onChange={(e) => handleInputChange('orderId', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="R-2025-XXX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Type</label>
            <select
              value={newDelivery.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="delivery">Delivery</option>
              <option value="pickup">Pickup</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Customer Name</label>
            <input
              type="text"
              value={newDelivery.customer}
              onChange={(e) => handleInputChange('customer', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Customer name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Phone</label>
            <input
              type="tel"
              value={newDelivery.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-navy-700 mb-2">Address</label>
            <textarea
              value={newDelivery.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Delivery/pickup address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Date</label>
            <input
              type="date"
              value={newDelivery.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Time Slot</label>
            <select
              value={newDelivery.timeSlot}
              onChange={(e) => handleInputChange('timeSlot', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select time slot</option>
              <option value="09:00 - 11:00">09:00 - 11:00</option>
              <option value="11:00 - 13:00">11:00 - 13:00</option>
              <option value="13:00 - 15:00">13:00 - 15:00</option>
              <option value="15:00 - 17:00">15:00 - 17:00</option>
              <option value="17:00 - 19:00">17:00 - 19:00</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Driver</label>
            <select
              value={newDelivery.driver}
              onChange={(e) => handleInputChange('driver', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select driver</option>
              {drivers.filter(d => d.status === 'available').map(driver => (
                <option key={driver.id} value={driver.name}>
                  {driver.name} - {driver.vehicle}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">Priority</label>
            <select
              value={newDelivery.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-navy-700 mb-2">Notes</label>
            <textarea
              value={newDelivery.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Special instructions or notes"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setNewDelivery({
              orderId: '', customer: '', address: '', phone: '', type: 'delivery',
              date: '', timeSlot: '', driver: '', vehicle: '', priority: 'medium', notes: ''
            })}
            className="px-6 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleScheduleDelivery}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Schedule Delivery
          </button>
        </div>
      </div>
    </div>
  )

  const renderRoutes = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-midnight-800 mb-2">Route Planning</h3>
        <p className="text-navy-600">Optimize delivery routes for efficiency</p>
      </div>

      <div className="bg-white rounded-lg border border-purple-200 p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-midnight-800 mb-2">Route Optimization</h3>
          <p className="text-navy-600">AI-powered route planning and optimization tools would be displayed here</p>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'delivery-schedule':
        return renderDeliverySchedule()
      case 'drivers':
        return renderDrivers()
      case 'new-delivery':
        return renderNewDelivery()
      case 'routes':
        return renderRoutes()
      default:
        return renderDeliverySchedule()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 via-purple-50 to-navy-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-purple-200">
          {/* Header */}
          <div className="border-b border-purple-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-midnight-800">Delivery Management</h1>
                <p className="text-navy-600 mt-2">Manage deliveries, pickups, and driver assignments</p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-navy-600">Scheduled: {deliveries.filter(d => d.status === 'scheduled').length}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-navy-600">In Progress: {deliveries.filter(d => d.status === 'in-progress').length}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-navy-600">Completed: {deliveries.filter(d => d.status === 'completed').length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-purple-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-navy-500 hover:text-navy-700 hover:border-navy-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryManagement
