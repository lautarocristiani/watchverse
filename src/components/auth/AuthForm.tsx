'use client';

import { useState } from 'react';
import { signUpAction, signInAction } from '@/lib/supabase/actions';
import { Loader2 } from 'lucide-react';

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;

    if (isSignUp) {
        const confirmPassword = formData.get('confirmPassword') as string;
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
    }
    
    const action = isSignUp ? signUpAction : signInAction;
    const result = await action(formData);

    if (result && 'error' in result && result.error) {
        setError(result.error);
    }
    if (result && 'success' in result && result.success) {
        setMessage(result.success);
    }
    setLoading(false);
  };

  return (
    <div className="bg-card-light p-8 rounded-lg shadow-lg max-w-sm w-full border border-border-light dark:bg-card-dark dark:border-border-dark">
      <h1 className="text-text-main-light dark:text-text-main-dark text-2xl font-bold mb-6 text-center">
        {isSignUp ? 'Create an Account' : 'Sign In'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="username" className="sr-only">Username</label>
            <input id="username" type="text" name="username" placeholder="Username" required className="w-full p-3 bg-background-light rounded-md border border-border-light focus:ring-primary focus:border-primary dark:bg-background-dark dark:border-border-dark" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="sr-only">Email</label>
          <input id="email" type="email" name="email" placeholder="your.email@example.com" required className="w-full p-3 bg-background-light rounded-md border border-border-light focus:ring-primary focus:border-primary dark:bg-background-dark dark:border-border-dark" />
        </div>
        <div>
          <label htmlFor="password"className="sr-only">Password</label>
          <input id="password" type="password" name="password" placeholder="••••••••" minLength={6} required className="w-full p-3 bg-background-light rounded-md border border-border-light focus:ring-primary focus:border-primary dark:bg-background-dark dark:border-border-dark" />
        </div>
        {isSignUp && (
          <div>
            <label htmlFor="confirmPassword"className="sr-only">Confirm Password</label>
            <input id="confirmPassword" type="password" name="confirmPassword" placeholder="Confirm Password" required className="w-full p-3 bg-background-light rounded-md border border-border-light focus:ring-primary focus:border-primary dark:bg-background-dark dark:border-border-dark" />
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-50">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary-light dark:text-text-secondary-dark mt-4">
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-semibold">
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>

      {error && <p className="text-center text-sm text-destructive mt-4">{error}</p>}
      {message && <p className="text-center text-sm text-success mt-4">{message}</p>}
    </div>
  );
}