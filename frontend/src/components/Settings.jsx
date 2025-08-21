import React, { useState, useRef, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import Navbar from './Navbar'

const Settings = () => {
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const [activeSection, setActiveSection] = useState(null)
  const [showChatbot, setShowChatbot] = useState(false)
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef(null)

  // Focus input when chatbot opens
  useEffect(() => {
    if (showChatbot && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus()
      }, 100)
    }
  }, [showChatbot])

  // Enhanced chatbot responses with more comprehensive content
  const botResponses = {
    'hello': 'Hello! Welcome to our customer support. I\'m here to help you 24/7. You can ask me about bookings, payments, account issues, property details, or anything else!',
    'hi': 'Hi there! 👋 How can I assist you today? I can help with login problems, booking modifications, payment issues, refunds, and much more!',
    'help': 'I\'m here to help! I can assist you with:\n• 🔐 Login & Password Issues\n• 📅 Booking Management\n• 💳 Payment Problems\n• 🔄 Cancellations & Refunds\n• 🏠 Property Questions\n• ⚙️ Account Settings\n• 📞 Contact Information\n\nWhat would you like help with?',
    'login': 'Having trouble logging in? Here are some solutions:\n\n1️⃣ **Forgot Password**: Click "Forgot Password" on the login page\n2️⃣ **Check Email**: Look for reset email in spam/junk folder\n3️⃣ **Clear Cache**: Clear your browser cache and cookies\n4️⃣ **Try Different Browser**: Sometimes browser issues cause problems\n\nIf none of these work, I can connect you with an agent!',
    'password': 'Password issues? Here\'s how to fix them:\n\n🔑 **Reset Password**:\n• Go to login page → "Forgot Password"\n• Enter your email address\n• Check email for reset link (check spam too!)\n• Create new strong password\n\n💡 **Password Tips**:\n• Use 8+ characters\n• Mix letters, numbers & symbols\n• Don\'t reuse old passwords',
    'booking': 'Booking questions? I can help! 📅\n\n**View Bookings**: Go to "Orders" section in your account\n**Modify Booking**: Click on booking → "Modify Reservation"\n**Cancel Booking**: Find booking → "Cancel" (refund policy applies)\n**Add Services**: Some properties allow additional services\n**Check-in Info**: Details sent 24hrs before arrival\n\nNeed help with a specific booking? Share your booking ID!',
    'payment': 'Payment troubles? Let\'s solve this! 💳\n\n**Common Issues**:\n• ❌ Card declined → Check card details & limits\n• 🏦 Bank block → Contact your bank\n• 💰 Insufficient funds → Check account balance\n• 🌐 International card → Enable international transactions\n\n**Payment Methods**: We accept Visa, MasterCard, PayPal, Bank Transfer\n**Security**: All payments are SSL encrypted and secure',
    'cancel': 'Need to cancel? Here\'s the process: 🔄\n\n**Cancellation Steps**:\n1️⃣ Go to "Orders" in your account\n2️⃣ Find your booking\n3️⃣ Click "Cancel Booking"\n4️⃣ Select cancellation reason\n5️⃣ Confirm cancellation\n\n**Refund Timeline**:\n• Free cancellation: Full refund\n• Moderate policy: 50% refund\n• Strict policy: No refund\n• Processing time: 3-7 business days',
    'refund': 'Refund information: 💰\n\n**Refund Process**:\n• ⏱️ Processing: 3-7 business days\n• 💳 Credit card: 5-10 business days\n• 🏦 Bank transfer: 2-5 business days\n• 📧 Confirmation email sent when processed\n\n**Refund Policies**:\n• Free: 100% refund (cancel 24hrs+ before)\n• Moderate: 50% refund (cancel 5+ days before)\n• Strict: Limited/No refund\n\n**Track Status**: Check "Orders" → "Refund Status"',
    'property': 'Property questions? I can help! 🏠\n\n**Property Info**:\n• 📋 Full details on property page\n• 📷 High-quality photos & virtual tours\n• 📍 Exact location & neighborhood info\n• 🛏️ Room layouts & amenities\n• 📞 Direct contact with property owner\n\n**Common Questions**:\n• Check-in/out times\n• WiFi availability\n• Parking options\n• Pet policies\n• Local attractions',
    'account': 'Account management made easy! ⚙️\n\n**Your Account Includes**:\n• 👤 Personal information\n• 📧 Email preferences\n• 🔔 Notification settings\n• 💳 Payment methods\n• 📱 Two-factor authentication\n• 📄 Booking history\n• ⭐ Reviews & ratings\n\n**Quick Actions**:\n• Update profile info\n• Change password\n• Manage privacy settings\n• Download booking receipts',
    'contact': 'Multiple ways to reach us! 📞\n\n**Contact Options**:\n• 💬 Live chat (fastest - right here!)\n• 📧 Email: support@rental.com\n• 📱 Phone: 1-800-RENTAL (24/7)\n• 📍 Office hours: 9 AM - 6 PM EST\n\n**Response Times**:\n• Chat: Instant\n• Email: 2-4 hours\n• Phone: Immediate\n\n**Emergency Support**: Available 24/7 for urgent issues!',
    'hours': 'We\'re here when you need us! ⏰\n\n**Support Hours**:\n• 💬 Live Chat: 24/7 (AI + Human agents)\n• 📞 Phone Support: 24/7\n• 📧 Email: Responses within 2-4 hours\n• 🌍 Global support in multiple languages\n\n**Peak Hours**: 9 AM - 6 PM EST (faster response)\n**Off Hours**: AI assistance + emergency human support',
    'language': 'We speak your language! 🌍\n\n**Supported Languages**:\n• 🇺🇸 English\n• 🇪🇸 Spanish\n• 🇫🇷 French\n• 🇩🇪 German\n• 🇮🇹 Italian\n• 🇵🇹 Portuguese\n• 🇯🇵 Japanese\n• 🇰🇷 Korean\n• 🇨🇳 Chinese\n\nTo switch language, go to Settings → Language Preferences',
    'security': 'Your security is our priority! 🔒\n\n**Security Measures**:\n• 🛡️ SSL encryption for all data\n• 🔐 Two-factor authentication\n• 💳 PCI DSS compliant payments\n• 🔍 Fraud detection systems\n• 📱 Secure mobile app\n\n**Stay Safe**:\n• Never share login details\n• Use strong, unique passwords\n• Enable 2FA in account settings\n• Log out on shared devices',
    'app': 'Download our mobile app! 📱\n\n**App Features**:\n• 📅 Manage bookings on-the-go\n• 🔔 Real-time notifications\n• 📍 GPS navigation to properties\n• 💬 In-app messaging with hosts\n• 📷 Photo check-in/out\n• ⭐ Leave reviews instantly\n\n**Download**:\n• 🍎 iOS App Store\n• 🤖 Google Play Store\n• 🔄 Auto-sync with web account',
    'policy': 'Our policies explained: 📋\n\n**Key Policies**:\n• 🔄 Cancellation: Varies by property\n• 🏠 House rules: Set by property owners\n• 💰 Payment: Secure & flexible options\n• 🛡️ Insurance: Optional coverage available\n• ⭐ Reviews: Fair & transparent system\n\n**Full Details**: Available in your account under "Legal & Policies"',
    'emergency': '🚨 Emergency Support Available!\n\nFor urgent issues:\n• 📞 Call: 1-800-EMERGENCY\n• 💬 Type "URGENT" here for priority\n• 📧 Email: emergency@rental.com\n\n**Emergency Issues**:\n• Property access problems\n• Safety concerns\n• Payment emergencies\n• Travel disruptions\n\nWe\'re here 24/7 for urgent matters!',
    'default': 'I understand you need help, but I\'m not sure about the specifics of your question. 🤔\n\nHere are some options:\n• Try rephrasing your question\n• Ask about: login, booking, payment, refund, property, account\n• Type "help" to see all topics I can assist with\n\nOr I can connect you with a human agent who can provide personalized assistance!'
  }

  const handleYourAccount = () => {
    try {
      // Open Clerk's user profile management modal
      openUserProfile()
    } catch (error) {
      console.error('Error opening user profile:', error)
      // Fallback: show alert with account info
      alert(`Account Management\n\nUser: ${user?.emailAddresses?.[0]?.emailAddress || 'Not logged in'}\n\nOpening account management...`)
    }
  }

  const handleCustomerService = () => {
    setShowChatbot(true)
    if (messages.length === 0) {
      setMessages([
        {
          type: 'bot',
          text: 'Hello! 👋 Welcome to our 24/7 customer support!\n\nI\'m your AI assistant and I can help you with:\n\n🔐 Login & Password Issues\n📅 Booking Management\n💳 Payment & Billing\n🔄 Cancellations & Refunds\n🏠 Property Information\n⚙️ Account Settings\n🚨 Emergency Support\n\nWhat can I help you with today? You can type your question or use one of the quick options below!',
          timestamp: new Date()
        },
        {
          type: 'bot',
          text: 'Quick Help Options:\n• Type "help" for full menu\n• Type "booking" for reservation help\n• Type "payment" for billing issues\n• Type "emergency" for urgent matters\n\nOr just describe your issue in your own words! 😊',
          timestamp: new Date()
        }
      ])
    }
  }

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        // Use Clerk's sign out function
        signOut(() => {
          // Redirect to home page after sign out
          window.location.href = '/'
        })
      } catch (error) {
        console.error('Error signing out:', error)
        alert('There was an error signing out. Please try again.')
      }
    }
  }

  const sendMessage = () => {
    if (!userInput.trim() || isTyping) return

    const newUserMessage = {
      type: 'user',
      text: userInput,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMessage])
    setUserInput('')
    setIsTyping(true)

    // Keep focus on input after sending
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 50)

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(userInput.toLowerCase())
      const newBotMessage = {
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newBotMessage])
      setIsTyping(false)
      
      // Refocus input after bot response
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }, 1500)
  }

  const generateBotResponse = (input) => {
    // Normalize input for better matching
    const normalizedInput = input.toLowerCase().trim()
    
    // Handle greetings
    if (normalizedInput.includes('hello') || normalizedInput.includes('hi') || normalizedInput.includes('hey')) {
      return botResponses.hello
    }
    
    // Handle help requests
    if (normalizedInput.includes('help') || normalizedInput.includes('menu') || normalizedInput.includes('options')) {
      return botResponses.help
    }
    
    // Handle emergency requests
    if (normalizedInput.includes('emergency') || normalizedInput.includes('urgent') || normalizedInput.includes('immediate')) {
      return botResponses.emergency
    }
    
    // Handle multiple keyword combinations
    if (normalizedInput.includes('forgot') && normalizedInput.includes('password')) {
      return botResponses.password
    }
    
    if (normalizedInput.includes('can\'t') && normalizedInput.includes('login')) {
      return botResponses.login
    }
    
    // Check for main keywords
    const keywords = ['login', 'password', 'booking', 'payment', 'cancel', 'refund', 'property', 'account', 'contact', 'hours', 'language', 'security', 'app', 'policy']
    
    for (const keyword of keywords) {
      if (normalizedInput.includes(keyword)) {
        return botResponses[keyword]
      }
    }
    
    // Handle booking related terms
    if (normalizedInput.includes('reservation') || normalizedInput.includes('book') || normalizedInput.includes('checkin') || normalizedInput.includes('checkout')) {
      return botResponses.booking
    }
    
    // Handle payment related terms
    if (normalizedInput.includes('pay') || normalizedInput.includes('card') || normalizedInput.includes('billing') || normalizedInput.includes('charge')) {
      return botResponses.payment
    }
    
    // Handle cancellation related terms
    if (normalizedInput.includes('cancel') || normalizedInput.includes('modify') || normalizedInput.includes('change')) {
      return botResponses.cancel
    }
    
    // If no keyword matches, return default response to connect to agent
    return botResponses.default
  }

  const connectToAgent = () => {
    const agentMessage = {
      type: 'system',
      text: '🔄 Connecting you to a human agent... Please wait while we find an available agent to assist you.',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, agentMessage])
    
    setTimeout(() => {
      const agentConnectedMessage = {
        type: 'agent',
        text: 'Hello! 👨‍💻 I\'m Sarah, a customer service agent. I\'ve reviewed your conversation and I\'m here to help. How can I assist you today?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, agentConnectedMessage])
    }, 3000)
  }

  const sendQuickResponse = (topic) => {
    const quickMessage = {
      type: 'user',
      text: topic,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, quickMessage])
    
    setTimeout(() => {
      const botResponse = generateBotResponse(topic.toLowerCase())
      const newBotMessage = {
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newBotMessage])
    }, 500)
  }

  const ChatbotModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <span className="text-xl">🤖</span>
            <div>
              <h3 className="font-semibold">Customer Support</h3>
              <p className="text-xs text-blue-100">AI Assistant • Available 24/7</p>
            </div>
          </div>
          <button 
            onClick={() => setShowChatbot(false)}
            className="text-white hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Quick Action Buttons */}
        {messages.length <= 2 && (
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Quick Help:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '🔐 Login Help', value: 'login' },
                { label: '📅 Booking', value: 'booking' },
                { label: '💳 Payment', value: 'payment' },
                { label: '🔄 Refund', value: 'refund' },
                { label: '🚨 Emergency', value: 'emergency' }
              ].map((btn, index) => (
                <button
                  key={index}
                  onClick={() => sendQuickResponse(btn.value)}
                  className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-all"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-xl shadow-sm ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-md' 
                  : message.type === 'agent'
                  ? 'bg-green-500 text-white rounded-bl-md'
                  : message.type === 'system'
                  ? 'bg-yellow-100 text-gray-800 border border-yellow-300 rounded-bl-md'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
              }`}>
                {message.type === 'bot' && <span className="text-sm mr-1">🤖</span>}
                {message.type === 'agent' && <span className="text-sm mr-1">👨‍💻</span>}
                <div className="text-sm whitespace-pre-line">{message.text}</div>
                {message.text === botResponses.default && (
                  <button 
                    onClick={connectToAgent}
                    className="block mt-3 w-full text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all"
                  >
                    🔗 Connect to Human Agent
                  </button>
                )}
                <div className={`text-xs mt-1 opacity-70 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">🤖</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
          <div className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              autoFocus
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !userInput.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
            >
              <span className="text-lg">📤</span>
            </button>
          </div>
          <div className="flex justify-center mt-2">
            <p className="text-xs text-gray-500">Powered by AI • Available 24/7 • Secure & Private</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            {/* Logo Section */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-3">
                <img 
                  src="/thu umage.png" 
                  alt="Company Logo"
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    // Fallback to existing image.png if thu umage.png doesn't exist
                    e.target.src = "/image.png"
                  }}
                />
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-800">Rental Management</h2>
                  <p className="text-xs text-gray-500">Your trusted partner</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Help & Settings</h1>
                {user && (
                  <p className="text-sm text-gray-600 mt-1">
                    Welcome, {user.firstName || user.emailAddresses?.[0]?.emailAddress || 'User'}
                  </p>
                )}
              </div>
              {user?.imageUrl && (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                  <img 
                    src={user.imageUrl} 
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="divide-y divide-gray-200">
            
            {!user ? (
              /* Not Logged In Section */
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-3xl">👤</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Not Logged In</h3>
                <p className="text-sm text-gray-500 mb-6">Please sign in to access your account settings and full features</p>
                <div className="space-y-3">
                  <button 
                    onClick={() => window.location.href = '/sign-in'}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                  >
                    Sign In to Your Account
                  </button>
                  <button 
                    onClick={() => window.location.href = '/sign-up'}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Create New Account
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Your Account */}
                <div 
                  onClick={handleYourAccount}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-lg">👤</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 group-hover:text-blue-600">Your Account</h3>
                      <p className="text-sm text-gray-500">
                        {user ? 
                          `Manage ${user.emailAddresses?.[0]?.emailAddress || 'your account'}` : 
                          'Manage your personal information and preferences'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"></span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>

                {/* Sign Out */}
                <div 
                  onClick={handleSignOut}
                  className="p-6 hover:bg-red-50 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 text-lg">�</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 group-hover:text-red-600">Sign Out</h3>
                      <p className="text-sm text-gray-500">
                        {user ? 
                          `Sign out from ${user.firstName || 'your account'}` : 
                          'Sign out of your account'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Secure</span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </>
            )}
            
            {/* Customer Service - Always Available */}
            <div 
              onClick={handleCustomerService}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">�</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 group-hover:text-green-600">Customer Service</h3>
                  <p className="text-sm text-gray-500">Chat with our AI assistant or connect to a human agent</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>

          </div>
        </div>
      </div>

      {/* Chatbot Modal */}
      {showChatbot && <ChatbotModal />}
    </div>
  )
}

export default Settings