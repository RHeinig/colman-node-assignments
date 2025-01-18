import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    username: z.string(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormInputs = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      await axios.post("/user/register", {
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password,
      });
      navigate("/login");
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input className="form-control" {...register("name")} />
          {errors.name && <p className="text-danger">{errors.name.message}</p>}
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" {...register("email")} />
          {errors.email && (
            <p className="text-danger">{errors.email.message}</p>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input className="form-control" {...register("username")} />
          {errors.username && (
            <p className="text-danger">{errors.username.message}</p>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-danger">{errors.password.message}</p>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          Register
        </button>
      </form>
      <button className="btn btn-link mt-3" onClick={() => navigate("/login")}>
        Login
      </button>
    </div>
  );
};

export default Register;
