import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { setCookie } from "../../utils/auth";
import { useGoogleLogin } from "@react-oauth/google";

const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
}

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await axios.post("/user/login", data);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.accessToken}`;

      setIsLoggedIn(true);

      setCookie("refreshToken", response.data.refreshToken, 7);
      navigate("/home", { replace: true });
    } catch (error) {
      setErrorMessage("Login failed. Please check your username and password.");
      console.error("Login failed", error);
    }
  };

  const googleLogin = useGoogleLogin({
    onError: () => {
      setErrorMessage("Google login failed. Please try again.");
    },
    flow: "auth-code",
    ux_mode: "redirect",
    redirect_uri: "https://node81.cs.colman.ac.il/login",
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");

    if (code) {
      try {
        axios.post("/user/google/login", {
          code: code,
        }).then((response) => {
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.accessToken}`;
          setIsLoggedIn(true);
          setCookie("refreshToken", response.data.refreshToken, 7);
          navigate("/home");
        });
      } catch (error) {
        setErrorMessage("Google login failed. Please try again.");
        console.error("Google login failed", error);
      }
    }
  }, [navigate, setIsLoggedIn, location, googleLogin]);

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            autoComplete="username"
            className="form-control"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-danger">{errors.username.message}</p>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            className="form-control"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-danger">{errors.password.message}</p>
          )}
        </div>
        {errorMessage && <p className="text-danger">{errorMessage}</p>}
        <button type="submit" className="btn btn-primary">
          Login
        </button>
        <div className="mt-3">
          <button className="btn btn-secondary" type="button" onClick={() => googleLogin()}>
            Login with Google
          </button>
        </div>{" "}
      </form>
      <button
        className="btn btn-link mt-3"
        onClick={() => navigate("/register")}
      >
        Register
      </button>
    </div>
  );
};

export default Login;
