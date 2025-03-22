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
import GlobalContext, { User } from "./contexts/global";
import Home from "./pages/Home";

axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;
export const BACKEND_URL = "http://localhost:3000";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  useEffect(() => {
    const fetchToken = async () => {
      setIsLoggedIn(await fetchAccessToken());
      setIsLoading(false);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      axios.get("/user").then((res) => {
        setUser(res.data);
      });
    }
  }, [isLoggedIn]);

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
    <GlobalContext.Provider value={{ user, setUser }}>
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
          <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </GlobalContext.Provider>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;