import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("[Hub Auth] Initializing...");
    console.log("[Hub Auth] Current URL:", window.location.href);

    // Check cookies
    const cookies = document.cookie.split("; ");
    const authCookies = cookies.filter((c) => c.includes("sb-auth-token"));
    console.log("[Hub Auth] Auth cookies found:", authCookies.length);
    authCookies.forEach((c) => console.log("[Hub Auth] Cookie:", c.split("=")[0]));

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[Hub Auth] Session check result:", !!session);
      if (session) {
        console.log("[Hub Auth] User:", session.user.email);
      }

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Hub Auth] Auth state changed:", event);
      console.log("[Hub Auth] New session:", !!session);

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, session, isLoading }}>{children}</AuthContext.Provider>;
};
