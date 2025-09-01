import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { FileUpload } from '../ui/file-upload';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Profile from './Profile';

const MyProfile = () => {
    const { user, logout, isLoading: authLoading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState({
        firstName: '',
        lastName: '',
        username: '',
        bio: '',
    });
    const [avatar, setAvatar] = useState(null);
    const [error, setError] = useState(null);
    const [minLoading, setMinLoading] = useState(true);
    const navigate = useNavigate();

    // Ensure minimum loading duration to prevent flicker
    useEffect(() => {
        const timer = setTimeout(() => setMinLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Update form state when user changes
    useEffect(() => {
        if (user) {
            console.log('MyProfile: User loaded:', user.id);
            setFormState({
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                bio: user.bio || '',
            });
        }
    }, [user]);

    // Memoize form state updates to prevent unnecessary re-renders
    const updateFormState = useMemo(
        () => (key, value) => {
            setFormState(prev => ({ ...prev, [key]: value }));
        },
        []
    );

    const handleFileUpload = (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type', { description: 'Only JPEG, PNG, or GIF files are allowed.' });
            return;
        }
        if (file.size > maxSize) {
            toast.error('File too large', { description: 'Avatar must be under 5MB.' });
            return;
        }
        setAvatar(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const formData = new FormData();
            formData.append('firstName', formState.firstName);
            formData.append('lastName', formState.lastName);
            formData.append('username', formState.username);
            formData.append('bio', formState.bio);
            if (avatar) {
                formData.append('avatar', avatar);
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token missing');
            }

            console.log('MyProfile: Updating profile with:', formState);
            await axios.put('http://localhost:5000/api/users/me', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success('Profile updated successfully.');
            setIsEditing(false);
            // Trigger useAuth re-fetch via storage event
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile';
            setError(message);
            toast.error(message);
            if (error.response?.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    if (authLoading || minLoading) {
        return <div className="text-center">Loading user data...</div>;
    }

    if (!user) {
        return (
            <div className="text-center">
                Please log in to view your profile.
                <Button onClick={() => navigate('/login')} className="mt-2">Login</Button>
            </div>
        );
    }

    return (
        <main className="flex flex-col items-center mt-4 space-y-4 ">
            <div className="mt-10"></div>
            {isEditing ? (
                <Card className="w-full md:w-[70%]">
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
                                    First Name
                                </label>
                                <Input
                                    id="firstName"
                                    value={formState.firstName}
                                    onChange={(e) => updateFormState('firstName', e.target.value)}
                                    placeholder="Enter your first name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
                                    Last Name
                                </label>
                                <Input
                                    id="lastName"
                                    value={formState.lastName}
                                    onChange={(e) => updateFormState('lastName', e.target.value)}
                                    placeholder="Enter your last name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-sm font-medium text-foreground">
                                    Username
                                </label>
                                <Input
                                    id="username"
                                    value={formState.username}
                                    onChange={(e) => updateFormState('username', e.target.value)}
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="bio" className="block text-sm font-medium text-foreground">
                                    Bio
                                </label>
                                <Textarea
                                    id="bio"
                                    value={formState.bio}
                                    onChange={(e) => updateFormState('bio', e.target.value)}
                                    placeholder="Tell us about yourself"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-foreground">
                                    Avatar
                                </label>
                                <FileUpload onChange={handleFileUpload} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Profile userId={user.id.toString()} isOwnProfile userData={user} />
            )}
        </main>
    );
};

export default MyProfile;