import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
    title: 'Register - Chat App',
    description: 'Create a new account',
};

export default function RegisterPage() {
    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">CHAT APP</h1>
                <p className="text-sm text-muted-foreground">Start chating today</p>
            </div>
            <RegisterForm />
        </div>
    );
}
