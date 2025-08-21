import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { SuccessHandshake } from './HandshakeAnimation'

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    testimonials: false,
    stats: false
  })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)

  // Sample stats data
  const stats = [
    { number: '500+', label: 'Equipment Items' },
    { number: '1,200+', label: 'Happy Customers' },
    { number: '50+', label: 'Cities Covered' },
    { number: '24/7', label: 'Support Available' }
  ]

  // Enhanced equipment categories data
  const equipmentCategories = [
    {
      id: 1,
      name: 'Heavy Machinery',
      description: 'Excavators, Bulldozers, Cranes',
      icon: '🏗️',
      count: '150+',
      image: '/api/placeholder/400/300',
      color: 'from-emerald-400 to-emerald-600'
    },
    {
      id: 2,
      name: 'Construction Tools',
      description: 'Drills, Saws, Generators',
      icon: '🔧',
      count: '200+',
      image: '/api/placeholder/400/300',
      color: 'from-emerald-500 to-emerald-700'
    },
    {
      id: 3,
      name: 'Material Handling',
      description: 'Forklifts, Conveyors, Hoists',
      icon: '📦',
      count: '100+',
      image: '/api/placeholder/400/300',
      color: 'from-gray-500 to-gray-700'
    },
    {
      id: 4,
      name: 'Safety Equipment',
      description: 'Scaffolding, Barriers, Gear',
      icon: '🦺',
      count: '50+',
      image: '/api/placeholder/400/300',
      color: 'from-gray-600 to-gray-800'
    }
  ]

  // Popular equipment items
  const popularEquipment = [
    {
      id: 1,
      name: 'CAT 320 Excavator',
      category: 'Heavy Machinery',
      price: '₹1,200',
      period: '/day',
      rating: 4.9,
      reviews: 128,
      image: '/api/placeholder/300/200',
      available: true,
      features: ['GPS Tracking', 'Operator Included', 'Fuel Efficient']
    },
    {
      id: 2,
      name: 'JCB 3DX Backhoe',
      category: 'Heavy Machinery',
      price: '₹800',
      period: '/day',
      rating: 4.8,
      reviews: 95,
      image: '/api/placeholder/300/200',
      available: true,
      features: ['Versatile', 'Easy Operation', 'Low Maintenance']
    },
    {
      id: 3,
      name: 'Portable Generator 5KVA',
      category: 'Power Equipment',
      price: '₹200',
      period: '/day',
      rating: 4.7,
      reviews: 203,
      image: '/api/placeholder/300/200',
      available: false,
      features: ['Silent Operation', 'Fuel Efficient', 'Auto Start']
    }
  ]

  // Process steps
  const processSteps = [
    {
      step: '01',
      title: 'Browse & Select',
      description: 'Browse our extensive catalog and select the equipment you need',
      icon: '🔍'
    },
    {
      step: '02',
      title: 'Book Online',
      description: 'Complete your booking online with instant confirmation',
      icon: '📅'
    },
    {
      step: '03',
      title: 'Fast Delivery',
      description: 'Get your equipment delivered to your site on time',
      icon: '🚚'
    },
    {
      step: '04',
      title: 'Project Success',
      description: 'Complete your project with professional-grade equipment',
      icon: '✅'
    }
  ]

  // Testimonials data
  const testimonials = [
    {
      name: 'John Smith',
      role: 'Construction Manager at BuildCorp',
      content: 'Reservelt has transformed how we handle equipment rentals. The platform is intuitive and the equipment quality is outstanding.',
      avatar: '👨‍💼',
      rating: 5
    },
    {
      name: 'Sarah Johnson',
      role: 'Project Director at InfraTech',
      content: 'Exceptional service and reliability. We\'ve been using Reservelt for 2 years and have never been disappointed.',
      avatar: '👩‍💼',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Operations Lead at PowerBuild',
      content: 'The real-time tracking and quick booking features have saved us countless hours. Highly recommended!',
      avatar: '👨‍🔧',
      rating: 5
    }
  ]

  // Auto-slide testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  // Mouse movement tracking for smooth cursor interactions
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Smooth scroll tracking for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Enhanced intersection observer for smooth animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            setIsVisible(prev => ({ ...prev, [id]: true }))
            
            // Add smooth stagger animation to children
            const children = entry.target.querySelectorAll('.stagger-item')
            children.forEach((child, index) => {
              child.style.setProperty('--stagger', index)
              child.classList.add('animate-fade-in-up')
            })
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    const elements = document.querySelectorAll('[id]')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // Smooth magnetic effect for interactive elements
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (mousePosition.x - centerX) * 0.1
    const deltaY = (mousePosition.y - centerY) * 0.1
    
    e.currentTarget.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`
  }

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translate(0px, 0px) scale(1)'
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-emerald-50 via-white to-gray-50 overflow-hidden">
        {/* Animated Background with Parallax */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div 
              className="absolute top-10 right-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob parallax"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            ></div>
            <div 
              className="absolute top-20 left-20 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000 parallax"
              style={{ transform: `translateY(${scrollY * 0.15}px)` }}
            ></div>
            <div 
              className="absolute bottom-20 left-1/3 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 parallax"
              style={{ transform: `translateY(${scrollY * 0.05}px)` }}
            ></div>
            <div 
              className="absolute bottom-10 right-1/4 w-64 h-64 bg-gray-100 rounded-full mix-blend-multiply filter blur-xl opacity-35 animate-blob animation-delay-6000 parallax"
              style={{ transform: `translateY(${scrollY * 0.2}px)` }}
            ></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 stagger-children">
              <div className="space-y-6">
               
                <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight stagger-item">
                  Bringing Creative
                  <span className="block bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent animate-gradient-x">
                    Equipment Rentals
                  </span>
                  <span className="block text-5xl md:text-6xl text-gray-700">into life</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg stagger-item">
                  When it comes to heavy equipment hiring, Reservelt 
                  covers everything from excavators to the latest 
                  and greatest design trends.
                </p>
              </div>
              
              <div className="flex items-center space-x-6 stagger-item">
                <SignedOut>
                  <Link
                    to="/sign-up"
                    className="inline-flex items-center px-8 py-4 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl magnetic-btn ripple"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <span>Start Here</span>
                    <svg className="w-5 h-5 ml-2 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-8 py-4 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl magnetic-btn ripple"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <span>Go to Dashboard</span>
                    <svg className="w-5 h-5 ml-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </SignedIn>
                <div className="flex flex-col transition-all duration-300 hover:transform hover:scale-105">
                  <span className="text-sm text-gray-500">Explore More</span>
                  <span className="text-lg font-semibold text-gray-900">Trending</span>
                </div>
              </div>

              {/* Stats with enhanced animations */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 stagger-item">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="text-center hover-lift cursor-pointer"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="text-3xl font-bold text-emerald-600 animate-pulse-soft">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hero Image Section with enhanced animations */}
            <div className="relative lg:pl-16 stagger-item">
              {/* Main Equipment Showcase */}
              <div className="relative">
                {/* Background Card with parallax */}
                <div 
                  className="absolute inset-0 bg-white rounded-3xl shadow-2xl transform rotate-3 transition-all duration-500 hover:rotate-6"
                  style={{ transform: `rotate(3deg) translateY(${scrollY * 0.02}px)` }}
                ></div>
                <div className="relative bg-gradient-to-br from-white via-emerald-50 to-gray-50  shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-700 hover:scale-105 group border-4 border-emerald-200" style={{ padding: '3cm' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-gray-400/20 animate-pulse"></div>
                  <div className="relative text-center">
                    <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600 to-gray-600  blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                      <SuccessHandshake width={250} height={250} showText={false} />
                    </div>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                      <p className="text-emerald-600 font-bold text-lg">Ready to Deal!</p>
                    </div>
                  </div>
                </div>
              </div>
              
             
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Categories Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
              🔧 Browse by Category
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Find the Right Equipment
              <span className="block text-emerald-600">for Your Project</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From heavy machinery to specialized tools, we have everything you need to complete your project successfully
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {equipmentCategories.map((category, index) => (
              <div
                key={category.id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-white text-2xl`}>
                      {category.icon}
                    </div>
                    <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-sm font-medium">
                      {category.count}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                    <span>Explore Now</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl magnetic-btn"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span>View All Equipment</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

     

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
              📋 Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your equipment in 4 simple steps and start your project today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div
                key={index}
                className="relative text-center group"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Connection Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-emerald-200 to-gray-200 transform translate-x-4"></div>
                )}
                
                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center mb-6 group-hover:shadow-xl transition-all duration-300 hover-lift">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-gray-500 rounded-full flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <SignedOut>
              <Link
                to="/sign-up"
                className="inline-flex items-center px-8 py-4 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl magnetic-btn"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span>Get Started Today</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl magnetic-btn"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span>Browse Equipment</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
              ⚡ Why Choose Reservelt?
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Premium Equipment
              <span className="block bg-gradient-to-r from-emerald-600 to-gray-800 bg-clip-text text-transparent">
                Rental Experience
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide comprehensive equipment rental solutions with cutting-edge technology, 
              ensuring your projects run smoothly and efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 - Quick Booking */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover-lift cursor-pointer"
                 onMouseEnter={handleMouseEnter}
                 onMouseLeave={handleMouseLeave}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-gray-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">Quick Booking</h3>
                <p className="text-gray-600 leading-relaxed mb-4">Book equipment instantly with our streamlined process. Search, select, and confirm in under 3 minutes.</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Instant availability check</li>
                  <li>• Real-time pricing</li>
                  <li>• Quick confirmation</li>
                </ul>
              </div>
            </div>

            {/* Feature 2 - Real-time Tracking */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover-lift cursor-pointer"
                 onMouseEnter={handleMouseEnter}
                 onMouseLeave={handleMouseLeave}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">Real-time Tracking</h3>
                <p className="text-gray-600 leading-relaxed mb-4">Track your equipment status and location in real-time with our advanced GPS monitoring system.</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Live GPS tracking</li>
                  <li>• Usage monitoring</li>
                  <li>• Maintenance alerts</li>
                </ul>
              </div>
            </div>

            {/* Feature 3 - Insured Equipment */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover-lift cursor-pointer"
                 onMouseEnter={handleMouseEnter}
                 onMouseLeave={handleMouseLeave}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">Insured Equipment</h3>
                <p className="text-gray-600 leading-relaxed mb-4">All equipment comes with comprehensive insurance coverage for your peace of mind.</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Full damage coverage</li>
                  <li>• Theft protection</li>
                  <li>• 24/7 claim support</li>
                </ul>
              </div>
            </div>

            {/* Feature 4 - Fast Delivery */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover-lift cursor-pointer"
                 onMouseEnter={handleMouseEnter}
                 onMouseLeave={handleMouseLeave}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">Fast Delivery</h3>
                <p className="text-gray-600 leading-relaxed mb-4">Same-day delivery available for urgent requirements across 50+ cities.</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Same-day delivery</li>
                  <li>• Nationwide coverage</li>
                  <li>• Emergency support</li>
                </ul>
              </div>
            </div>

            {/* Feature 5 - Professional Support */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover-lift cursor-pointer"
                 onMouseEnter={handleMouseEnter}
                 onMouseLeave={handleMouseLeave}>
              <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">👨‍🔧</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">Expert Support</h3>
                <p className="text-gray-600 leading-relaxed mb-4">Get professional guidance from our experienced team of equipment specialists.</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Equipment training</li>
                  <li>• Technical support</li>
                  <li>• Maintenance guidance</li>
                </ul>
              </div>
            </div>

            {/* Feature 6 - Flexible Pricing */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover-lift cursor-pointer"
                 onMouseEnter={handleMouseEnter}
                 onMouseLeave={handleMouseLeave}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-gray-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">Flexible Pricing</h3>
                <p className="text-gray-600 leading-relaxed mb-4">Transparent pricing with flexible rental periods to suit your project timeline and budget.</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Hourly to monthly rates</li>
                  <li>• Volume discounts</li>
                  <li>• No hidden fees</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Industry Leaders</h3>
              <p className="text-xl text-emerald-100">Join thousands of satisfied customers across the country</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="hover-lift cursor-pointer transition-all duration-300"
                  style={{ animationDelay: `${index * 200}ms` }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 animate-pulse-soft">
                    {stat.number}
                  </div>
                  <div className="text-emerald-100 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
              💬 What Our Clients Say
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Success Stories
              <span className="block bg-gradient-to-r from-emerald-600 to-gray-800 bg-clip-text text-transparent">
                From Our Customers
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Don't just take our word for it. Here's what our satisfied customers have to say about our services.
            </p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 md:p-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-8">
                  {testimonials[currentSlide].avatar}
                </div>
                <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed mb-10 italic font-light">
                  "{testimonials[currentSlide].content}"
                </p>
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-amber-400 fill-current mx-1" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <h4 className="text-xl font-bold text-gray-900">{testimonials[currentSlide].name}</h4>
                <p className="text-gray-600">{testimonials[currentSlide].role}</p>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-emerald-500 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-emerald-200 rounded-full opacity-60"></div>
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-gray-200 rounded-full opacity-40"></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-500 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 right-10 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-10 animate-blob"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-overlay filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gray-200 rounded-full mix-blend-overlay filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
               Ready to Get Started?
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Your Projects
              <span className="block">with Premium Equipment</span>
            </h2>
            <p className="text-xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied customers who trust Reservelt for their equipment needs. 
              Get started today and experience the difference professional-grade equipment makes.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <SignedOut>
                <Link
                  to="/sign-up"
                  className="inline-flex items-center px-10 py-5 bg-white text-emerald-600 rounded-full hover:shadow-2xl transition-all duration-300 font-bold text-lg group"
                >
                  <span>Start Free Trial</span>
                  <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-10 py-5 bg-white text-emerald-600 rounded-full hover:shadow-2xl transition-all duration-300 font-bold text-lg group"
                >
                  <span>Go to Dashboard</span>
                  <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </SignedIn>
              <button className="inline-flex items-center px-10 py-5 border-2 border-white text-white rounded-full hover:bg-white hover:text-emerald-600 transition-all duration-300 font-bold text-lg">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <span className="text-3xl font-bold">Reservelt</span>
              </div>
              <p className="text-gray-300 mb-8 max-w-md text-lg leading-relaxed">
                Your trusted partner for premium equipment rental solutions. 
                Quality equipment, professional service, and nationwide coverage for all your project needs.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition-colors group">
                  <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition-colors group">
                  <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition-colors group">
                  <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6 text-emerald-400">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-300 hover:text-emerald-400 transition-colors text-lg">Features</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-emerald-400 transition-colors text-lg">About Us</a></li>
                <li><a href="#testimonials" className="text-gray-300 hover:text-emerald-400 transition-colors text-lg">Testimonials</a></li>
                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors text-lg">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6 text-emerald-400">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors text-lg">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors text-lg">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors text-lg">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors text-lg">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-16 pt-8 text-center">
            <p className="text-gray-400 text-lg">
              © 2024 Reservelt. All rights reserved. | Built with ❤️ for the rental industry.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
