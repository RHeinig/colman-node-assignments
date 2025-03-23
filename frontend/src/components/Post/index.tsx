import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { z } from "zod";
import { BACKEND_URL } from "../../App";
import GlobalContext from "../../contexts/global";

interface PostProps {
    post: {
        _id: string;
        message: string;
        userId: {
            _id: string;
            username: string;
            name: string;
            email: string;
            picture: string;
        };
        likes: string[];
        imageUrl?: string;
    };
    onDelete: (postId: string) => void;
    onUpdate?: (
        postId: string,
        updatedPost: { message: string; imageUrl?: string }
    ) => void;
}

interface Comment {
    _id: string;
    postId: string;
    userId: {
        _id: string;
        username: string;
        name: string;
        email: string;
        picture: string;
    };
    content: string;
    createdAt: string;
}

const commentSchema = z.object({
    content: z.string().min(1),
});

type CommentFormInputs = z.infer<typeof commentSchema>;

const Post: React.FC<PostProps> = ({ post, onDelete, onUpdate }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const { user } = useContext(GlobalContext);
    const [likes, setLikes] = useState<string[]>(post.likes);
    const [showComments, setShowComments] = useState<boolean>(false);
    const [commentForm, setCommentForm] = useState<CommentFormInputs>({
        content: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState(post.message);
    const [editedImage, setEditedImage] = useState<File | null>(null);
    const [displayMessage, setDisplayMessage] = useState(post.message);
    const [displayImageUrl, setDisplayImageUrl] = useState<string | undefined>(
        post.imageUrl
    );

    const [commentPosted, setCommentPosted] = useState(false);
    const [commentError, setCommentError] = useState<string | null>(null);


    useEffect(() => {
        const fetchComments = async () => {
            const response = await axios.get(`/comment?post_id=${post._id}`);
            setComments(response.data);
        };

        fetchComments();
    }, [post._id]);

    useEffect(() => {
        setDisplayMessage(post.message);
        setDisplayImageUrl(post.imageUrl);
    }, [post.message, post.imageUrl]);

  const handleCommentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentForm({ content: e.target.value });
    setCommentError(null);
  };

  const handleCommentFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Check if the comment is empty
    if (commentForm.content.trim().length === 0) {
      setCommentError("The comment must not be empty");
      return;
    }

    try {
      const response = await axios.post(`/comment`, {
        postId: post._id,
        content: commentForm.content,
      });
      setComments([...comments, response.data]);
      setCommentForm({ content: "" });
      setCommentPosted(true);
      setTimeout(() => {
        setCommentPosted(false);
      }, 3000);
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post the comment");
    }
  };

    const handleLike = async () => {
        const response = await axios.post(`/post/${post._id}/like`);
        setLikes(response.data.likes);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/post/${post._id}`);
            onDelete(post._id);
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete the post");
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            handleSave();
        } else {
            setIsEditing(true);
            setEditedMessage(displayMessage);
            setEditedImage(null);
            setDisplayImageUrl(displayImageUrl);
        }
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append("message", editedMessage);

            if (editedImage) {
                formData.append("image", editedImage);
            }

            const response = await axios.put(`/post/${post._id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setDisplayMessage(response.data.message);
            setDisplayImageUrl(
                response.data.imageUrl ? `${BACKEND_URL}${response.data.imageUrl}` : ""
            );

            setIsEditing(false);
            setEditedImage(null);

            if (onUpdate) {
                onUpdate(post._id, {
                    message: response.data.message,
                    imageUrl: response.data.imageUrl,
                });
            }

        } catch (error) {
            console.error("Error updating post:", error);
            alert("Failed to update the post");
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditedImage(file);
            setDisplayImageUrl(URL.createObjectURL(file));
        }
    };

    console.log(user?._id, post.userId._id, user?._id === post.userId._id);

    return (
        <>
      <style>
        {`
          .like-comment-btn {
            background: none;
            border: none;
            padding: 5px 10px;
            font-size: 14px;
            font-weight: 600;
            color: #65676b;
            text-decoration: none;
            transition: color 0.2s ease, transform 0.1s ease;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .like-comment-btn:hover {
            color: #1877f2;
            transform: scale(1.05);
          }

          .like-comment-btn i {
            font-size: 16px;
          }

          .like-comment-btn.liked {
            color: #1877f2;
          }

          .like-comment-btn.liked:hover {
            color: #145dbf;
          }

          .comment-btn {
            transition: background-color 0.5s ease, color 0.5s ease;
          }

          .comment-btn.posted {
            background-color: #28a745;
            border-color: #28a745;
            color: white;
            transition: background-color 0.5s ease, color 0.5s ease;
          }

          .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }
        `}
      </style>
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h6 className="card-title mb-0 fw-bold">
                {post.userId.name || post.userId.email}
              </h6>
            </div>
            {user?._id === post.userId._id && (
              <div className="d-flex gap-2">
                <button onClick={handleDelete} className="btn btn-danger btn-sm">
                  Delete
                </button>
                <button
                  onClick={handleEditToggle}
                  className={`btn btn-sm ${
                    isEditing ? "btn-success" : "btn-warning"
                  }`}
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card-body">
          {isEditing ? (
            <textarea
              className="form-control mb-3"
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
            />
          ) : (
            <p className="card-text mb-3">{displayMessage}</p>
          )}

          {isEditing && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control mb-3"
            />
          )}

          {displayImageUrl && (
            <img
              src={displayImageUrl}
              alt="Post"
              className="img-fluid rounded mb-3"
              style={{ maxHeight: "400px", width: "auto" }}
            />
          )}

          <div className="d-flex gap-2 mb-2">
            <button
              onClick={handleLike}
              className={`like-comment-btn d-flex align-items-center gap-1 ${
                user && likes.includes(user._id) ? "liked" : ""
              }`}
            >
              <i className="bi bi-hand-thumbs-up"></i>
              <span className="ms-1">{likes.length}</span>
            </button>
            <button
              onClick={() => setShowComments(true)}
              className="like-comment-btn d-flex align-items-center gap-1"
            >
              <i className="bi bi-chat"></i>
              <span className="ms-1">{comments.length}</span>
            </button>
          </div>

          <form onSubmit={handleCommentFormSubmit} className="d-flex gap-2 mt-2 flex-column">
            <div className="d-flex gap-2 w-100">
              <input
                type="text"
                value={commentForm.content}
                onChange={handleCommentFormChange}
                className="form-control"
              />
              <button
                type="submit"
                className={`btn btn-primary btn-sm d-flex align-items-center gap-1 comment-btn ${
                  commentPosted ? "posted" : ""
                }`}
              >
                {commentPosted ? (
                  <>
                    <i className="bi bi-check-circle me-1"></i> Comment Posted!
                  </>
                ) : (
                  <>
                    Add Comment
                  </>
                )}
              </button>
                        </div>
                        {commentError && (
              <div className="error-message">{commentError}</div>
            )}
          </form>
                    <div className="mt-2">
            <Modal show={showComments} onHide={() => setShowComments(false)}centered
                        size="lg">
              <Modal.Header closeButton style={{
                                backgroundColor: "#0d6efd",
                                color: "white",
                                border: "none"
                            }}>
                <Modal.Title>
                                <i className="bi bi-chat-square-text me-2"></i>
                  Comments({comments.length})
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ padding: 0 }}>
                {comments.length > 0 ? (
                  <div style={{ padding: "12px", maxHeight: "400px", overflowY: "auto" }}>
                                    {comments.map((comment) => (
                    <div
                      key={comment._id}
                      style={{
                                                marginBottom: "12px",
                                                padding: "12px",
                                                backgroundColor: "white",
                    borderLeft: "3px solid #0d6efd",
                      borderRadius: "4px",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                                transition: "transform 0.2s"
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <span style={{ fontWeight: "bold" }}>
                        {comment?.userId?.name || comment?.userId?.username || comment?.userId?.email}
                                                    </span>
                                                </div>
                                                <small style={{ color: "#6c757d" }}>
                      {comment.createdAt && new Date(comment.createdAt).toLocaleString()}
                                                </small>
                                            </div>
                      <p style={{ margin: 0, whiteSpace: "pre-line" }}>{comment.content}</p>
                    </div>
                  ))}
                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "48px 0" }}>
                                    <i className="bi bi-chat-square" style={{ fontSize: "2rem", color: "#6c757d", display: "block", marginBottom: "12px" }}></i>
                  <p style={{ color: "#6c757d" }}>No comments yet. Be the first to comment!</p>
                                </div>
                )}
              </Modal.Body>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;