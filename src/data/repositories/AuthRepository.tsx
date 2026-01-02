import api from '../../config/axios';

export const AuthRepository = {
    logout: async () => {
        // Call backend to clear httpOnly refresh token cookie
        const response = await api.post('/auth/logout');
        return response.data;
    }
};

export default AuthRepository;
