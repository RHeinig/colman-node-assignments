import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BACKEND_URL } from "../../App";
import Post from "../../components/Post";
import GlobalContext from "../../contexts/global";

interface PostData {
  _id: string;
  message: string;
  likes: string[];
  userId: string;
  imageUrl?: string;
}

const postSchema = z.object({
  message: z.string().min(1),
});

type PostFormInputs = z.infer<typeof postSchema>;

const getImageUrl = (picturePath?: string) => {
  if (!picturePath) {
    return "";
  }
  if (picturePath.startsWith("https://")) {
    return picturePath;
  }
  if (picturePath.startsWith("/uploads/")) {
    return `${BACKEND_URL}${picturePath}`;
  }
  return "";
};

const Home: React.FC = () => {
  const [, setPosts] = useState<PostData[]>([]);
  const [allPosts, setAllPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [limit] = useState(10);
  const [showOnlyMyPosts, setShowOnlyMyPosts] = useState(false);
  const { user } = useContext(GlobalContext);
  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormInputs>({
    resolver: zodResolver(postSchema),
  });

  const [isBottom, setIsBottom] = useState(false);

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;

    const reachedBottom = windowHeight + scrollTop >= documentHeight - 100;

    if (reachedBottom && !loading) {
      setIsBottom(true);
    } else {
      setIsBottom(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isBottom && !loading) {
      setStart((prevStart) => prevStart + limit);
    }
  }, [isBottom, limit, loading]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/post/?start=${start}&limit=${limit}${
            showOnlyMyPosts && user ? `&sender=${user._id}` : ""
          }`
        );
        const newPosts = response.data;
        setPosts(newPosts);
        // Only append new posts if they aren't already in allPosts
        setAllPosts((prevAllPosts) => {
          const existingIds = new Set(prevAllPosts.map((p) => p._id));
          const uniqueNewPosts = newPosts.filter(
            (post: PostData) => !existingIds.has(post._id)
          );
          return [...prevAllPosts, ...uniqueNewPosts];
        });
      } catch (err) {
        setError("Failed to fetch posts");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [start, showOnlyMyPosts, user, limit]);

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  const onSubmit = async (data: PostFormInputs) => {
    try {
      const postData: any = { ...data };
      const response = await axios.post("/post", postData);

      if (response.status === 201) {
        const post = response.data;
        if (selectedImage) {
          const formData = new FormData();
          formData.append("image", selectedImage);
          formData.append("postId", response.data._id);
          const responseWithImage = await axios.post(
            "/post/upload-image",
            formData
          );
          post.imageUrl = responseWithImage.data.imageUrl;
        }
        setAllPosts((prevAllPosts) => [post, ...prevAllPosts]);
        setPosts((prevPosts) => [post, ...prevPosts]);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post");
    }
  };

  const handlePostDelete = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    setAllPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  return (
    <div className="container py-4">
      <h1 className="display-4 mb-4">Home Feed</h1>
      <div className="mb-3">
        <button
          className={`btn ${showOnlyMyPosts ? "btn-primary" : "btn-secondary"}`}
          onClick={() => {
            setShowOnlyMyPosts((prev) => !prev);
            setStart(0);
            setPosts([]);
            setAllPosts([]);
          }}
        >
          {showOnlyMyPosts ? "Show All Posts" : "Show Only My Posts"}
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedImage(file);
              }
            }}
          />
          {selectedImage && (
            <div className="mt-3">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Post"
                className="img-fluid rounded"
                style={{ maxHeight: "400px", width: "auto" }}
              />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <textarea
                className="form-control"
                placeholder="What's on your mind?"
                rows={3}
                {...register("message")}
              />
              {errors.message && (
                <div className="text-danger mt-1">{errors.message.message}</div>
              )}
            </div>
            <button type="submit" className="btn btn-primary">
              Add Post
            </button>
          </form>
          <button
            className="btn btn-secondary mt-2"
            onClick={() => {
              axios
                .post("/post/generate-post-suggestion", {
                  prompt: getValues("message") || "What's on your mind?",
                })
                .then((res) => {
                  setValue("message", res.data.post);
                });
            }}
          >
            Generate Post Suggestion
          </button>
        </div>
      </div>

      <div className="row g-4">
        {allPosts.map((post) => (
          <div key={post._id} className="col-12">
            <Post
              post={{
                _id: post._id,
                message: post.message,
                likes: post.likes,
                userId: post.userId,
                imageUrl: getImageUrl(post.imageUrl),
              }}
              onDelete={handlePostDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;