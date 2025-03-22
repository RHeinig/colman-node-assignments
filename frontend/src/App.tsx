import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import { fetchAccessToken, removeCookie } from "./utils/auth";

axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoggedIn(await fetchAccessToken());
      setIsLoading(false);
    };
    fetchToken();
  }, []);

  const handleLogout = async () => {
    try {
      removeCookie("refreshToken");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      {isLoggedIn && (
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="auth/google/callback" element={<Navigate to="/login" />} />
        <Route path="/profile/:id?" element={<Profile />} />
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/profile" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </div>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;