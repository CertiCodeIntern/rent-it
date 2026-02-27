import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkSession = useCallback(async () => {
        try {
            const { data } = await api.get('/check_admin_session.php');
            if (data.success && data.authenticated) {
                setUser(data.admin);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = async (username, password) => {
        const { data } = await api.post('/admin_login.php', { username, password });
        if (data.success) {
            setUser(data.admin);
        }
        return data;
    };

    const logout = async () => {
        try {
            await api.get('/admin_logout.php');
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkSession,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}

export default AdminAuthContext;
