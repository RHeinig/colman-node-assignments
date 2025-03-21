import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { get, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { setCookie } from "../../utils/auth";

const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await axios.post("/user/login", data);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.accessToken}`;
      setCookie("refreshToken", response.data.refreshToken, 7);
      navigate("/profile");
    } catch (error) {
      setErrorMessage("Login failed. Please check your username and password.");
      console.error("Login failed", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input 
            autoComplete="username"
            className="form-control"
            {...register("username")} />
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
