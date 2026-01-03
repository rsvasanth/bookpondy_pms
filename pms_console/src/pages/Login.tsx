import { useState, useEffect } from 'react';
import { useFrappeAuth } from 'frappe-react-sdk';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import BrandLogo from '@/components/brand-logo';
import { toast } from 'sonner';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, currentUser, isLoading, error } = useFrappeAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ username: email, password: password });
            toast.success("Welcome back!");
        } catch (err: any) {
            console.error("Login failed:", err);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col font-sans overflow-hidden bg-background">
            {/* Background Artwork moved higher up at the TOP */}
            <div className="absolute top-0 left-0 w-full z-0 pointer-events-none opacity-80 flex justify-center -mt-10 lg:-mt-16">
                <img
                    src="/PONDI2.png"
                    alt="Artwork"
                    className="w-full h-auto"
                    style={{ maxHeight: '45vh', objectFit: 'contain' }}
                />
            </div>

            <main className="flex-1 flex items-center justify-center px-6 z-10">
                <div className="w-full flex justify-center transition-all duration-500">
                    {/* Centered Login Form with TRANSPARENT Background */}
                    <Card className="w-full max-w-md border-none shadow-none bg-transparent p-0">
                        <CardContent className="pt-4 space-y-6 sm:space-y-8">
                            <div className="space-y-1 text-center">
                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Welcome Back</h2>
                                <p className="text-xs text-muted-foreground font-medium">Enter credentials to access PMS</p>
                            </div>

                            {error && (
                                <Alert variant="destructive" className="rounded-md border-none bg-error/10 text-error">
                                    <AlertDescription className="font-medium text-center">
                                        {(error as any).message || "Invalid email or password. Please try again."}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground ml-1">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                placeholder="admin@bookpondy.com"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 h-11 rounded-md bg-muted/20 border-muted focus-visible:ring-2 focus-visible:ring-primary/20 text-sm transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">Password</Label>
                                            <a href="#" className="text-xs text-primary font-semibold hover:underline">Forgot?</a>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 h-11 rounded-md bg-muted/20 border-muted focus-visible:ring-2 focus-visible:ring-primary/20 text-sm transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-md bg-primary hover:bg-primary/90 text-white font-semibold transition-all shadow-lg shadow-primary/10 group text-sm px-8"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <p className="text-center text-sm text-muted-foreground pt-2">
                                Need access? <a href="#" className="text-primary hover:underline font-bold">Contact Admin</a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Footer Branding with Discreet Logo */}
            <footer className="p-8 pb-10 flex flex-col items-center gap-2 z-10 w-full">
                <BrandLogo className="scale-[0.35] opacity-70 origin-center -mb-2" />
                <div className="text-[10px] text-muted-foreground font-semibold opacity-50">
                    Powered by Bookpondy PMS
                </div>
            </footer>
        </div>
    );
}
