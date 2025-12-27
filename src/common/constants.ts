export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const SuccessMessage = {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
} as const;

export const ErrorMessage = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_BLOCKED: 'Your account has been blocked. Please contact admin.',
} as const;
