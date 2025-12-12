import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Link as LinkIcon, Sparkles, Shield, Zap } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  // Get query parameters
  const searchParams = new URLSearchParams(location.search);
  const createNew = searchParams.get("createNew");
  const redirect = searchParams.get("redirect");

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
    return "";
  };

  const formIsValid = () => isValidEmail(email) && password.length > 0;

  useEffect(() => {
    if (formError) setFormError("");
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setFormError("");

    if (!formIsValid()) return;

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      
      // After successful login, redirect appropriately
      if (redirect) {
        navigate(redirect);
      } else if (createNew) {
        // Redirect to link creation page with the URL
        navigate(`/link?url=${encodeURIComponent(createNew)}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      let errorMessage = err?.message || "Login failed. Please try again.";
      
      if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (errorMessage.includes("Email not confirmed")) {
        errorMessage = "Please confirm your email before logging in. Check your inbox for the confirmation link.";
      } else if (errorMessage.includes("Email rate limit exceeded")) {
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (errorMessage.includes("User not found")) {
        errorMessage = "No account found with this email. Please sign up first.";
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
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <LinkIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">URLShortner</h1>
              <p className="text-slate-300">Professional URL Management</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Lightning Fast</h3>
              </div>
              <p className="text-slate-300">
                Instant URL shortening with 99.9% uptime and sub-second response times.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Smart Analytics</h3>
              </div>
              <p className="text-slate-300">
                Track clicks, geolocation, devices, and referral sources in real-time.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Enterprise Security</h3>
              </div>
              <p className="text-slate-300">
                Military-grade encryption and GDPR compliance for your data.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">Trusted by Thousands</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-blue-200 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1M+</div>
                <div className="text-blue-200 text-sm">URLs Shortened</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-blue-200 text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
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
                <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-white">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-slate-300 mt-2">
                  Sign in to access your dashboard and manage URLs
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Email Field */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-white">Email Address</div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      aria-invalid={!!emailError()}
                      aria-describedby="login-email-error"
                      className="pl-11 w-full h-12 bg-white/5 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  {emailError() && (
                    <p id="login-email-error" className="text-sm text-red-300">
                      {emailError()}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-white">Password</div>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-blue-300 hover:text-blue-200 hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      aria-invalid={!!passwordError()}
                      aria-describedby="login-password-error"
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
                  {passwordError() && (
                    <p id="login-password-error" className="text-sm text-red-300">
                      {passwordError()}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-sm text-red-300">{formError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-base font-medium shadow-lg"
                  disabled={!formIsValid() || submitting}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : "Sign In"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col border-t border-slate-700 pt-6">
              <p className="text-sm text-slate-300 text-center mb-4">
                Don't have an account?{" "}
                <Link 
                  to={`/signup${location.search}`} 
                  className="text-blue-300 hover:text-blue-200 hover:underline font-medium"
                >
                  Create an account
                </Link>
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                <span>SSL Secure</span>
                <span>•</span>
                <span>GDPR Compliant</span>
                <span>•</span>
                <span>2FA Ready</span>
              </div>
            </CardFooter>
          </Card>

          {/* URL Preview - Only when creating new */}
          {createNew && (
            <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl border border-slate-700 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <LinkIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Ready to Shorten!</h3>
                  <p className="text-sm text-slate-300">After login, we'll create a short link for:</p>
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

export default LoginPage;