import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
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

axios.defaults.baseURL = "http://localhost:3000";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoggedIn(await fetchAccessToken());
      setIsLoading(false);
    };
    fetchToken();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="container mt-5">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile/:id?" element={<Profile />} />
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/profile" /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
