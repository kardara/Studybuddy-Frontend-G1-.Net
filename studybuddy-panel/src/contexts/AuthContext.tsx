import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/api/auth.service';
import { LoginRequest, RegisterRequest, User } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const currentUser = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();

        if (currentUser && isAuth) {
            setUser(currentUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        const response = await authService.login(credentials);
        setUser({ userId: response.userId, email: response.email, role: response.role, fullName: response.fullName });
    };

    const register = async (data: RegisterRequest) => {
        const fullName = `${data.firstName} ${data.lastName}`;
        const registerData = { ...data, fullName };
        const response = await authService.register(registerData);
        setUser({ userId: response.userId, email: response.email, role: response.role, fullName: response.fullName });
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user && authService.isAuthenticated(),
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
