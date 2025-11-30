export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-muted/40">
            {/* Optional: Add background patterns or gradients here */}
            {children}
        </div>
    );
}
