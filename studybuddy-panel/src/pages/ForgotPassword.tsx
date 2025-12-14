import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/api/auth.service';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authService.forgotPassword(email);
            setIsSuccess(true);
            toast({
                title: "Email sent!",
                description: "Check your email for password reset instructions.",
            });
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && error.response?.data?.message
                ? error.response.data.message
                : 'Failed to send reset email';
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-xl mb-4">
                            <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                        <h1 className="text-3xl font-bold">Check Your Email</h1>
                        <p className="text-muted-foreground mt-2">
                            We've sent password reset instructions to {email}
                        </p>
                    </div>

                    <div className="dashboard-card p-8 text-center">
                        <p className="text-muted-foreground mb-6">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="btn-outline w-full mb-4"
                        >
                            Try Different Email
                        </button>
                        <Link to="/login" className="text-sm text-primary hover:underline">
                            ← Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
                        <Mail className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold">Forgot Password</h1>
                    <p className="text-muted-foreground mt-2">
                        Enter your email to reset your password
                    </p>
                </div>

                {/* Form */}
                <div className="dashboard-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Sending...</span>
                                </div>
                            ) : (
                                'Send Reset Email'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Remember your password? </span>
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}