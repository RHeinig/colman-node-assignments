import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaPencilAlt as Pencil } from "react-icons/fa";
import GlobalContext from "../../contexts/global";
import { BACKEND_URL } from "../../App";
import Post from "../../components/Post";

interface Profile {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface PostData {
  _id: string;
  message: string;
  likes: string[];
  userId: string;
  imageUrl?: string;
}

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile>();
  const [picture, setPicture] = useState<string>("");
  const [userPosts, setUserPosts] = useState<PostData[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string>();
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(GlobalContext);

  const getUserPicture = (picturePath: string) => {
    if (!picturePath) {
      return "/default_profile.png";
    }
    // Google images
    if (picturePath.startsWith("https://")) {
      return picturePath;
    } else {
      // Local images
      if (picturePath.startsWith("/uploads/")) {
        return `${BACKEND_URL}${picturePath}`;
      }
    }

    return "";
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const formData = new FormData();
      formData.append("updatedUser", JSON.stringify({ name }));

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await axios.put(`/user/${profile?._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setProfile((prev) => (prev ? { ...prev, name } : prev));
        if (selectedFile) {
          const updatedUser = await axios.get(`/user/${profile?._id}`);
          setPicture(updatedUser.data.profileImage || "/default_profile.png");
          setSelectedFile(null);
        }

        setIsEditing(false);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to update profile");
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleUsernameChange = (
    newName: React.ChangeEvent<HTMLInputElement>
  ) => {
    setName(newName.target.value);
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setPicture(imageUrl);
    }
  };

  const getImageUrl = (picturePath?: string) => {
    if (!picturePath) {
      return "";
    }
    if (picturePath.startsWith("https://")) {
      return picturePath;
    } else {
      if (picturePath.startsWith("/uploads/")) {
        return `${BACKEND_URL}${picturePath}`;
      }
    }

    return "";
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/user/${id || ""}`);
        setProfile(response.data);
        setName(response.data.name);
        setPicture(getUserPicture(response.data.picture));
        if (response.data?.tokens) {
          setUser(response.data);
          setIsOwner(true);
          getUserPosts(response.data._id);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate("/login");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    const getUserPosts = async (_id: string) => {
      try {
        const response = await axios.get(`/post?sender=${_id}`);
        setUserPosts(response.data);
      } catch (err) {
        setError("Failed to fetch posts");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate, setUser]);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="alert alert-warning mt-5">No user found</div>;
  }

  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-4">Profile</h1>
      <div className="position-relative d-inline-block mb-4">
        <img
          src={picture}
          alt="Profile"
          className={`rounded-circle mb-3 ${isEditing ? "opacity-75" : ""}`}
          style={{
            width: "150px",
            height: "150px",
            objectFit: "cover",
            transition: "opacity 0.3s",
          }}
        />
        {isEditing && (
          <div
            className="position-absolute"
            style={{
              bottom: "0",
              right: "0",
              backgroundColor: "#007bff",
              borderRadius: "50%",
              padding: "5px",
              cursor: "pointer",
            }}
          >
            <Pencil size={18} color="white" />
            <input
              type="file"
              accept="image/*"
              onChange={handlePictureChange}
              className="form-control-file position-absolute"
              style={{
                bottom: "0",
                right: "0",
                width: "40px",
                height: "40px",
                opacity: 0,
                cursor: "pointer",
              }}
            />
          </div>
        )}
      </div>

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong className="text-start w-25 me-3">ID:</strong>
              <span className="text-start w-75 ms-3">{profile._id}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong className="text-start w-25 me-3">Name:</strong>
              {isOwner && isEditing && (
                <input
                  type="text"
                  value={name}
                  onChange={handleUsernameChange}
                  readOnly={!isEditing}
                  className="form-control text-start ms-3"
                  style={{ width: "400px" }}
                />
              )}
              {!isEditing && (
                <span className="text-start w-75 ms-3">{profile.name}</span>
              )}
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong className="text-start w-25 me-3">Email:</strong>
              <span className="text-start w-75 ms-3">{profile.email}</span>
            </div>
          </div>
        </div>
      </div>
      {isOwner && (
        <button
          className="btn btn-primary btn-sm mt-3"
          onClick={isEditing ? handleSaveClick : handleEditClick}
        >
          {isEditing ? "Save" : "Edit"}
        </button>
      )}

      <hr className="my-4" />

      <h1 className="mb-4">User's Posts</h1>

      <div className="row g-4">
        {userPosts.map((post, index) => (
          <div key={index} className="col-12">
            <Post
              post={{
                _id: post._id,
                message: post.message,
                likes: post?.likes,
                userId: post?.userId,
                imageUrl: getImageUrl(post?.imageUrl),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
