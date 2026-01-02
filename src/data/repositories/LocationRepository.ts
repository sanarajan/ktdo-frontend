import api from '../../config/axios';

export const LocationRepository = {
    getStates: async (): Promise<string[]> => {
        const response = await api.get('/locations/states');
        return response.data.data;
    },

    getStateCodes: async (): Promise<{ state: string; code: string }[]> => {
        const response = await api.get('/locations/state-codes');
        return response.data.data;
    },

    getDistricts: async (state: string): Promise<string[]> => {
        const response = await api.get(`/locations/districts/${state}`);
        return response.data.data;
    }
};
