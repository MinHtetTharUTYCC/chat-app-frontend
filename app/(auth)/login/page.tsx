import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
    title: 'Login - Chat App',
    description: 'Login to your account',
};

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">CHAT APP</h1>
                <p className="text-sm text-muted-foreground">Start chating today</p>
            </div>
            <LoginForm />
        </div>
    );
}
