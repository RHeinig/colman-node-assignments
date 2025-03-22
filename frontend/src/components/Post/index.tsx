import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { z } from 'zod';
import { User } from '../../contexts/global';
import GlobalContext from '../../contexts/global';
import Modal from 'react-bootstrap/Modal';

interface PostProps {
    post: {
        _id: string;
        message: string;
        userId: string;
        likes: string[];
        imageUrl?: string;
    }
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

const Post: React.FC<PostProps> = ({ post }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const { user } = useContext(GlobalContext);
    const [likes, setLikes] = useState<string[]>(post.likes);
    const [author, setAuthor] = useState<User>();
    const [showComments, setShowComments] = useState<boolean>(false);
    const [commentForm, setCommentForm] = useState<CommentFormInputs>({
        content: '',
    });

    useEffect(() => {
        const fetchComments = async () => {
            const response = await axios.get(`/comment?post_id=${post._id}`);
            setComments(response.data);
        }
        const fetchAuthor = async () => {
            if (post.userId) {
                const response = await axios.get(`/user/${post.userId}`);
                setAuthor(response.data);
            }
        }
        fetchComments();
        fetchAuthor();
    }, []);

    const handleCommentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCommentForm({
            content: e.target.value,
        });
    };

    const handleCommentFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await axios.post(`/comment`, {
            postId: post._id,
            content: commentForm.content,
        });
        setComments([...comments, response.data]);
        setCommentForm({
            content: '',
        });
    }

    const handleLike = async () => {
        const response = await axios.post(`/post/${post._id}/like`);
        setLikes(response.data.likes);
    }

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header bg-white border-bottom py-3">
                <div className="d-flex align-items-center">
                    <div>
                        <h6 className="card-title mb-0 fw-bold">{author?.name || author?.email}</h6>
                    </div>
                </div>
            </div>

            <div className="card-body">
                <p className="card-text mb-3">{post.message}</p>
                {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post" className="img-fluid rounded mb-3" style={{ maxHeight: '400px', width: 'auto' }} />
                )}


                <div className="d-flex gap-2">
                    <span>Likes: {likes.length}</span>
                    <span>Comments: {comments.length}</span>
                </div>

                <div className="d-flex gap-2">
                    <button onClick={handleLike} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
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
                    <button type="submit" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
                        Add Comment
                    </button>
                </form>
                <div className="mt-2">
                    <button onClick={() => setShowComments(true)} className="btn btn-primary btn-sm d-flex align-items-center gap-1">Show Comments</button>
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
