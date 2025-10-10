import AuthForm from "@/components/auth/AuthForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect('/');
  }

  return (
    <div className="flex items-center justify-center py-16">
      <AuthForm />
    </div>
  );
}