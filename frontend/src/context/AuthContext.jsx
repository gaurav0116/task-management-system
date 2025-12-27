import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry?
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(decoded); // Or fetch full user? Decoding token is faster.
                    // If token has roles, great.
                    // Token payload: { id, iat, exp } (default)
                    // Wait, login controller returns: { _id, name, email, role, token }
                    // Token *signed* with { id }.
                    // We might need to store user details in localStorage or fetch them.
                    // Let's store the user object from login response too.
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    if(storedUser) setUser(storedUser);
                }
            } catch (error) {
                console.error("Invalid token", error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5001/api/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            // Decode to get ID, but data has role etc.
            // Better to store user data provided by backend
            const userData = { ...data };
            delete userData.token; // Keep token separate
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
