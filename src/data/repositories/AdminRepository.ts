import api from '../../config/axios';
import type { DistrictAdmin, Driver, User } from '../../common/types';

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

    getMembers: async (params?: { page?: number; limit?: number; search?: string; bloodGroup?: string; stateRtoCode?: string; status?: string }): Promise<{ members: Driver[]; pagination: { total: number; page: number; totalPages: number; limit: number } }> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.bloodGroup) queryParams.append('bloodGroup', params.bloodGroup);
        if (params?.stateRtoCode) queryParams.append('stateRtoCode', params.stateRtoCode);
        if (params?.status) queryParams.append('status', params.status);
        
        const response = await api.get(`/admin/members?${queryParams.toString()}`);
        return { members: response.data.data, pagination: response.data.pagination };
    },

    updateMemberStatus: async (memberId: string, action: 'APPROVED' | 'REJECTED', reason?: string): Promise<Driver> => {
        const response = await api.patch(`/admin/members/${memberId}/status`, { action, reason });
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

    deleteDistrictAdmin: async (adminId: string): Promise<void> => {
        await api.delete(`/admin/district-admin/${adminId}`);
    },

    updateMember: async (memberId: string, updateData: any): Promise<Driver> => {
        const response = await api.patch(`/admin/members/${memberId}`, updateData,{
  headers: { 'Content-Type': 'multipart/form-data' }
});
        return response.data.data;
    },

    recordPrintId: async (memberId: string): Promise<Driver> => {
        const response = await api.post(`/admin/members/${memberId}/print-record`);
        return response.data.data;
    },

    deleteMember: async (memberId: string): Promise<{ softDeleted: boolean }> => {
        const response = await api.delete(`/admin/members/${memberId}`);
        return response.data.data;
    }
};
