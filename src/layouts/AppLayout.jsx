import Header from "@/components/header";
import React from "react";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>
      
      <Header />
      <main className="relative container mx-auto px-4 py-8 pt-24"> {/* Added pt-24 for fixed header space */}
        <Outlet />
      </main>
      <footer className="relative p-6 text-center border-t border-slate-300 bg-white/80 backdrop-blur-sm mt-10">
        <p className="text-sm text-slate-600">Made with 💖 by Rut</p>
      </footer>
    </div>
  );
};

export default AppLayout;