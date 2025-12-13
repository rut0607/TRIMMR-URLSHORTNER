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
    <nav className="py-3 px-4 md:px-6 bg-white border-b border-slate-200 shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Trimmr
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">URL Shortener</p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2 md:gap-4">
          {!user ? (
            <>
              {/* Landing Navigation - Removed features, pricing, analytics, FAQ */}
              <button
                onClick={() => navigate("/")}
                className="p-2 text-slate-600 bg-white border border-slate-300 rounded-lg"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-slate-700 text-sm font-medium border border-slate-300 bg-white rounded-lg"
              >
                Sign In
              </button>
              
              <button
                onClick={() => navigate("/signup")}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-sm"
              >
                Get Started
              </button>
            </>
          ) : (
            <>
              {/* User Navigation */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg font-medium flex items-center gap-2"
                >
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  Dashboard
                </button>
                
                <button
                  onClick={() => navigate("/link")}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 ml-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Link
                </button>
              </div>

              {/* Mobile Menu Button for Create Link */}
              <button
                onClick={() => navigate("/link")}
                className="md:hidden p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-sm"
                title="Create Link"
              >
                <PlusCircle className="w-5 h-5" />
              </button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-2 p-1.5 rounded-full border border-slate-300 bg-white cursor-pointer">
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
                      <span className="text-xs text-slate-500">Free Plan</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                  </div>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-64 border-slate-200 shadow-lg rounded-lg">
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
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator className="bg-slate-100" />
                  
                  <DropdownMenuItem asChild className="p-3 cursor-pointer">
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
                  
                  <DropdownMenuItem asChild className="p-3 cursor-pointer">
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
                  
                  <DropdownMenuSeparator className="bg-slate-100" />
                  
                  <DropdownMenuItem asChild className="p-3 cursor-pointer">
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
                    className="p-3 cursor-pointer text-red-600"
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