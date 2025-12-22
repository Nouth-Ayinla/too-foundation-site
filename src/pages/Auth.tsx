import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

// Timeout duration in milliseconds
const MUTATION_TIMEOUT = 15000;

// Input validation helpers
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  if (email.length > 255) return "Email must be less than 255 characters";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  if (password.length > 100) return "Password must be less than 100 characters";
  return null;
};

const validateName = (name: string): string | null => {
  if (!name.trim()) return "Name is required";
  if (name.length > 100) return "Name must be less than 100 characters";
  return null;
};

// Wrapper to add timeout to async operations
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout. Please check your internet and try again.")), ms)
    ),
  ]);
};

type AuthView = "signin" | "signup" | "forgot" | "verify-code" | "reset-password";
type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "error";

// Inner component that uses Convex hooks (only rendered when Convex is available)
const AuthWithConvex = () => {
  const navigate = useNavigate();
  const convex = useConvex();
  const [view, setView] = useState<AuthView>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [retryCount, setRetryCount] = useState(0);
  
  // OTP Code state
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const signup = useMutation(api.auth.signup);
  const signin = useMutation(api.auth.signin);
  const requestPasswordReset = useMutation(api.passwordReset.requestPasswordReset);
  const resetPassword = useMutation(api.passwordReset.resetPassword);
  const incrementAttempts = useMutation(api.passwordReset.incrementAttempts);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Monitor connection status
  useEffect(() => {
    let mounted = true;
    let connectionCheckInterval: NodeJS.Timeout;

    const checkConnection = async () => {
      try {
        // Try a simple query to check connection
        await withTimeout(
          convex.query(api.auth.getCurrentUser, { email: "connection-test@test.com" }),
          5000
        );
        if (mounted) setConnectionStatus("connected");
      } catch (err) {
        if (mounted) {
          setConnectionStatus((prev) => (prev === "connected" ? "reconnecting" : "connecting"));
        }
      }
    };

    // Initial check
    checkConnection();

    // Periodic check every 10 seconds
    connectionCheckInterval = setInterval(checkConnection, 10000);

    return () => {
      mounted = false;
      clearInterval(connectionCheckInterval);
    };
  }, [convex]);

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setError("");
    setConnectionStatus("reconnecting");
    
    // Force a connection check
    setTimeout(() => {
      convex.query(api.auth.getCurrentUser, { email: "connection-test@test.com" })
        .then(() => setConnectionStatus("connected"))
        .catch(() => setConnectionStatus("error"));
    }, 1000);
  }, [convex]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtpCode(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace in OTP input
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste in OTP input
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otpCode];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtpCode(newOtp);
    // Focus last filled input or the next empty one
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const sendResetCode = async () => {
    setError("");
    setLoading(true);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    try {
      const result = await withTimeout(
        requestPasswordReset({ email: email.trim() }),
        MUTATION_TIMEOUT
      );
      
      if (result.code) {
        // Send email via HTTP action
        await withTimeout(
          fetch(`${import.meta.env.VITE_CONVEX_URL?.replace('.cloud', '.site')}/send-reset-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email.trim(),
              code: result.code,
            }),
          }),
          MUTATION_TIMEOUT
        );
      }
      
      setView("verify-code");
      setResendCountdown(60);
      setOtpCode(["", "", "", "", "", ""]);
      setSuccess(true);
      setSuccessMessage("A 6-digit code has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError("");
    const code = otpCode.join("");
    
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);

    try {
      // Verify code using query
      const verification = await withTimeout(
        convex.query(api.passwordReset.verifyResetCode, { 
          code, 
          email: email.trim() 
        }),
        MUTATION_TIMEOUT
      );

      if (!verification.valid) {
        await incrementAttempts({ email: email.trim() });
        setError(verification.error || "Invalid code");
        setLoading(false);
        return;
      }

      setView("reset-password");
      setSuccess(true);
      setSuccessMessage("Code verified! Please enter your new password.");
    } catch (err: any) {
      setError(err.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError("");

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await withTimeout(
        resetPassword({
          email: email.trim(),
          code: otpCode.join(""),
          new_password: password,
        }),
        MUTATION_TIMEOUT
      );

      setSuccess(true);
      setSuccessMessage("Password reset successfully! Redirecting to sign in...");
      
      setTimeout(() => {
        setView("signin");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setOtpCode(["", "", "", "", "", ""]);
        setSuccess(false);
        setSuccessMessage("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    try {
      if (view === "forgot") {
        await sendResetCode();
        return;
      } else if (view === "signup") {
        // Validate password and name for signup
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        const nameError = validateName(name);
        if (nameError) {
          setError(nameError);
          setLoading(false);
          return;
        }

        const user = await withTimeout(
          signup({ 
            email: email.trim(), 
            password, 
            name: name.trim() 
          }),
          MUTATION_TIMEOUT
        );
        
        localStorage.setItem("user", JSON.stringify(user));
        setSuccess(true);
        setSuccessMessage("Account created! Redirecting...");
        
        setTimeout(() => {
          navigate("/admin");
        }, 500);
      } else {
        // Sign in
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        const user = await withTimeout(
          signin({ 
            email: email.trim(), 
            password 
          }),
          MUTATION_TIMEOUT
        );
        
        localStorage.setItem("user", JSON.stringify(user));
        setSuccess(true);
        setSuccessMessage("Signed in successfully! Redirecting...");
        
        setTimeout(() => {
          if (user.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }, 500);
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      
      // Provide user-friendly error messages
      if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
        setError("Connection timeout. Please check your internet connection and try again.");
        setConnectionStatus("reconnecting");
      } else if (errorMessage.includes("network") || errorMessage.includes("Network")) {
        setError("Network error. Please check your internet connection.");
        setConnectionStatus("error");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setError("");
    setSuccess(false);
    setSuccessMessage("");
    setPassword("");
    setConfirmPassword("");
    setOtpCode(["", "", "", "", "", ""]);
  };

  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case "connecting":
        return { text: "Connecting...", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" };
      case "reconnecting":
        return { text: "Reconnecting...", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" };
      case "error":
        return { text: "Connection issues", color: "text-red-600", bg: "bg-red-50 border-red-200" };
      case "connected":
      default:
        return null;
    }
  };

  const statusDisplay = getConnectionStatusDisplay();

  const getTitle = () => {
    switch (view) {
      case "signup": return "Create Account";
      case "forgot": return "Reset Password";
      case "verify-code": return "Enter Code";
      case "reset-password": return "New Password";
      default: return "Welcome back!";
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case "signup": return "Please fill in your details to create an account";
      case "forgot": return "Enter your email and we'll send you a 6-digit code";
      case "verify-code": return `Enter the 6-digit code sent to ${email}`;
      case "reset-password": return "Enter your new password";
      default: return "Please enter your credentials to sign in!";
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-green relative flex-col justify-between p-10">
        {/* Decorative curves */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-green-dark/30" />
          <div className="absolute bottom-40 -left-32 w-80 h-80 rounded-full bg-green-dark/20" />
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-green-dark/25 translate-x-1/2" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/assets/images/logo.png"
              alt="TOOF Logo"
              className="h-14 w-auto"
            />
          </a>
        </div>

        {/* Description */}
        <div className="relative z-10 text-white max-w-md">
          <p className="text-lg leading-relaxed opacity-90">
            The Olanike Omopariola Foundation (TOOF) is a non-profit
            organization dedicated to ending domestic and gender-based violence
            and transforming the lives of women and children impacted by these
            injustices. We believe that every woman and child deserves to live
            free from fear, violence, and oppression.
          </p>
        </div>

        {/* Copyright */}
        <div className="relative z-10 text-white/70 text-sm">
          Copyright © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-white">
            The Olanike Omopariola Foundation
          </span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <a href="/">
              <img
                src="/assets/images/logo.png"
                alt="TOOF Logo"
                className="h-12 w-auto"
              />
            </a>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground mb-8">
            {getSubtitle()}
          </p>

          {/* Connection Status Indicator */}
          {statusDisplay && (
            <div className={`mb-4 p-3 border rounded flex items-center justify-between ${statusDisplay.bg}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${connectionStatus === "connected" ? "bg-green-500" : connectionStatus === "error" ? "bg-red-500" : "bg-yellow-500"}`} />
                <span className={`text-sm ${statusDisplay.color}`}>{statusDisplay.text}</span>
              </div>
              {(connectionStatus === "error" || connectionStatus === "reconnecting") && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="text-sm text-green hover:text-green-dark font-medium"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                {error.includes("timeout") || error.includes("Connection") ? (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="text-sm text-red-800 hover:text-red-900 font-medium underline ml-2"
                  >
                    Retry
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {/* Verify Code View */}
          {view === "verify-code" && (
            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent transition-all bg-background text-foreground"
                    disabled={loading}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={verifyCode}
                className="w-full py-3 bg-green text-white rounded-lg font-semibold hover:bg-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading || otpCode.join("").length !== 6}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : "Verify Code"}
              </button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={sendResetCode}
                  disabled={resendCountdown > 0 || loading}
                  className="text-green hover:text-green-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend Code"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => switchView("signin")}
                disabled={loading}
                className="w-full text-center text-green hover:text-green-dark transition-colors font-medium disabled:opacity-50"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Reset Password View */}
          {view === "reset-password" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent transition-all bg-background text-foreground placeholder:text-muted-foreground"
                  disabled={loading}
                  maxLength={100}
                />
                <small className="text-muted-foreground block mt-1">
                  At least 6 characters
                </small>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent transition-all bg-background text-foreground placeholder:text-muted-foreground"
                  disabled={loading}
                  maxLength={100}
                />
              </div>

              <button
                type="button"
                onClick={handlePasswordReset}
                className="w-full py-3 bg-green text-white rounded-lg font-semibold hover:bg-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Resetting...</span>
                  </>
                ) : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => switchView("signin")}
                disabled={loading}
                className="w-full text-center text-green hover:text-green-dark transition-colors font-medium disabled:opacity-50"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Sign In, Sign Up, Forgot Password Forms */}
          {(view === "signin" || view === "signup" || view === "forgot") && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {view === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent transition-all bg-background text-foreground placeholder:text-muted-foreground"
                    required
                    disabled={loading}
                    maxLength={100}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent transition-all bg-background text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={loading}
                  maxLength={255}
                />
              </div>

              {view !== "forgot" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent transition-all bg-background text-foreground placeholder:text-muted-foreground"
                    required
                    disabled={loading}
                    maxLength={100}
                  />
                  {view === "signup" && (
                    <small className="text-muted-foreground block mt-1">
                      At least 6 characters
                    </small>
                  )}
                </div>
              )}

              {view === "signin" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => switchView("forgot")}
                    className="text-sm text-green hover:text-green-dark transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-green text-white rounded-lg font-semibold hover:bg-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading || connectionStatus === "error"}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{connectionStatus === "reconnecting" ? "Reconnecting..." : "Please wait..."}</span>
                  </>
                ) : view === "signup" 
                  ? "Create Account" 
                  : view === "forgot"
                  ? "Send Code"
                  : "Sign In"}
              </button>

              <div className="mt-6 text-center space-y-2">
                {view === "forgot" ? (
                  <button
                    type="button"
                    onClick={() => switchView("signin")}
                    disabled={loading}
                    className="text-green hover:text-green-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => switchView(view === "signup" ? "signin" : "signup")}
                    disabled={loading}
                    className="text-green hover:text-green-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {view === "signup"
                      ? "Already have an account? Sign In"
                      : "Don't have an account? Sign Up"}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper component to check if Convex is configured
const Auth = () => {
  if (!convexUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-6 rounded-lg max-w-md text-center">
          <h2 className="text-lg font-semibold mb-2">Configuration Error</h2>
          <p className="text-sm">
            Convex is not configured. Please check that VITE_CONVEX_URL is set in your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return <AuthWithConvex />;
};

export default Auth;
