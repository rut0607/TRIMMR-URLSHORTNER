import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LogOut, 
  Link as LinkIcon, 
  User, 
  Home, 
  PlusCircle, 
  BarChart3,
  Settings,
  QrCode,
  Sparkles,
  ChevronDown,
  Globe,
  Zap
} from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    if (!user?.email) return "User";
    return user.email.split('@')[0];
  };

  // Show loading state
  if (loading) {
    return (
      <nav className="py-4 px-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 shadow-sm fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-white/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl animate-pulse"></div>
            <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="animate-pulse bg-slate-200 w-28 h-10 rounded-full"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="py-3 px-4 md:px-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 shadow-sm fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-white/80">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
              Trimmr
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">Shorten URLs, Amplify Impact</p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2 md:gap-4">
          {!user ? (
            <>
              {/* Landing Navigation */}
              <nav className="hidden md:flex items-center gap-6 mr-4">
                <a href="#features" className="text-slate-700 hover:text-blue-600 text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-slate-700 hover:text-blue-600 text-sm font-medium transition-colors">
                  Pricing
                </a>
                <a href="#analytics" className="text-slate-700 hover:text-blue-600 text-sm font-medium transition-colors">
                  Analytics
                </a>
                <a href="#faq" className="text-slate-700 hover:text-blue-600 text-sm font-medium transition-colors">
                  FAQ
                </a>
              </nav>

              <button
                onClick={() => navigate("/")}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors hidden sm:block"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-slate-700 hover:text-slate-900 text-sm font-medium transition-colors"
              >
                Sign In
              </button>
              
              <button
                onClick={() => navigate("/signup")}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                Get Started Free
              </button>
            </>
          ) : (
            <>
              {/* User Navigation */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 group"
                >
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  Dashboard
                </button>
                
                <button
                  onClick={() => navigate("/link")}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 ml-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Link
                </button>
              </div>

              {/* Mobile Menu Button for Create Link */}
              <button
                onClick={() => navigate("/link")}
                className="md:hidden p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md"
                title="Create Link"
              >
                <PlusCircle className="w-5 h-5" />
              </button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="relative">
                      <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                        <AvatarImage 
                          src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                          alt={getDisplayName()}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium text-slate-900">{getDisplayName()}</span>
                      <span className="text-xs text-slate-500">Pro Member</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                  </div>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-64 border-slate-200 shadow-xl rounded-xl">
                  <DropdownMenuLabel className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-blue-100">
                        <AvatarImage 
                          src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                          alt={getDisplayName()}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{getDisplayName()}</p>
                        <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                            <Zap className="w-3 h-3 mr-1" />
                            Pro Plan
                          </span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator className="bg-slate-100" />
                  
                  <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                    <Link to="/dashboard" className="flex items-center w-full">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Dashboard</p>
                        <p className="text-xs text-slate-500">View all your links</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                    <Link to="/link" className="flex items-center w-full">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <LinkIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Create Link</p>
                        <p className="text-xs text-slate-500">Shorten a new URL</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                    <Link to="/analytics" className="flex items-center w-full">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Globe className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Analytics</p>
                        <p className="text-xs text-slate-500">View performance</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                    <Link to="/qr" className="flex items-center w-full">
                      <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <QrCode className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">QR Codes</p>
                        <p className="text-xs text-slate-500">Generate QR codes</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-slate-100" />
                  
                  <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                    <Link to="/settings" className="flex items-center w-full">
                      <div className="p-2 bg-slate-100 rounded-lg mr-3">
                        <Settings className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Settings</p>
                        <p className="text-xs text-slate-500">Account & preferences</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="p-3 cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-700"
                  >
                    <div className="flex items-center w-full">
                      <div className="p-2 bg-red-100 rounded-lg mr-3">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Logout</p>
                        <p className="text-xs text-red-500">Sign out of your account</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;