'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Film } from 'lucide-react';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password: password });

        if (error) {
            setError(error.message);
        } else {
            setMessage("Your password has been changed successfully! Redirecting...");
            setTimeout(() => {
                router.push('/auth');
            }, 3000);
        }
        setLoading(false);
    };
    
    return (
        <div className="bg-background-dark min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                         <Film className="h-8 w-8 text-primary" />
                         <h1 className="text-3xl font-bold text-white">WATCHVERSE</h1>
                    </div>
                    <p className="text-text-secondary-dark">Regain access to your universe of movies.</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-lg shadow-xl p-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-center text-white">Set a New Password</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label 
                                htmlFor="password" 
                                className="block text-sm font-medium text-slate-400 mb-1"
                            >
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full p-3 bg-slate-800 text-white rounded-md border border-slate-700 focus:ring-primary focus:border-primary placeholder-slate-500"
                            />
                        </div>
                        <div>
                            <label 
                                htmlFor="confirmPassword" 
                                className="block text-sm font-medium text-slate-400 mb-1"
                            >
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full p-3 bg-slate-800 text-white rounded-md border border-slate-700 focus:ring-primary focus:border-primary placeholder-slate-500"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-3 px-4 rounded-md transition-all duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Password'}
                        </button>
                    </form>

                    {error && <p className="text-sm text-center text-red-500 pt-2">{error}</p>}
                    {message && <p className="text-sm text-center text-green-500 pt-2">{message}</p>}
                </div>
            </div>
        </div>
    );
}