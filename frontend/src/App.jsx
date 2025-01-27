import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();

  const { theme } = useThemeStore();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerStyle={{ top: 30, right: 50 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#FFFFFF",
            color: "#1F2937",
            border: "2px solid transparent",
            boxShadow: "0 12px 24px -6px rgba(0, 0, 0, 0.15)",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "380px",
          },
          success: {
            iconTheme: { primary: "#059669", secondary: "#FFFFFF" },
            style: {
              background: "#059669",
              color: "#FFFFFF",
              border: "2px solid #047857",
            },
          },
          error: {
            iconTheme: { primary: "#FFFFFF", secondary: "#EF4444" },
            style: {
              background: "#EF4444",
              color: "#FFFFFF",
              border: "2px solid #DC2626",
            },
          },
          loading: {
            iconTheme: { primary: "#6366F1", secondary: "#FFFFFF" },
            style: {
              background: "#6366F1",
              color: "#FFFFFF",
              border: "2px solid #4F46E5",
            },
          },
        }}
      />
    </div>
  );
};

export default App;
