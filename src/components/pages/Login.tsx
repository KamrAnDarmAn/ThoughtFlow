import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import { loginSchema, type LoginSchema } from '@/types/zodSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { register, formState: { errors }, handleSubmit } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });
    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmit = async (data: LoginSchema) => {
        try {
            setServerError(null);
            const response = await axios.post('http://localhost:5000/api/auth/login', data);
            const { user, token } = response.data;

            console.log("token: ", token)

            localStorage.setItem('token', token);
            console.log('Login successful', user);
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            setServerError(message);
            console.error('Login failed', message);
        }
    };

    return (
        <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Login to ThoughtFlow
            </h2>
            {serverError && <p className="mt-2 text-sm text-red-500">{serverError}</p>}

            <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
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

                <button
                    className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                    type="submit"
                >
                    Sign in &rarr;
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