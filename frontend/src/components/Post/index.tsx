import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { z } from "zod";
import { User } from "../../contexts/global";
import GlobalContext from "../../contexts/global";
import Modal from "react-bootstrap/Modal";
import { BACKEND_URL } from "../../App";

interface PostProps {
  post: {
    _id: string;
    message: string;
    userId: string;
    likes: string[];
    imageUrl?: string;
  };
  onDelete: (postId: string) => void;
  onUpdate?: (postId: string, updatedPost: { message: string; imageUrl?: string }) => void;
}

interface Comment {
  _id: string;
  postId: string;
  userId: string;
  content: string;
}

const commentSchema = z.object({
  content: z.string().min(1),
});

type CommentFormInputs = z.infer<typeof commentSchema>;

const Post: React.FC<PostProps> = ({ post, onDelete, onUpdate }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const { user } = useContext(GlobalContext);
  const [likes, setLikes] = useState<string[]>(post.likes);
  const [author, setAuthor] = useState<User>();
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentForm, setCommentForm] = useState<CommentFormInputs>({ content: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(post.message);
  const [editedImage, setEditedImage] = useState<File | null>(null);
  const [displayMessage, setDisplayMessage] = useState(post.message);
  const [displayImageUrl, setDisplayImageUrl] = useState<string | undefined>(post.imageUrl);

  useEffect(() => {
    const fetchComments = async () => {
      const response = await axios.get(`/comment?post_id=${post._id}`);
      setComments(response.data);
    };
    const fetchAuthor = async () => {
      if (post.userId) {
        const response = await axios.get(`/user/${post.userId}`);
        setAuthor(response.data);
      }
    };
    fetchComments();
    fetchAuthor();
  }, [post._id, post.userId]);

  useEffect(() => {
    setDisplayMessage(post.message);
    setDisplayImageUrl(post.imageUrl);
  }, [post.message, post.imageUrl]);

  const handleCommentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentForm({ content: e.target.value });
  };

  const handleCommentFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await axios.post(`/comment`, {
      postId: post._id,
      content: commentForm.content,
    });
    setComments([...comments, response.data]);
    setCommentForm({ content: "" });
  };

  const handleLike = async () => {
    const response = await axios.post(`/post/${post._id}/like`);
    setLikes(response.data.likes);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/post/${post._id}`);
      onDelete(post._id);
      alert("Post deleted successfully");
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
      setDisplayImageUrl(response.data.imageUrl ? `${BACKEND_URL}${response.data.imageUrl}` : "");

      setIsEditing(false);
      setEditedImage(null);

      if (onUpdate) {
        onUpdate(post._id, {
          message: response.data.message,
          imageUrl: response.data.imageUrl,
        });
      }

      alert("Post updated successfully");
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

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-white border-bottom py-3">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="card-title mb-0 fw-bold">
              {author?.name || author?.email}
            </h6>
          </div>
          {user && user._id === post.userId && (
            <div className="d-flex gap-2">
              <button onClick={handleDelete} className="btn btn-danger btn-sm">
                Delete
              </button>
              <button
                onClick={handleEditToggle}
                className={`btn btn-sm ${isEditing ? "btn-success" : "btn-warning"}`}
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

        <div className="d-flex gap-2">
          <span>Likes: {likes.length}</span>
          <span>Comments: {comments.length}</span>
        </div>

        <div className="d-flex gap-2">
          <button
            onClick={handleLike}
            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
          >
            {user && likes.includes(user._id) ? "Unlike" : "Like"}
          </button>
        </div>
        <form onSubmit={handleCommentFormSubmit} className="d-flex gap-2 mt-2">
          <input
            type="text"
            value={commentForm.content}
            onChange={handleCommentFormChange}
            className="form-control"
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
          >
            Add Comment
          </button>
        </form>
        <div className="mt-2">
          <button
            onClick={() => setShowComments(true)}
            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
          >
            Show Comments
          </button>
          <Modal show={showComments} onHide={() => setShowComments(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Comments</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {comments.map((comment) => (
                <div key={comment._id}>{comment.content}</div>
              ))}
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Post;