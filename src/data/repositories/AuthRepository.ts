import api from '../../config/axios';
import type { User, Driver } from '@driver-app/shared';

// Re-export types if needed or use directly
export interface LoginResponse {
    user: User;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export const AuthRepository = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await api.post<any>('/auth/login', { email, password });
        return response.data.data;
    },

    registerDriver: async (data: Partial<Driver> | FormData): Promise<Driver> => {
        const response = await api.post<any>('/auth/register', data, {
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
        });
        return response.data.data;
    }
};
