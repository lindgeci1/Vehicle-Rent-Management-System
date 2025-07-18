import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "@/PrivateRoute";
import { AuthProvider } from "./AuthProvider";
import Loading from "./layouts/Loading";
import { SnackbarProvider } from "./crudNotifications"; // ✅ Adjust path if needed


const Dashboard = lazy(() => import("@/layouts/Dashboard"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const Logout = lazy(() => import("@/pages/auth/Logout"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const CreatePassword = lazy(() => import("@/pages/auth/CreatePassword"));

function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/create-password" element={<CreatePassword />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
