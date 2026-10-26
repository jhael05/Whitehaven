import React, { useState } from 'react';
import { CafeLogo } from './CafeLogo';
import { useAuth } from '../context/AuthContext';
import { X, ArrowLeft, CheckCircle2, AlertCircle, Mail, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

type ForgotStep = 'enter_contact' | 'enter_otp' | 'new_password';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const {
    loginWithCredentials,
    registerAccount,
    loginWithSocialAccount,
    requestPasswordResetOtp,
    resetPasswordWithOtp,
    registeredAccounts,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('enter_contact');

  // Input states — ALL COMPLETELY BLANK BY DEFAULT!
  const [name, setName] = useState('');
  const [emailOrContact, setEmailOrContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Provider-specific login states (ALL BLANK)
  const [activeSocialProvider, setActiveSocialProvider] = useState<
    'google' | 'facebook' | 'instagram' | 'tiktok' | null
  >(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');

  // OTP flow states (ALL BLANK)
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpNotification, setOtpNotification] = useState<string | null>(null);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmailOrContact('');
    setPassword('');
    setConfirmPassword('');
    setSocialEmail('');
    setSocialName('');
    setEnteredOtp('');
    setGeneratedOtp('');
    setOtpNotification(null);
    setErrorMessage('');
    setSuccessToast('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 1. STRICT LOG IN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanId = emailOrContact.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your email or contact number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const res = loginWithCredentials(cleanId, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Login failed. Please verify your credentials.');
      return;
    }

    setSuccessToast(`Welcome back, ${res.user?.name}!`);
    setTimeout(() => {
      handleClose();
    }, 700);
  };

  // 2. STRICT SIGN UP
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = name.trim();
    const cleanId = emailOrContact.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your real full name.');
      return;
    }
    if (!cleanId) {
      setErrorMessage('Please enter your email or contact number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please create a password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const res = registerAccount(cleanName, cleanId, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed.');
      return;
    }

    setSuccessToast(`Account created successfully! Welcome, ${res.user?.name}!`);
    setTimeout(() => {
      handleClose();
    }, 700);
  };

  // 3. SOCIAL LOG IN (Google, Facebook, Instagram, TikTok)
  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!activeSocialProvider) return;

    const cleanEmail = socialEmail.trim();
    const cleanName = socialName.trim();

    if (!cleanEmail) {
      setErrorMessage(`Please enter your real ${activeSocialProvider.toUpperCase()} email or handle.`);
      return;
    }
    if (!cleanName) {
      setErrorMessage('Please enter your name.');
      return;
    }

    const res = loginWithSocialAccount(activeSocialProvider, cleanEmail, cleanName);
    if (!res.success) {
      setErrorMessage(res.error || 'Social sign-in failed.');
      return;
    }

    setActiveSocialProvider(null);
    setSuccessToast(`Logged in successfully with ${res.user?.name}!`);
    setTimeout(() => {
      handleClose();
    }, 700);
  };

  // 4. FORGOT PASSWORD - SEND OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanId = emailOrContact.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your registered email address or contact number.');
      return;
    }

    const res = requestPasswordResetOtp(cleanId);
    if (!res.success || !res.otp) {
      setErrorMessage(res.error || 'No registered account found with this email or contact number.');
      return;
    }

    setGeneratedOtp(res.otp);
    setOtpNotification(`White Haven Security OTP for ${cleanId}: [${res.otp}]`);
    setEnteredOtp(''); // Blank for the user to type
    setForgotStep('enter_otp');
  };

  // 5. FORGOT PASSWORD - VERIFY OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!enteredOtp.trim()) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setErrorMessage('Invalid OTP code. Please enter the exact 6-digit code shown in the alert.');
      return;
    }

    setForgotStep('new_password');
    setOtpNotification(null);
  };

  // 6. FORGOT PASSWORD - SAVE NEW PASSWORD
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!password || password.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const res = resetPasswordWithOtp(emailOrContact, enteredOtp, generatedOtp, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to update password.');
      return;
    }

    setSuccessToast('Password successfully updated! You are now logged in.');
    setTimeout(() => {
      handleClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#E8DCCF] p-7 sm:p-9 shadow-2xl border border-[#D4C3B3]">
        {/* Top bar with Return Home button exactly as in the user's uploaded screenshot */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4C3B3] hover:bg-[#C5B3A1] px-3.5 py-1.5 text-xs font-semibold text-[#2C1810] shadow-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </button>

          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-[#5D4037] hover:bg-[#D4C3B3] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Back navigation button if inside Forgot Password sub-steps or Social Login */}
        {activeSocialProvider ? (
          <button
            onClick={() => {
              setActiveSocialProvider(null);
              setErrorMessage('');
            }}
            className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#5D4037] hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to main login</span>
          </button>
        ) : (
          mode === 'forgot' && forgotStep !== 'enter_contact' && (
            <button
              onClick={() => {
                if (forgotStep === 'new_password') setForgotStep('enter_otp');
                else if (forgotStep === 'enter_otp') setForgotStep('enter_contact');
                setErrorMessage('');
              }}
              className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#5D4037] hover:underline cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to previous step</span>
            </button>
          )
        )}

        {/* Real SMS/Email OTP Alert notification banner */}
        {otpNotification && (
          <div className="my-3 flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-300 p-3 text-xs text-blue-900 shadow-sm animate-fade-in">
            <Mail className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">White Haven Security Verification:</p>
              <p className="mt-0.5 font-mono font-semibold">{otpNotification}</p>
            </div>
          </div>
        )}

        {/* Success feedback */}
        {successToast && (
          <div className="my-3 flex items-center gap-2 rounded-xl bg-[#3E2723] p-3 text-xs font-semibold text-[#FAF7F2] shadow-md animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Prominent Error Box */}
        {errorMessage && (
          <div className="my-3 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-300 p-3 text-xs text-red-900 shadow-sm animate-fade-in">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="block font-bold">Authentication Notice:</span>
              <span className="text-red-800">{errorMessage}</span>

              {errorMessage.includes('SIGN UP') && mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage('');
                  }}
                  className="mt-1.5 inline-block rounded-md bg-red-800 text-white px-3 py-1 text-[11px] font-bold hover:bg-red-900 transition-colors"
                >
                  Click here to SIGN UP →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            SOCIAL LOGIN DIALOG (Google, Facebook, Instagram, TikTok)
            Everything starts BLANK!
           ======================================================== */}
        {activeSocialProvider ? (
          <div className="flex flex-col items-center pt-2 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display font-bold uppercase text-lg text-[#2C1810]">
                Sign in with {activeSocialProvider.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-[#5D4037] text-center mb-4">
              Enter your real {activeSocialProvider} name and email/handle to continue.
            </p>

            <form onSubmit={handleSocialSubmit} className="w-full space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#4A2E1B] mb-1">
                  Your Real Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Clara"
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  className="w-full rounded-lg border border-[#C5B3A1] bg-[#FAF7F2] px-3.5 py-2.5 text-sm text-[#2C1810] focus:border-[#5D4037] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A2E1B] mb-1">
                  {activeSocialProvider === 'google' ? 'Google / Gmail Address' : `${activeSocialProvider.toUpperCase()} Account Email or Handle`}
                </label>
                <input
                  type="text"
                  required
                  placeholder={activeSocialProvider === 'google' ? 'yourname@gmail.com' : 'username or email'}
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#C5B3A1] bg-[#FAF7F2] px-3.5 py-2.5 text-sm text-[#2C1810] focus:border-[#5D4037] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSocialProvider(null);
                    setErrorMessage('');
                  }}
                  className="flex-1 rounded-full bg-white border border-[#D4C3B3] py-2.5 text-xs font-semibold text-[#5D4037] hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-[#3D2517] hover:bg-[#2C1810] py-2.5 text-xs font-semibold text-white shadow cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* ========================================================
                VIEW 1: LOGIN (Matching screenshot 1792769185072_054fe8fd.jpg)
                Blank input fields, strictly validates against real registered accounts!
               ======================================================== */}
            {mode === 'login' && (
              <div className="flex flex-col items-center pt-2">
                <CafeLogo size="md" variant="stacked" />

                <h2 className="mt-3 font-display text-2xl font-bold tracking-wider text-[#2C1810] uppercase">
                  LOG IN
                </h2>

                <form onSubmit={handleLogin} className="mt-4 w-full space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#4A2E1B] mb-1">
                      Email or Contact Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Email or Contact Number"
                      value={emailOrContact}
                      onChange={(e) => setEmailOrContact(e.target.value)}
                      className="w-full rounded-lg border border-[#C5B3A1] bg-[#FAF7F2] px-3.5 py-2.5 text-sm text-[#2C1810] placeholder-[#9E8B7A] focus:border-[#5D4037] focus:outline-none focus:ring-1 focus:ring-[#5D4037] shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A2E1B] mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-[#C5B3A1] bg-[#FAF7F2] pl-3.5 pr-10 py-2.5 text-sm text-[#2C1810] placeholder-[#9E8B7A] focus:border-[#5D4037] focus:outline-none focus:ring-1 focus:ring-[#5D4037] shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#7C6656] hover:text-[#2C1810]"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Log In Button matching pill screenshot */}
                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#3D2517] hover:bg-[#2C1810] active:scale-[0.99] py-3 text-sm font-semibold text-[#FAF7F2] shadow-md transition-all duration-150 mt-1 cursor-pointer"
                  >
                    Log In
                  </button>
                </form>

                {/* Forgot Password Link */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setForgotStep('enter_contact');
                    setErrorMessage('');
                  }}
                  className="mt-3 text-xs font-medium text-[#5D4037] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>

                {/* Divider */}
                <div className="relative my-4 w-full">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#C5B3A1]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#E8DCCF] px-2 text-[#7C6656]">or continue with</span>
                  </div>
                </div>

                {/* Social Logins */}
                <div className="flex items-center justify-center gap-5">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSocialProvider('google');
                      setSocialEmail('');
                      setSocialName('');
                      setErrorMessage('');
                    }}
                    title="Log in with Google / Gmail"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF7F2] shadow-sm hover:scale-105 active:scale-95 transition-transform border border-[#D4C3B3] cursor-pointer"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSocialProvider('facebook');
                      setSocialEmail('');
                      setSocialName('');
                      setErrorMessage('');
                    }}
                    title="Log in with Facebook"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>

                  {/* TikTok */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSocialProvider('tiktok');
                      setSocialEmail('');
                      setSocialName('');
                      setErrorMessage('');
                    }}
                    title="Log in with TikTok"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.68c-.02 3.19-2.19 6.07-5.34 6.78-3.15.71-6.49-.81-7.78-3.72-1.3-2.91-.18-6.42 2.61-7.79 1.12-.55 2.37-.77 3.61-.63v4.06c-.72-.19-1.5-.16-2.19.11-.99.39-1.63 1.36-1.61 2.42.02 1.25.96 2.31 2.21 2.44 1.53.16 2.95-.91 3.09-2.44.04-.44.03-8.08.03-8.08.01-3.08.01-6.15.01-9.23 0-.15.01-.3.01-.45z" />
                    </svg>
                  </button>

                  {/* Instagram */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSocialProvider('instagram');
                      setSocialEmail('');
                      setSocialName('');
                      setErrorMessage('');
                    }}
                    title="Log in with Instagram"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </button>
                </div>

                {/* Bottom link to Sign up */}
                <div className="mt-5 text-center text-xs text-[#5D4037]">
                  <span>Do you have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage('');
                    }}
                    className="font-bold underline uppercase text-[#3E2723] hover:text-black tracking-wider cursor-pointer"
                  >
                    SIGN UP
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================
                VIEW 2: SIGN UP (Registers REAL account)
                Completely BLANK inputs by default!
               ======================================================== */}
            {mode === 'signup' && (
              <div className="flex flex-col items-center pt-2">
                <CafeLogo size="sm" variant="stacked" />
                <h2 className="mt-2 font-display text-2xl font-bold tracking-wider text-[#2C1810] uppercase">
                  CREATE ACCOUNT
                </h2>
                <p className="text-xs text-[#6F4E37] text-center mt-0.5">
                  Sign up with your real name and email/number to save your orders & stamps.
                </p>

                <form onSubmit={handleSignup} className="mt-4 w-full space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4A2E1B] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Santos"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-[#C5B3A1] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#2C1810] placeholder-[#9E8B7A] focus:border-[#5D4037] focus:outline-none focus:ring-1 focus:ring-[#5D4037]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A2E1B] mb-1">
                      Email or Contact Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0917xxxxxxx or your.email@domain.com"
                      value={emailOrContact}
                      onChange={(e) => setEmailOrContact(e.target.value)}
                      className="w-full rounded-lg border border-[#C5B3A1] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#2C1810] placeholder-[#9E8B7A] focus:border-[#5D4037] focus:outline-none focus:ring-1 focus:ring-[#5D4037]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A2E1B] mb-1">
                      Password (min 6 characters) *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Create password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-[#C5B3A1] bg-[#FAF7F2] pl-3.5 pr-10 py-2 text-sm text-[#2C1810] placeholder-[#9E8B7A] focus:border-[#5D4037] focus:outline-none focus:ring-1 focus:ring-[#5D4037]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-[#7C6656] hover:text-[#2C1810]"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#4A2E1B] mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-[#C5B3A1] bg-[#FAF7F2] pl-3.5 pr-10 py-2 text-sm text-[#2C1810] placeholder-[#9E8B7A] focus:border-[#5D4037] focus:outline-none focus:ring-1 focus:ring-[#5D4037]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2 text-[#7C6656] hover:text-[#2C1810]"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#3D2517] hover:bg-[#2C1810] py-3 text-sm font-semibold text-[#FAF7F2] shadow-md transition-all mt-2 cursor-pointer"
                  >
                    Create Account
                  </button>
                </form>

                <div className="mt-4 text-center text-xs text-[#5D4037]">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage('');
                    }}
                    className="font-bold underline uppercase text-[#3E2723] hover:text-black tracking-wider cursor-pointer"
                  >
                    LOG IN
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================
                VIEW 3: FORGOT PASSWORD FLOW
                Completely BLANK inputs, real validation!
               ======================================================== */}
            {mode === 'forgot' && (
              <div className="flex flex-col items-center pt-2">
                {/* Step 3.1: Enter Email or Contact Number (matches 861420749) */}
                {forgotStep === 'enter_contact' && (
                  <div className="w-full">
                    <h2 className="font-display text-2xl font-bold tracking-wider text-[#2C1810] text-center uppercase">
                      FORGOT PASSWORD
                    </h2>
                    <p className="text-center text-xs text-[#5D4037] mt-1 mb-4">
                      Enter your registered email address or contact number to verify your account
                    </p>

                    <form onSubmit={handleSendOtp} className="mt-2 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#2C1810] mb-2">
                          Email Address or Contact Number
                        </label>
                        <input
                          type="text"
                          required
                          value={emailOrContact}
                          onChange={(e) => setEmailOrContact(e.target.value)}
                          placeholder="e.g. 0917xxxxxxx or email@domain.com"
                          className="w-full rounded-md border border-[#D4C3B3] bg-white px-3.5 py-3 text-base text-[#2C1810] focus:border-[#2C1810] focus:outline-none shadow-sm"
                          autoFocus
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-md bg-[#2C2C2C] hover:bg-[#1A1A1A] py-3 text-sm font-semibold text-white shadow transition-all cursor-pointer"
                      >
                        send OTP
                      </button>
                    </form>
                  </div>
                )}

                {/* Step 3.2: Enter OTP (matches 858227318) */}
                {forgotStep === 'enter_otp' && (
                  <div className="w-full">
                    <h2 className="font-display text-2xl font-bold tracking-wider text-[#2C1810] text-center uppercase">
                      FORGOT PASSWORD
                    </h2>
                    <p className="text-center text-xs text-[#5D4037] mt-1 mb-4">
                      Enter the 6-digit security OTP code for <strong>{emailOrContact}</strong>
                    </p>

                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#2C1810] mb-2">
                          OTP
                        </label>
                        <input
                          type="text"
                          required
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="w-full rounded-md border border-[#D4C3B3] bg-white px-3.5 py-3 text-center tracking-[0.4em] text-lg font-bold text-[#2C1810] focus:border-[#2C1810] focus:outline-none shadow-sm"
                          autoFocus
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-md bg-[#2C2C2C] hover:bg-[#1A1A1A] py-3 text-sm font-semibold text-white shadow transition-all cursor-pointer"
                      >
                        Confirm
                      </button>
                    </form>
                  </div>
                )}

                {/* Step 3.3: Enter New Password (matches 857155021) */}
                {forgotStep === 'new_password' && (
                  <div className="w-full">
                    <h2 className="font-display text-2xl font-bold tracking-wider text-[#2C1810] text-center uppercase">
                      NEW PASSWORD
                    </h2>
                    <p className="text-center text-xs text-[#5D4037] mt-1 mb-4">
                      Create your new secure password for <strong>{emailOrContact}</strong>
                    </p>

                    <form onSubmit={handleSaveNewPassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#2C1810] mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full rounded-md border border-[#D4C3B3] bg-white px-3.5 py-3 text-base text-[#2C1810] focus:border-[#2C1810] focus:outline-none shadow-sm"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#2C1810] mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full rounded-md border border-[#D4C3B3] bg-white px-3.5 py-3 text-base text-[#2C1810] focus:border-[#2C1810] focus:outline-none shadow-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-md bg-[#2C2C2C] hover:bg-[#1A1A1A] py-3 text-sm font-semibold text-white shadow transition-all cursor-pointer"
                      >
                        Confirm
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
