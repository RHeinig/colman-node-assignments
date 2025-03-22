import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { BACKEND_URL } from '../../App';
import Post from '../../components/Post';
import GlobalContext from '../../contexts/global';

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
    } else {
        if (picturePath.startsWith("/uploads/")) {
            return `${BACKEND_URL}${picturePath}`;
        }
    }

    return "";
};

const Home: React.FC = () => {
    const [posts, setPosts] = useState<PostData[] | undefined>();
    const [allPosts, setAllPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [start, setStart] = useState(0);
    const [limit, setLimit] = useState(10);
    const [showOnlyMyPosts, setShowOnlyMyPosts] = useState(false);
    const { user } = useContext(GlobalContext)
    const {
        register, setValue, getValues,
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

        if (reachedBottom) {
            setIsBottom(true);
        } else {
            setIsBottom(false);
        }
    };


    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (isBottom) {
            setStart(start + limit);
        }
    }, [isBottom]);



    useEffect(() => {
        const fetchPosts = async () => {
            try {
                console.log(`/post/?start=${start}&limit=${limit}${showOnlyMyPosts && user ? `&sender=${user._id}` : ""}`)
                const response = await axios.get(`/post/?start=${start}&limit=${limit}${showOnlyMyPosts && user ? `&sender=${user._id}` : ""}`);
                setPosts(response.data);
            } catch (err) {
                setError('Failed to fetch posts');
                console.error('Error fetching posts:', err);
            } finally {
                setLoading(false);
            }
        };
        if (!posts || posts.length > 0) {
            setLoading(true);
            fetchPosts();
        }
    }, [start, limit, showOnlyMyPosts]);

    useEffect(() => {
        if (posts) {
            setAllPosts([...allPosts, ...posts]);
        }
    }, [posts]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

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

            const response = await axios.post('/post', postData);

            if (response.status === 201) {
                const post = response.data;
                if (selectedImage) {
                    const formData = new FormData();
                    formData.append('image', selectedImage);
                    formData.append('postId', response.data._id);
                    const responseWithImage = await axios.post('/post/upload-image', formData);
                    post.image = responseWithImage.data.imageUrl;
                }
                if (posts) {
                    setPosts([post, ...posts]);
                }
            }
        } catch (error) {
            console.error('Error creating post:', error);
            setError('Failed to create post');
        }
    };

    return (
        <div className="container py-4">
            <h1 className="display-4 mb-4">Feed</h1>
            <div className="mb-3">
                <button className={`btn ${showOnlyMyPosts ? "btn-primary" : "btn-secondary"}`} onClick={() => setShowOnlyMyPosts(prev => {
                    setStart(0)
                    setPosts(undefined)
                    setAllPosts([])
                    return !prev
                })}>
                    {showOnlyMyPosts ? "Show All Posts" : "Show Only My Posts"}
                </button>
            </div>

            <div className="card mb-4 shadow-sm">
                <div className="card-body p-4">
                    <h5 className="card-title mb-3">Create a Post</h5>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <textarea
                                className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                placeholder="What's on your mind?"
                                rows={3}
                                {...register("message")}
                            />
                            {errors.message && (
                                <div className="invalid-feedback">
                                    {errors.message.message}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <div className="d-flex align-items-center">
                                <label htmlFor="image-upload" className="btn btn-outline-secondary me-2">
                                    Add Photo
                                </label>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="d-none"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setSelectedImage(file);
                                        }
                                    }}
                                />

                                {selectedImage && (
                                    <span className="text-muted">
                                        {selectedImage.name.length > 25
                                            ? selectedImage.name.substring(0, 22) + '...'
                                            : selectedImage.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {selectedImage && (
                            <div className="position-relative mb-4">
                                <img
                                    src={URL.createObjectURL(selectedImage)}
                                    alt="Post preview"
                                    className="img-fluid rounded w-100"
                                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 rounded-circle"
                                    onClick={() => setSelectedImage(null)}
                                    style={{ width: '32px', height: '32px' }}
                                >
                                </button>
                            </div>
                        )}

                        <div className="d-flex justify-content-between">
                            <button
                                type="button"
                                className="btn btn-outline-primary d-flex align-items-center"
                                onClick={() => {
                                    axios.post('/post/generate-post-suggestion', {
                                        prompt: getValues("message") || "What's on your mind?"
                                    })
                                        .then((res) => {
                                            setValue("message", res.data.post);
                                        })
                                        .catch(err => {
                                            console.error("Failed to generate suggestion:", err);
                                        });
                                }}
                            >
                                Generate Suggestion
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary d-flex align-items-center"
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="row g-4">
                {allPosts.map((post, index) => (
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

export default Home;