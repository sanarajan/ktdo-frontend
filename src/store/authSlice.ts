import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from '../../common/enums';

interface AuthState {
    user: any | null;
    token: string | null;
    role: UserRole | null;
    isAuthenticated: boolean;
}

// Load initial state from localStorage
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState: AuthState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    role: storedUser ? JSON.parse(storedUser).role : null,
    isAuthenticated: !!storedToken,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: any; token: string }>
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.role = action.payload.user.role;
            state.isAuthenticated = true;

            // Persist to localStorage
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;

            // Clear localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
