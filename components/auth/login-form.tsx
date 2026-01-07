'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/use-auth-store';
import { LoginSchema, LoginValues } from './validation';
import { login } from '@/services/auth/auth.api';
import { getErrorMessage } from '@/lib/error-handler';

export function LoginForm() {
    const router = useRouter();
    const { setAccessToken, setCurrentUser } = useAuthStore();

    const form = useForm<LoginValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: { email: '', password: '' },
    });

    async function onSubmit(values: LoginValues) {
        try {
            const { accessToken, user } = await login(values);

            setAccessToken(accessToken);
            setCurrentUser(user);

            toast.success(`Welcome back, ${user.username}!`);
            router.push('/');
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    return (
        <Card className="w-[350px] shadow-lg">
            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="user@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="your password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={form.formState.isSubmitting}
                        >
                            Login
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?
                    <Link href="/register" className="underline text-primary hover:text-primary/90">
                        Register
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
