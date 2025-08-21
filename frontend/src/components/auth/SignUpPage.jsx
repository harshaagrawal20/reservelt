import { SignUp } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const SignUpPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
            🚀 Get Started
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-lg text-gray-600">
            Join the future of equipment rental
          </p>
        </div>
        
        {/* Sign Up Form */}
        <div className="p-6">
          <SignUp 
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
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
        </div>

        {/* Terms and Privacy */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            By signing up, you agree to our{' '}
            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
