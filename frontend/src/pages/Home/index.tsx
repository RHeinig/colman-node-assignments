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
  const [posts, setPosts] = useState<PostData[]>([]);
  const [allPosts, setAllPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [limit] = useState(10);
  const [showOnlyMyPosts, setShowOnlyMyPosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
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
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const reachedBottom = windowHeight + scrollTop >= documentHeight - 100;

    setIsBottom(reachedBottom && !loading && hasMorePosts);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isBottom && !loading && hasMorePosts) {
      setStart((prev) => prev + limit);
    }
  }, [isBottom, limit, loading, hasMorePosts]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!hasMorePosts) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `/post/?start=${start}&limit=${limit}${
            showOnlyMyPosts && user ? `&sender=${user._id}` : ""
          }`
        );
        const newPosts = response.data;

        if (newPosts.length < limit) {
          setHasMorePosts(false);
        }

        setPosts((prev) => [...prev, ...newPosts]);
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
  }, [start, showOnlyMyPosts, user, limit, hasMorePosts]);

  const onSubmit = async (data: PostFormInputs) => {
    try {
      const postData: any = { ...data };
      const response = await axios.post("/post", postData);

      if (response.status === 201) {
        const post = response.data;
        if (selectedImage) {
          const formData = new FormData();
          formData.append("image", selectedImage);
          formData.append("postId", post._id);
          const responseWithImage = await axios.post("/post/upload-image", formData);
          post.imageUrl = responseWithImage.data.imageUrl;
        }
        setPosts((prev) => [post, ...prev]);
        setAllPosts((prev) => [post, ...prev]);
        setValue("message", ""); // Reset form
        setSelectedImage(null); // Clear image
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post");
    }
  };

  const handlePostDelete = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
    setAllPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-danger shadow-lg p-4" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <h1 className="display-4 mb-5 text-center fw-bold text-primary">
            Home Feed
          </h1>

          <div className="mb-4 d-flex justify-content-end">
            <button
              className={`btn btn-lg ${
                showOnlyMyPosts ? "btn-primary" : "btn-outline-primary"
              } shadow-sm`}
              onClick={() => {
                setShowOnlyMyPosts((prev) => !prev);
                setStart(0);
                setPosts([]);
                setAllPosts([]);
                setHasMorePosts(true);
              }}
            >
              {showOnlyMyPosts ? "Show All Posts" : "Show My Posts"}
            </button>
          </div>

          <div className="card mb-5 shadow-lg border-0 rounded-3">
            <div className="card-body p-4">
              <h5 className="card-title mb-4 fw-bold text-secondary">
                Create a Post
              </h5>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <textarea
                    className={`form-control form-control-lg border-2 shadow-sm ${
                      errors.message ? "is-invalid" : ""
                    }`}
                    placeholder="What's on your mind?"
                    rows={4}
                    {...register("message")}
                    disabled={isGenerating}
                  />
                  {errors.message && (
                    <div className="invalid-feedback mt-2">
                      {errors.message.message}
                    </div>
                  )}
                </div>

                <div className="mb-4 d-flex align-items-center gap-3">
                  <label
                    htmlFor="image-upload"
                    className="btn btn-outline-secondary px-4 py-2"
                  >
                    <i className="bi bi-camera me-2"></i>Add Photo
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedImage(file);
                    }}
                    disabled={isGenerating}
                  />
                  {selectedImage && (
                    <span className="text-muted fst-italic">
                      {selectedImage.name.length > 25
                        ? selectedImage.name.substring(0, 22) + "..."
                        : selectedImage.name}
                    </span>
                  )}
                </div>

                {selectedImage && (
                  <div className="position-relative mb-4 shadow-sm rounded-3 overflow-hidden">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Post preview"
                      className="img-fluid w-100"
                      style={{ maxHeight: "400px", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow"
                      onClick={() => setSelectedImage(null)}
                      disabled={isGenerating}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                )}

                <div className="d-flex justify-content-between gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 py-2 flex-grow-1 position-relative"
                    onClick={async () => {
                      setIsGenerating(true);
                      try {
                        const res = await axios.post("/post/generate-post-suggestion", {
                          prompt: getValues("message") || "What's on your mind?",
                        });
                        setValue("message", res.data.post);
                      } catch (err) {
                        console.error("Failed to generate suggestion:", err);
                      } finally {
                        setIsGenerating(false);
                      }
                    }}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-lightbulb me-2"></i>Generate Suggestion
                      </>
                    )}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-5 py-2 flex-grow-1"
                    disabled={isGenerating}
                  >
                    <i className="bi bi-send me-2"></i>Post
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="feed-posts">
            {allPosts.map((post) => (
              <div key={post._id} className="mb-4">
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

          {loading && (
            <div className="d-flex justify-content-center my-5">
              <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {!hasMorePosts && allPosts.length > 0 && (
            <div className="text-center my-5 text-muted fst-italic">
              <i className="bi bi-emoji-smile me-2"></i>You've reached the end!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;