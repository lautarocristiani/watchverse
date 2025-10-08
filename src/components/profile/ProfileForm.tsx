'use client';

import { useState, useRef } from "react";
import { updateProfileAction } from "@/lib/supabase/actions";
import { Profile } from "@/lib/types";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function ProfileForm({ profile }: { profile: Profile }) {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clientAction = async (formData: FormData) => {
        setLoading(true);
        setMessage('');
        setError('');
        const result = await updateProfileAction(formData);
        if (result.error) setError(result.error);
        if (result.success) setMessage(result.success);
        setLoading(false);
    };

    return (
        <form action={clientAction} className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">Public Profile</h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">This information will be displayed publicly.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <Image 
                    src={avatarPreview || `https://ui-avatars.com/api/?name=${profile.full_name || profile.username}&background=0ea5e9&color=fff&size=128`}
                    alt="Avatar preview"
                    width={96}
                    height={96}
                    className="rounded-full w-24 h-24 object-cover border-2 border-border-light dark:border-border-dark"
                />
                <input 
                    type="file" 
                    name="avatar" 
                    id="avatar" 
                    accept="image/png, image/jpeg"
                    onChange={handleAvatarChange}
                    ref={fileInputRef}
                    className="hidden"
                />
                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-card-light border border-border-light px-4 py-2 rounded-md text-sm font-semibold hover:bg-hover-light dark:bg-card-dark dark:border-border-dark dark:hover:bg-hover-dark transition-colors"
                >
                    Change Avatar
                </button>
            </div>

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Username</label>
                <input 
                    type="text" 
                    name="username" 
                    id="username" 
                    defaultValue={profile.username}
                    required
                    className="mt-1 block w-full p-3 bg-background-light rounded-md border border-border-light focus:ring-primary focus:border-primary dark:bg-background-dark dark:border-border-dark"
                />
            </div>
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Full Name</label>
                <input 
                    type="text" 
                    name="fullName" 
                    id="fullName" 
                    defaultValue={profile.full_name || ''}
                    className="mt-1 block w-full p-3 bg-background-light rounded-md border border-border-light focus:ring-primary focus:border-primary dark:bg-background-dark dark:border-border-dark"
                />
            </div>
            
            <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-50">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </button>
            </div>

            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            {message && <p className="text-sm text-success mt-2">{message}</p>}
        </form>
    );
}