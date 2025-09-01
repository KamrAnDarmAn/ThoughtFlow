import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { FileUpload } from '../ui/file-upload';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BlogFormData {
    title: string;
    content: string;
    thumbnail?: File;
}

const CreateBlog: React.FC = () => {
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [summary, setSummary] = useState<string>('')
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const quillRef = useRef<Quill | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', { background: [] }],
                        ['image', 'code-block'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                    ],
                },
                placeholder: 'Write your blog content here...',
            });

            quillRef.current.on('text-change', () => {
                const html = quillRef.current?.root.innerHTML || '';
                setContent(html === '<p><br></p>' ? '' : html);
            });

            const quillContainer = editorRef.current.querySelector('.ql-container');
            const quillToolbar = editorRef.current.querySelector('.ql-toolbar');
            if (quillContainer) {
                quillContainer.classList.add('bg-background', 'text-foreground', 'border-input');
            }
            if (quillToolbar) {
                quillToolbar.classList.add('bg-background', 'border-input');
            }
        }

        return () => {
            if (quillRef.current) {
                quillRef.current.off('text-change');
                quillRef.current = null;
            }
        };
    }, []);

    const handleFileUpload = (file: any) => {
        // TODO check file format should be in images format
        // const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        console.log("File: ", file)
        const maxSize = 5 * 1024 * 1024; // 5MB
        // if (!allowedTypes.includes(file.type)) {
        //     toast('Only JPEG, PNG, or GIF files are allowed.');
        //     return;
        // }
        if (file.size > maxSize) {
            toast('Thumbnail must be under 5MB.');
            return;
        }
        setThumbnail(file[0]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        console.log("thumbnail handleSubmit: ", thumbnail)

        if (!user) {
            setError('You must be logged in to create a post.');
            navigate('/login');
            return;
        }

        if (!title.trim() || !content.trim()) {
            setError('Title and content are required.');
            toast({ variant: 'destructive', title: 'Error', description: 'Title and content are required.' });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('summary', summary)
            console.log("thumbnail: ", thumbnail, Boolean(thumbnail))
            if (thumbnail) {
                formData.append('thumbnail', thumbnail);
            }


            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/posts', formData, {
                headers: { Authorization: `Bearer ${token}` },

            });

            toast('Blog post created successfully.');
            setTitle('');
            setContent('');
            setThumbnail(null);
            if (quillRef.current) {
                quillRef.current.setText('');
            }
            navigate(`/posts/${response.data.id}`);
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create blog post';
            if (error.response?.status === 401) {
                logout();
                navigate('/login');
                toast({ variant: 'destructive', title: 'Session expired', description: 'Please log in again.' });
            } else {
                setError(message);
                toast({ variant: 'destructive', title: 'Error', description: message });
            }
            console.error('Create blog failed', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 min-h-screen bg-background">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground text-center">
                Create New Blog Post
            </h1>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm sm:text-base font-medium text-foreground">
                        Title
                    </label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your blog title"
                        className="text-sm sm:text-base"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm sm:text-base font-medium text-foreground">
                        Summary
                    </label>
                    <Input
                        id="summary"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Enter your blog summary"
                        className="text-sm sm:text-base"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm sm:text-base font-medium text-foreground">
                        Thumbnail
                    </label>
                    <FileUpload onChange={handleFileUpload} />
                </div>
                <div className="space-y-2">
                    <label className="block mb-5 text-sm sm:text-base font-medium text-foreground">
                        Content
                    </label>
                    <div
                        ref={editorRef}
                        className="h-64 sm:h-96 border border-input bg-background"
                    />
                </div>
                <div className="flex justify-center">
                    <Button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2 text-sm sm:text-base"
                    >
                        Create Post
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateBlog;