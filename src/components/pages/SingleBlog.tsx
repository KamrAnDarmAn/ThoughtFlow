import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, redirect } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const SingleBlog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState(null);
    const [currentBlogAuthor, setCurrentBlogAuthor] = useState<string>('')

    useEffect(() => {
        (async () => {
            const blog = await axios.get(`http://localhost:5000/api/posts/${id}`)
            setCurrentBlogAuthor(blog.data)
        })()
    }, [])



    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                const postResponse = await axios.get(`http://localhost:5000/api/posts/${id}`);
                setPost(postResponse.data);
                const commentsResponse = await axios.get(`http://localhost:5000/api/posts/${id}/comments`);
                setComments(commentsResponse.data);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to load post');
                console.error('Fetch post/comments failed', error);
            }
        };
        fetchPostAndComments();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login', { state: { from: `/posts/${id}` } });
            return;
        }
        if (!newComment.trim()) {
            setError('Comment cannot be empty');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/posts/${id}/comments`,
                { content: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments([response.data, ...comments]);
            setNewComment('');
            setError(null);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to post comment');
            console.error('Comment submission failed', error);
        }
    };

    const handleDeleteBlog = async () => {
        const token = localStorage.getItem('token');
        const blog = await axios.delete(`http://localhost:5000/api/posts/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (blog.status === 200) {
            navigate('/', { state: { from: `/posts/${id}` } });
        }
    }

    if (error && !post) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 min-h-screen">
                <p className="text-red-500 text-center">{error}</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 min-h-screen">
                <p className="text-center text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 min-h-screen ">
            <div className='mt-10'></div>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl">{post.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-8 w-8">
                            {post?.author?.avatar ? (
                                <AvatarImage src={`http://localhost:5000${post.author.avatar}`} alt="Author avatar" />
                            ) : (
                                <Link to={`/profile/${post?.author?.id}`} className='w-full h-full'>
                                    <AvatarFallback>
                                        {post?.author.firstName[0]}{post?.author?.lastName[0]}
                                    </AvatarFallback>
                                </Link>
                            )}
                        </Avatar>
                        <span>
                            By {post?.author?.firstName} {post?.author?.lastName} (@{post?.author?.username}) on{' '}
                            {new Date(post?.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    {post?.thumbnail && (
                        <img
                            src={`../../../api/${post.thumbnail}`}
                            alt="Post thumbnail"
                            className="mb-4 max-w-full h-auto rounded"
                        />
                    )}
                    <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.content }} />
                    {

                        user && user?.id === currentBlogAuthor?.author?.id && <Button onClick={handleDeleteBlog} variant='destructive'>Delete</Button>
                    }


                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment?.id} className="mb-4 border-t pt-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Avatar className="h-6 w-6">
                                        {comment?.user?.avatar ? (
                                            <AvatarImage src={`http://localhost:5000${comment.user.avatar}`} alt="User avatar" />
                                        ) : (
                                            <AvatarFallback>
                                                {comment?.user?.firstName[0]}{comment?.user?.lastName[0]}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <span>
                                        {comment?.user?.firstName} {comment?.user?.lastName} (@{comment?.user?.username}) -{' '}
                                        {new Date(comment?.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="mt-1">{comment?.content}</p>

                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No comments yet.</p>
                    )}
                    <form onSubmit={handleCommentSubmit} className="mt-6 flex flex-col gap-4">
                        {user ? (
                            <div className="flex gap-2">
                                <Input
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="text-sm"
                                />
                                <Button type="submit">Post Comment</Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                <Link to="/login" className="text-blue-500 hover:underline">
                                    Log in
                                </Link>{' '}
                                to add a comment.
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SingleBlog;