import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { supabase } from "./lib/supabase";
import AuthPage from "./components/AuthPage";
import ChatPage from "./components/ChatPage";
import SetNewPasswordPage from "./components/SetNewPasswordPage";

export default function App() {
  const {
    session,
    loading,
    isRecovery,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setProfileLoading(true);
      const fetch = supabase
        .from("profiles")
        .select("name")
        .eq("id", session.user.id)
        .single();
      Promise.resolve(fetch)
        .then(({ data }) => {
          setUserName(data?.name || "Friend");
        })
        .catch(() => setUserName("Friend"))
        .finally(() => setProfileLoading(false));
    }
  }, [session]);

  if (isRecovery) {
    return (
      <SetNewPasswordPage
        onUpdatePassword={async (password) => {
          await updatePassword(password);
        }}
      />
    );
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-amber-700 font-serif text-lg">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <AuthPage
        onSignUp={async (email, password, name) => {
          await signUp(email, password, name);
        }}
        onSignIn={async (email, password) => {
          await signIn(email, password);
        }}
        onResetPassword={async (email) => {
          await resetPassword(email);
        }}
      />
    );
  }

  return (
    <ChatPage
      userId={session.user.id}
      userName={userName}
      onSignOut={signOut}
    />
  );
}
