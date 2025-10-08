import ProfileForm from "@/components/profile/ProfileForm";
import ChangePasswordButton from "@/components/profile/ChangePasswordButton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/supabase/queries";

export default async function EditProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    const profile = await getUserProfile(supabase, user.id);
    
    if (!profile) {
        return <div className="p-8">Profile not found. Please refresh in a moment.</div>
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">Edit Profile</h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Manage your account settings and profile details.</p>
            </div>

            <hr className="border-border-light dark:border-border-dark" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-8">
                <div className="lg:col-span-2">
                    <ProfileForm profile={profile} />
                </div>
                <div className="lg:col-span-1">
                    <ChangePasswordButton />
                </div>
            </div>
        </div>
    );
}