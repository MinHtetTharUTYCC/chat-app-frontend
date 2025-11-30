'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/use-auth-store';

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export function LoginForm() {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: '', password: '' },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const res = await api.post('/auth/login', values);
            const { accessToken, user } = res.data;
            useAuthStore.getState().setAccessToken(accessToken);
            useAuthStore.getState().setCurrentUser(user);

            toast.success(`Welcome back, ${user.username}!`);
            router.push('/');
            // router.refresh(); // Refresh to update middleware state
        } catch (error) {
            toast.error('Invalid credentials');
        }
    }

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Login</CardTitle>
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
                                        <Input placeholder="m@example.com" {...field} />
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
                                        <Input type="password" {...field} />
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
                <div className="mt-4 text-center text-sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="underline">
                        Register
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
