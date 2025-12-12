import Header from "@/components/header";
import React from "react";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main className="container mx-auto px-4 pt-24"> {/* Added pt-24 for fixed header space */}
        <Outlet />
      </main>
      <footer className="p-10 text-center bg-gray-800 text-white mt-10">
        Made with 💖 by Rut
      </footer>
    </div>
  );
};

export default AppLayout;