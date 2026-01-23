import { createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useAuthState } from "@/hooks/useAuthState";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading, signOut } = useAuthState();

  return (
    <AuthContext.Provider value={{ user, session, isLoading: loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
