import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, Check, X, ArrowLeft, Link as LinkIcon, Sparkles, Shield, Zap, UserPlus } from "lucide-react";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();

  // Get query parameters
  const searchParams = new URLSearchParams(location.search);
  const createNew = searchParams.get("createNew");
  const redirect = searchParams.get("redirect");

  // Password requirements
  const passwordRequirements = {
    length: password.length >= 6,
    number: /\d/.test(password),
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
  };

  // validation helpers
  const isValidEmail = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  
  const emailError = () => {
    if (!touched.email) return "";
    if (!email) return "Email is required";
    if (!isValidEmail(email)) return "Please enter a valid email address";
    return "";
  };

  const passwordError = () => {
    if (!touched.password) return "";
    if (!password) return "Password is required";
    if (!passwordRequirements.length) return "Password must be at least 6 characters";
    return "";
  };

  const confirmError = () => {
    if (!touched.confirm) return "";
    if (!confirm) return "Please confirm your password";
    if (confirm !== password) return "Passwords do not match";
    return "";
  };

  const formIsValid = () =>
    isValidEmail(email) && 
    Object.values(passwordRequirements).every(req => req) && 
    confirm === password;

  useEffect(() => {
    if (formError) setFormError("");
  }, [email, password, confirm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true, confirm: true });
    setFormError("");

    if (!formIsValid()) return;

    setSubmitting(true);
    try {
      await signUp(email.trim(), password);
      
      // After successful signup, redirect appropriately
      if (redirect) {
        navigate(redirect);
      } else if (createNew) {
        // Redirect to link creation page with the URL
        navigate(`/link?url=${encodeURIComponent(createNew)}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      let errorMessage = err?.message || "Signup failed. Please try again.";
      
      if (errorMessage.includes("User already registered")) {
        errorMessage = "An account with this email already exists. Please login instead.";
      } else if (errorMessage.includes("Email not confirmed")) {
        errorMessage = "Please check your email to confirm your account.";
      } else if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "Invalid credentials. Please check your email and password.";
      }
      
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
        
        {/* Left Column - Features & Info */}
        <div className="hidden lg:block space-y-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Join URLShortner</h1>
              <p className="text-slate-300">Start shortening URLs in seconds</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Start Free</h3>
                  <p className="text-slate-300">100 URLs/month at no cost</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Advanced Features</h3>
                  <p className="text-slate-300">Custom slugs, QR codes, and detailed analytics</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Priority Support</h3>
                  <p className="text-slate-300">24/7 customer support for all users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">What You Get</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">100</div>
                <div className="text-emerald-200 text-sm">Free URLs/month</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-emerald-200 text-sm">Support</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">∞</div>
                <div className="text-emerald-200 text-sm">Custom Slugs</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">30-day</div>
                <div className="text-emerald-200 text-sm">History</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Signup Form */}
        <div className="flex flex-col justify-center">
          {/* Back button for mobile */}
          <button
            onClick={() => navigate("/")}
            className="lg:hidden mb-6 flex items-center text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </button>

          <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mb-4">
                <div className="inline-flex p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-white">
                  Create Account
                </CardTitle>
                <CardDescription className="text-slate-300 mt-2">
                  Sign up to start shortening URLs in seconds
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium text-white">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      aria-invalid={!!emailError()}
                      aria-describedby="signup-email-error"
                      className="pl-11 w-full h-12 bg-white/5 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  {emailError() && (
                    <p id="signup-email-error" className="text-sm text-red-300">
                      {emailError()}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      aria-invalid={!!passwordError()}
                      aria-describedby="signup-password-error"
                      className="pl-11 pr-11 w-full h-12 bg-white/5 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="space-y-2 pt-3 bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {passwordRequirements.length ? 
                        <Check className="h-4 w-4 text-green-400" /> : 
                        <X className="h-4 w-4 text-slate-500" />
                      }
                      <span className={`text-sm ${passwordRequirements.length ? 'text-green-300' : 'text-slate-400'}`}>
                        At least 6 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {passwordRequirements.number ? 
                        <Check className="h-4 w-4 text-green-400" /> : 
                        <X className="h-4 w-4 text-slate-500" />
                      }
                      <span className={`text-sm ${passwordRequirements.number ? 'text-green-300' : 'text-slate-400'}`}>
                        Contains a number (0-9)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {passwordRequirements.uppercase ? 
                        <Check className="h-4 w-4 text-green-400" /> : 
                        <X className="h-4 w-4 text-slate-500" />
                      }
                      <span className={`text-sm ${passwordRequirements.uppercase ? 'text-green-300' : 'text-slate-400'}`}>
                        Contains uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {passwordRequirements.lowercase ? 
                        <Check className="h-4 w-4 text-green-400" /> : 
                        <X className="h-4 w-4 text-slate-500" />
                      }
                      <span className={`text-sm ${passwordRequirements.lowercase ? 'text-green-300' : 'text-slate-400'}`}>
                        Contains lowercase letter
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="text-sm font-medium text-white">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="signup-confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                      aria-invalid={!!confirmError()}
                      aria-describedby="signup-confirm-error"
                      className="pl-11 pr-11 w-full h-12 bg-white/5 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmError() && (
                    <p id="signup-confirm-error" className="text-sm text-red-300">
                      {confirmError()}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-sm text-red-300">{formError}</p>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 h-5 w-5 text-green-500 border-slate-600 bg-white/5 rounded focus:ring-green-500 focus:ring-offset-slate-900"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-300">
                    I agree to the{" "}
                    <a href="#" className="text-green-300 hover:text-green-200 hover:underline font-medium">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-green-300 hover:text-green-200 hover:underline font-medium">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-base font-medium shadow-lg"
                  disabled={!formIsValid() || submitting}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : "Create Account"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col border-t border-slate-700 pt-6">
              <p className="text-sm text-slate-300 text-center mb-4">
                Already have an account?{" "}
                <Link 
                  to={`/login${location.search}`} 
                  className="text-green-300 hover:text-green-200 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                <span>No credit card required</span>
                <span>•</span>
                <span>Free forever plan</span>
                <span>•</span>
                <span>Cancel anytime</span>
              </div>
            </CardFooter>
          </Card>

          {/* URL Preview - Only when creating new */}
          {createNew && (
            <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl border border-slate-700 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <LinkIcon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Ready to Shorten!</h3>
                  <p className="text-sm text-slate-300">After signup, we'll create a short link for:</p>
                </div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-slate-600">
                <p className="text-sm font-mono text-slate-200 break-all">{createNew}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;