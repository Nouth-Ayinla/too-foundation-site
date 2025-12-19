import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

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

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const signup = useMutation(api.auth.signup);
  const signin = useMutation(api.auth.signin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate inputs
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Validate name for signup
        const nameError = validateName(name);
        if (nameError) {
          setError(nameError);
          setLoading(false);
          return;
        }

        // Sign up
        const user = await signup({ 
          email: email.trim(), 
          password, 
          name: name.trim() 
        });
        
        // Auto-login after successful signup
        localStorage.setItem("user", JSON.stringify(user));
        setSuccess(true);
        
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate("/admin");
        }, 500);
      } else {
        // Sign in
        const user = await signin({ 
          email: email.trim(), 
          password 
        });
        
        localStorage.setItem("user", JSON.stringify(user));
        setSuccess(true);
        
        // Redirect based on role
        setTimeout(() => {
          if (user.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
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
            {isSignUp ? "Create Account" : "Welcome back!"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp
              ? "Please fill in your details to create an account"
              : "Please enter your credentials to sign in!"}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
              {isSignUp
                ? "Account created! Redirecting..."
                : "Signed in successfully! Redirecting..."}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
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
              {isSignUp && (
                <small className="text-muted-foreground block mt-1">
                  At least 6 characters
                </small>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-green text-white rounded-lg font-semibold hover:bg-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess(false);
              }}
              disabled={loading}
              className="text-green hover:text-green-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
