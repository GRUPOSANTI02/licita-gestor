"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, password: string, rememberMe: boolean) => boolean;
    logout: () => void;
    changePassword: (currentPwd: string, newPwd: string) => { success: boolean, message: string };
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    const pathname = usePathname();

    const getStoredPassword = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("licita_gestor_pwd") || "indaia02@";
        }
        return "indaia02@";
    };

    useEffect(() => {
        // Verificar se já está logado
        const authStatus = localStorage.getItem("licita_gestor_auth") || sessionStorage.getItem("licita_gestor_auth");
        if (authStatus === "true") {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated && pathname !== "/login") {
                router.push("/login");
            } else if (isAuthenticated && pathname === "/login") {
                router.push("/");
            }
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    const login = (username: string, password: string, rememberMe: boolean) => {
        const correctPassword = getStoredPassword();
        if (username.toLowerCase() === "gruposanti" && password === correctPassword) {
            setIsAuthenticated(true);
            if (rememberMe) {
                localStorage.setItem("licita_gestor_auth", "true");
            } else {
                sessionStorage.setItem("licita_gestor_auth", "true");
            }
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("licita_gestor_auth");
        sessionStorage.removeItem("licita_gestor_auth");
        router.push("/login");
    };

    const changePassword = (currentPwd: string, newPwd: string) => {
        const correctPassword = getStoredPassword();
        if (currentPwd !== correctPassword) {
            return { success: false, message: "Senha atual incorreta." };
        }
        localStorage.setItem("licita_gestor_pwd", newPwd);
        return { success: true, message: "Senha alterada com sucesso!" };
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
