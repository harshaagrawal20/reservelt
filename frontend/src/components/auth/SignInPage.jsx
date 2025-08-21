import { SignIn } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'

const SignInPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute top-20 left-20 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-md space-y-8">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
            ✨ Welcome Back
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Sign in to your account
          </h2>
          <p className="text-lg text-gray-600">
            Continue your equipment rental journey
          </p>
        </div>
        
        {/* Sign In Form */}
        <div className="px-6">
          <SignIn 
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 
                  'bg-emerald-500 hover:bg-emerald-600 text-sm normal-case transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl',
                card: 'shadow-none border-0 bg-transparent',
                headerTitle: 'text-gray-800 text-2xl font-bold',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'border-emerald-200 hover:bg-emerald-50 rounded-xl transition-all duration-200',
                formFieldInput: 'border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl',
                footerActionLink: 'text-emerald-500 hover:text-emerald-600 font-medium',
                dividerLine: 'bg-emerald-200',
                dividerText: 'text-gray-500',
                formFieldLabel: 'text-gray-700 font-medium'
              }
            }}
          />

          {/* Admin Login Section */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-medium">or</span>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/admin-login')}
              className="mt-6 inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Shield size={16} />
              Admin Access
            </button>
            
            <p className="mt-3 text-xs text-gray-500">
              Administrative access only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInPage
