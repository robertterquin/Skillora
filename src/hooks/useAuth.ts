"use client";

import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

export interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (mounted) {
          setUser(currentUser);
          setIsLoading(false);
        }
      } catch {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  };
}
