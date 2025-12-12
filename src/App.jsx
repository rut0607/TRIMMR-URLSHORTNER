// App.jsx - UPDATED with separate login/signup
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import Landing from "./pages/landing";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";      // Separate login page
import Signup from "./pages/signup";    // Separate signup page
import Link from "./pages/Link";
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
        path: "login",      // Separate login route
        element: <Login />,
      },
      {
        path: "signup",     // Separate signup route
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
        path: "link/:id?",
        element: <Link />,
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