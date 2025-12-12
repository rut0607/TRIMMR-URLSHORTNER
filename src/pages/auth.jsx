import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  BarChart3, 
  Lock, 
  Link as LinkIcon, 
  Globe,
  CheckCircle,
  Sparkles
} from "lucide-react";

// local page components
import Login from "./login";
import Signup from "./signup";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const createNew = searchParams.get("createNew") ?? "";
  const [activeTab, setActiveTab] = useState("login");

  const handleAuthSuccess = () => {
    if (createNew) {
      navigate(`/link?url=${encodeURIComponent(createNew)}`);
    } else {
      navigate("/dashboard");
    }
  };

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Lightning Fast",
      description: "Instant URL shortening with 99.9% uptime",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Detailed Analytics",
      description: "Track clicks, locations, and referral sources",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Custom URLs",
      description: "Create branded, memorable short links",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security protection",
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Header Section - Clean and Centered */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-md">
              <LinkIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              URLShortner
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Shorten URLs, track clicks, and analyze traffic with our powerful platform
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Features Grid */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
                    <div className={feature.color}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Trusted by Thousands
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-blue-100 text-sm">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">1M+</div>
                  <div className="text-blue-100 text-sm">URLs Shortened</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">99.9%</div>
                  <div className="text-blue-100 text-sm">Uptime</div>
                </div>
              </div>
            </div>

            {/* URL Preview - Only when creating new */}
            {createNew && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <LinkIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ready to Shorten Your URL!</h3>
                    <p className="text-sm text-gray-600">After signing in, we'll create a short link for:</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm font-mono text-gray-800 break-all">{createNew}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Auth Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                {/* Tab Headers */}
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab("login")}
                      className={`flex-1 py-4 text-center font-medium transition-colors ${
                        activeTab === "login"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setActiveTab("signup")}
                      className={`flex-1 py-4 text-center font-medium transition-colors ${
                        activeTab === "signup"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {activeTab === "login" ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-gray-600">
                      {activeTab === "login"
                        ? "Sign in to manage your URLs"
                        : "Sign up to start shortening URLs"}
                    </p>
                  </div>

                  {activeTab === "login" ? (
                    <Login onSuccess={handleAuthSuccess} createNew={createNew} />
                  ) : (
                    <Signup onSuccess={handleAuthSuccess} createNew={createNew} />
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-600">
                    By continuing, you agree to our{" "}
                    <a href="#" className="text-blue-600 hover:underline font-medium">Terms</a> and{" "}
                    <a href="#" className="text-blue-600 hover:underline font-medium">Privacy</a>
                  </p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>SSL Secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;