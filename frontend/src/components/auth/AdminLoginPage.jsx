import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, AlertCircle, Mail, KeyRound, Clock } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(600); // 10 minutes
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Format countdown time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Step 1: Email verification and OTP sending
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/users/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        startCountdown();
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Email verification error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/users/admin/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store admin session in localStorage
        const adminSession = {
          email: data.user.email,
          role: data.user.role,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          userId: data.user.id,
          loginTime: new Date().getTime(),
          expiry: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
        };
        
        localStorage.setItem('adminSession', JSON.stringify(adminSession));
        
        // Navigate to admin panel
        navigate('/admin');
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/users/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        startCountdown();
        setError('');
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background - Admin Theme */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 left-20 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-md space-y-8">
        {/* Back Button */}
        <button
          onClick={() => step === 'otp' ? setStep('email') : navigate('/sign-in')}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          {step === 'otp' ? 'Back to Email' : 'Back to Regular Sign In'}
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 rounded-full text-red-700 text-sm font-medium mb-6">
            🔐 Secure Access
          </div>
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
              {step === 'email' ? (
                <Shield className="h-8 w-8 text-red-600" />
              ) : (
                <KeyRound className="h-8 w-8 text-red-600" />
              )}
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {step === 'email' ? 'Admin Access' : 'Verify OTP'}
          </h2>
          <p className="text-lg text-gray-600">
            {step === 'email' 
              ? 'Enter your admin email to receive verification code'
              : `Enter the 6-digit code sent to ${email}`
            }
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100 p-8">
          {step === 'email' ? (
            // Email Step
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="admin-email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-400" />
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full pl-12 pr-4 py-3 border border-red-200 placeholder-red-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    placeholder="Enter your admin email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Sending Verification Code...
                  </div>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Verification Code
                  </>
                )}
              </button>
            </form>
          ) : (
            // OTP Step
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Countdown Timer */}
              {countdown > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <p className="text-sm text-amber-700">
                      Code expires in: <strong>{formatTime(countdown)}</strong>
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="otp-code" className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-400" />
                  <input
                    id="otp-code"
                    name="otp"
                    type="text"
                    required
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none relative block w-full pl-12 pr-4 py-3 border border-red-200 placeholder-red-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-center text-2xl font-mono tracking-widest"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Verifying Code...
                  </div>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Access Admin Panel
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || loading}
                  className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend code in ${formatTime(countdown)}` : 'Resend verification code'}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <p className="text-xs text-red-500 font-medium">
              ⚠️ This area is restricted to authorized administrators only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
