// App.jsx - UPDATED with separate pages
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import Landing from "./pages/landing";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";
import Signup from "./pages/signup";
import CreateLink from "./pages/CreateLink";  // Renamed from link.jsx
import EditLink from "./pages/EditLink";      // New page
import QrCodePage from "./pages/QrCodePage";  // New page
import Analytics from "./pages/Analytics";    // Your existing analytics
import RedirectLink from "./pages/redirect-link";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: ":id",
        element: <RedirectLink />,
      },
    ],
  },
  {
    // Protected routes
    element: <AppLayout><ProtectedRoute /></AppLayout>,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "link",
        element: <CreateLink />,  // Create new link
      },
      {
        path: "link/:id/edit",
        element: <EditLink />,    // Edit existing link
      },
      {
        path: "qr/:id",
        element: <QrCodePage />,  // QR code page
      },
      {
        path: "analytics/:id",
        element: <Analytics />,  // Analytics page with real data
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;