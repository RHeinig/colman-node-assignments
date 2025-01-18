import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  email: string;
}

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();
  const naviage = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/user/${id || ""}`);
        setUser(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          naviage("/login");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5">Error: {error}</div>;
  }

  if (!user) {
    return <div className="alert alert-warning mt-5">No user found</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Profile</h1>
      <p>
        <strong>ID:</strong> {user._id}
      </p>
      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
    </div>
  );
};

export default Profile;
