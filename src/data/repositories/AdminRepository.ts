import api from '../../config/axios';
import type { DistrictAdmin, Driver, User } from '@driver-app/shared';

export const AdminRepository = {
    createDistrictAdmin: async (data: FormData): Promise<DistrictAdmin> => {
      
        const response = await api.post('/admin/district-admin', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
        return response.data.data;
    },

    getDistrictAdmins: async (): Promise<User[]> => {
        const response = await api.get('/admin/district-admins');
        return response.data.data;
    },

    getMembers: async (): Promise<Driver[]> => {
        const response = await api.get('/admin/members');
        return response.data.data;
    },

    approveDriver: async (driverId: string): Promise<Driver> => {
        const response = await api.post(`/admin/approve/${driverId}`);
        return response.data.data;
    },

    generateIdCard: async (driverId: string): Promise<Blob> => {
        const response = await api.get(`/admin/generate-card/${driverId}`, { responseType: 'blob' });
        return response.data;
    },

    toggleBlockStatus: async (userId: string): Promise<User> => {
        const response = await api.patch(`/admin/block/${userId}`);
        return response.data.data;
    },

    updateMember: async (memberId: string, updateData: any): Promise<Driver> => {
        const response = await api.patch(`/admin/members/${memberId}`, updateData,{
  headers: { 'Content-Type': 'multipart/form-data' }
});
        return response.data.data;
    }
};
