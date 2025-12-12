import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Import AuthContext
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Link as LinkIcon, User, Home, PlusCircle } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth(); // Get user and logout from context

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
      <nav className="py-4 flex justify-between items-center px-6 bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <Link to="/">
          <img src="/logo.png" alt="Trimmr logo" className="h-16" />
        </Link>
        <div className="animate-pulse bg-gray-200 w-24 h-10 rounded"></div>
      </nav>
    );
  }

  return (
    <nav className="py-4 flex justify-between items-center px-6 bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <Link to="/">
        <img src="/logo.png" alt="Trimmr logo" className="h-16" />
      </Link>

      <div className="flex items-center gap-4">
        {!user ? (
          <>
            <Link to="/">
              <button className="px-4 py-2 text-gray-600 hover:text-blue-600 transition">
                <Home className="w-5 h-5" />
              </button>
            </Link>
          
              <button
  onClick={() => navigate("/login")}  // Change from "/auth" to "/login"
  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
>
  Login
</button>
          </>
        ) : (
          <>
            <Link to="/dashboard">
              <button className="px-4 py-2 text-gray-600 hover:text-blue-600 transition">
                Dashboard
              </button>
            </Link>
            
            <Link to="/link">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Create Link
              </button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} />
                  <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs leading-none text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer w-full flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/link" className="cursor-pointer w-full flex items-center">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Create New Link
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-700 cursor-pointer flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;