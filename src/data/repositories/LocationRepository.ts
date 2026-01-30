import api from '../../config/axios';

// TEMPORARY: Filter to show only these states (remove this when all states are needed)
const TEMP_ALLOWED_STATES = ['Kerala', 'Tamil Nadu', 'Karnataka'];

export const LocationRepository = {
    getStates: async (): Promise<string[]> => {
        const response = await api.get('/locations/states');
        const allStates = response.data.data;
        // TEMPORARY: Filter to only show allowed states
        return allStates.filter((state: string) => TEMP_ALLOWED_STATES.includes(state));
    },

    getStateCodes: async (): Promise<{ state: string; code: string }[]> => {
        const response = await api.get('/locations/state-codes');
        const allCodes = response.data.data;
        // TEMPORARY: Filter to only show codes for allowed states
        return allCodes.filter((item: { state: string; code: string }) =>
            TEMP_ALLOWED_STATES.includes(item.state)
        );
    },

    getDistricts: async (state: string): Promise<string[]> => {
        const response = await api.get(`/locations/districts/${state}`);
        return response.data.data;
    }
};
