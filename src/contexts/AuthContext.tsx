import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth, onAuthChange, loginUser, registerUser, logoutUser } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('firebase_token', token);
        
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        localStorage.removeItem('firebase_token');
        localStorage.removeItem('user');
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (name: string, email: string, password: string) => {
    await registerUser(email, password);
  };

  const login = async (email: string, password: string) => {
    await loginUser(email, password);
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem('documents');
    localStorage.removeItem('questions');
    localStorage.removeItem('quizzes');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
