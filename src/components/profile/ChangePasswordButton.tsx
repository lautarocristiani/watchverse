'use client';

import { useState } from "react";
import { sendPasswordResetAction } from "@/lib/supabase/actions";
import { Loader2 } from "lucide-react";

export default function ChangePasswordButton() {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        setMessage('');
        setError('');
        const result = await sendPasswordResetAction();
        if (result.error) setError(result.error);
        if (result.success) setMessage(result.success);
        setLoading(false);
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">Change Password</h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">A password reset link will be sent to your email address.</p>
            </div>
            <button 
                onClick={handleClick}
                disabled={loading}
                className="w-full sm:w-auto bg-card-light border border-border-light px-4 py-2 rounded-md text-sm font-semibold hover:bg-hover-light dark:bg-card-dark dark:border-border-dark dark:hover:bg-hover-dark disabled:opacity-50 flex items-center justify-center transition-colors"
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
            </button>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            {message && <p className="text-sm text-success mt-2">{message}</p>}
        </div>
    )
}