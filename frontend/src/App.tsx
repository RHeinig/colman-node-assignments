import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import { fetchAccessToken } from "./utils/auth";
import GlobalContext, { User } from "./contexts/global";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";

axios.defaults.baseURL = "https://node81.cs.colman.ac.il";
axios.defaults.withCredentials = true;
export const BACKEND_URL = "https://node81.cs.colman.ac.il";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoggedIn(await fetchAccessToken());
      setIsLoading(false);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    }
  }, [user]);

  useEffect(() => {
    if (isLoggedIn) {
      axios.get("/user").then((res) => {
        setUser(res.data);
      });
    }
  }, [isLoggedIn]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <GlobalContext.Provider value={{ user, setUser }}>
      <div className="app-wrapper">
        <Navbar />
        <div className="content-wrapper">
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