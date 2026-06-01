import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import PatientDashboard from "./patient/Dashboard";
import PatientCheckIn from "./patient/CheckIn";
import PatientAssistant from "./patient/Assistant";
import DoctorDashboard from "./doctor/Dashboard";
import DoctorPatientDetails from "./doctor/PatientDetails";

function ProtectedRoute({ children, allowedRole }) {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("recover-ai-user")) || null;
  });

  useEffect(() => {
    const syncUser = () => {
      setUser(JSON.parse(localStorage.getItem("recover-ai-user")) || null);
    };
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return user.role === "doctor" ? (
      <Navigate to="/doctor/dashboard" replace />
    ) : (
      <Navigate to="/patient/dashboard" replace />
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public Routing */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Portal Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/checkin"
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientCheckIn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/assistant"
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientAssistant />
              </ProtectedRoute>
            }
          />

          {/* Doctor Portal Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patient/:id"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorPatientDetails />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;