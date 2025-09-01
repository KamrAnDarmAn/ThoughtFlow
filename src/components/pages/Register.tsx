import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import { registerSchema, type RegisterSchema } from '@/types/zodSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            password: '',
            bio: '',
        }
    });
    const [serverError, setServerError] = useState<string | null>(null);

    // Handle file input change manually
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setValue('avatar', file || undefined, { shouldValidate: true });
    };

    const onSubmit = async (data: RegisterSchema) => {
        try {

            const formData = new FormData();
            // Append text fields
            formData.append('firstName', data.firstName || '');
            formData.append('lastName', data.lastName || '');
            formData.append('username', data.username || '');
            formData.append('email', data.email || '');
            formData.append('password', data.password || '');
            if (data.bio) formData.append('bio', data.bio);
            if (data.avatar instanceof File) formData.append('avatar', data.avatar);


            const response = await axios.post('http://localhost:5000/api/auth/register', {
                firstName: data.firstName,
                lastName: data.lastName,
                username: data.username,
                email: data.email,
                password: data.password,
                bio: data.bio,
            });


            localStorage.setItem('token', response.data.token);
            toast.success('Registration successful');
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            setServerError(message);
            toast.error(message);
            console.error('Registration failed', message);
        }
    };
    return (
        <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Welcome to ThoughtFlow
            </h2>
            {serverError && <p className="mt-2 text-sm text-red-500">{serverError}</p>}

            <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                    <LabelInputContainer>
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                            {...register('firstName')}
                            id="firstName"
                            placeholder="KamrAn"
                            type="text"
                        />
                        {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                    </LabelInputContainer>
                    <LabelInputContainer>
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                            {...register('lastName')}
                            id="lastName"
                            placeholder="DarmAn"
                            type="text"
                        />
                        {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                    </LabelInputContainer>
                </div>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        {...register('username')}
                        id="username"
                        placeholder="kamran_dev"
                        type="text"
                    />
                    {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        {...register('email')}
                        id="email"
                        placeholder="kamran@dev.com"
                        type="email"
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        {...register('password')}
                        id="password"
                        placeholder="••••••••"
                        type="password"
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        {...register('bio')}
                        id="bio"
                        placeholder="Tell us about yourself..."
                    />
                    {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
                </LabelInputContainer>
                {/* <LabelInputContainer className="mb-4">
                    <Label htmlFor="avatar">Avatar</Label>
                    <Input
                        id="avatar"
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleAvatarChange}
                    />
                    {errors.avatar && <p className="text-sm text-red-500">{errors.avatar.message}</p>}
                </LabelInputContainer> */}

                <button
                    className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                    type="submit"
                >
                    Sign up &rarr;
                    <BottomGradient />
                </button>

                <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

                <div className="flex flex-col space-y-4">
                    <button
                        className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                        type="submit"
                    >
                        <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            Google
                        </span>
                        <BottomGradient />
                    </button>
                </div>
            </form>
        </div>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex w-full flex-col space-y-2", className)}>
            {children}
        </div>
    );
};