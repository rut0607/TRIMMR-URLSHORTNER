import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap, 
  Shield, 
  BarChart3, 
  Sparkles,
  Link as LinkIcon,
  ArrowRight
} from "lucide-react";

const Landing = () => {
  const [longUrl, setLongUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!longUrl.trim()) return;
    navigate(`/login?createNew=${encodeURIComponent(longUrl)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative px-4 py-12">
        {/* Header - Made full width */}
        <header className="flex justify-between items-center mb-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <LinkIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trimmr
            </h1>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </Button>
          </div>
        </header>

        {/* Hero Section - Made full width */}
        <div className="text-center mb-20 px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">The Future of URL Management</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Shorten Links,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Amplify Impact
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Transform long, messy URLs into powerful, trackable links with advanced analytics, 
            custom branding, and QR code generation.
          </p>

          {/* URL Shortener Form - Made full width */}
          <div className="mx-auto mb-16 px-4 sm:px-6 lg:px-8 max-w-6xl">
            <Card className="border-0 bg-white/10 backdrop-blur-lg shadow-2xl max-w-4xl mx-auto">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="url"
                      value={longUrl}
                      placeholder="Paste your long URL here..."
                      className="w-full h-14 bg-white/20 border-white/30 text-white placeholder:text-white/60 text-lg"
                      onChange={(e) => setLongUrl(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold"
                  >
                    Shorten URL
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
                <p className="text-slate-300 text-sm mt-3 text-center">
                  No account needed to try! Create your first link instantly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Grid - Made full width */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 px-4 sm:px-6 lg:px-8">
          <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-xl">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Create short URLs instantly with our high-performance infrastructure. 
                No waiting, no delays.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-xl">Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Track clicks, locations, devices, and referral sources with 
                detailed real-time analytics.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-pink-500/10 to-pink-600/10 backdrop-blur-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-pink-400" />
              </div>
              <CardTitle className="text-xl">Secure & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Enterprise-grade security with SSL encryption and 99.9% uptime 
                guarantee.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer - Made full width */}
        <footer className="mt-20 pt-10 border-t border-white/10 text-center px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Trimmr</span>
            </div>
            <div className="flex gap-6 text-slate-400">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
              <a href="#" className="hover:text-white transition">Support</a>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Trimmr. All rights reserved. Made with ❤️ for the web.
          </p>
        </footer>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Landing;