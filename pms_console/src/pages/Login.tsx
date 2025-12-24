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
        <div className="min-h-screen relative flex flex-col font-sans overflow-hidden bg-[#FBFBFB]">
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
                            <div className="space-y-2 text-center">
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">Welcome Back</h2>
                                <p className="text-sm text-muted-foreground">Enter your credentials to access the Bookpondy PMS</p>
                            </div>

                            {error && (
                                <Alert variant="destructive" className="rounded-xl border-none bg-red-50 text-red-600">
                                    <AlertDescription className="font-medium text-center">
                                        {(error as any).message || "Invalid email or password. Please try again."}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                placeholder="admin@bookpondy.com"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-12 h-12 sm:h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus-visible:ring-2 focus-visible:ring-[#FF3D2E]/20 text-sm sm:text-base transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Password</Label>
                                            <a href="#" className="text-[10px] text-[#FF3D2E] font-bold uppercase tracking-wider hover:underline">Forgot?</a>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-12 h-12 sm:h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus-visible:ring-2 focus-visible:ring-[#FF3D2E]/20 text-sm sm:text-base transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 sm:h-14 rounded-2xl bg-[#FF3D2E] hover:bg-[#e63225] text-white font-bold transition-all shadow-xl shadow-red-500/20 group text-base uppercase tracking-widest px-8"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <p className="text-center text-sm text-muted-foreground pt-2">
                                Need access? <a href="#" className="text-[#FF3D2E] hover:underline font-bold">Contact Admin</a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Footer Branding with Discreet Logo */}
            <footer className="p-8 pb-10 flex flex-col items-center gap-2 z-10 w-full">
                <BrandLogo className="scale-[0.35] opacity-70 origin-center -mb-2" />
                <div className="text-[8px] text-muted-foreground tracking-[0.5em] font-bold uppercase opacity-50">
                    Powered by Bookpondy PMS
                </div>
            </footer>
        </div>
    );
}
