import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, RefreshCw, AlertCircle, Edit2, Send } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { verifyOtp, resendOtp, clearError } from '../../features/auth/authSlice';
import { Spinner } from '../../components/common/Spinner';

export const VerifyOtpPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const searchParams = new URLSearchParams(location.search);
  const paramEmail = searchParams.get('email');

  const { pendingRegistrationEmail, isLoading, error } = useAppSelector((state) => state.auth);

  const initialEmail = paramEmail || pendingRegistrationEmail || '';
  const [email, setEmail] = useState<string>(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(!initialEmail);
  const [otp, setOtp] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(60);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleSendCode = async () => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setValidationError(null);
    setResendMessage(null);
    setIsSendingCode(true);

    try {
      const result = await dispatch(resendOtp({ email: email.trim() }));
      if (resendOtp.fulfilled.match(result)) {
        setResendMessage(`A 6-digit verification code has been sent to ${email.trim()}.`);
        setResendCooldown(60);
        setIsEditingEmail(false);
      } else {
        setValidationError((result.payload as string) || 'Failed to send verification email.');
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (!otp.trim() || otp.trim().length !== 6) {
      setValidationError('Please enter the 6-digit verification code.');
      return;
    }

    const result = await dispatch(verifyOtp({ email: cleanEmail, otp: otp.trim() }));
    if (verifyOtp.fulfilled.match(result)) {
      navigate('/login?verified=true');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-600 items-center justify-center text-white mb-3 shadow-lg shadow-emerald-100">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verify Your Email</h2>
          
          {email && !isEditingEmail ? (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-slate-500">
                We have sent a 6-digit verification code to your email
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-100">
                <Mail className="w-3.5 h-3.5" />
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="ml-1 text-slate-400 hover:text-indigo-900"
                  title="Change email"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 mt-1">
              Enter your registered email address to receive your 6-digit verification code
            </p>
          )}
        </div>

        {resendMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resendMessage}</span>
          </div>
        )}

        {(validationError || error) && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        {isEditingEmail ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isSendingCode || !email.trim()}
              onClick={handleSendCode}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSendingCode ? (
                <Spinner size="sm" color="text-white" />
              ) : (
                <>
                  Send Verification Code
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                autoFocus
                className="w-full text-center text-3xl tracking-[0.5em] font-mono font-black py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.trim().length !== 6}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-100 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Spinner size="sm" color="text-white" />
              ) : (
                <>
                  Verify & Activate
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center gap-3 text-center">
          {!isEditingEmail && email && (
            <button
              type="button"
              disabled={resendCooldown > 0 || isSendingCode || isLoading}
              onClick={handleSendCode}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'animate-spin-slow'}`} />
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : 'Resend Verification Code'}
            </button>
          )}

          <Link to="/login" className="text-xs font-medium text-slate-500 hover:text-slate-800">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

