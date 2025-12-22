import { UserRole, ApprovalStatus } from './enums';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    address?: string;
    isBlocked?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    photoUrl?: string;
}

export interface DistrictAdmin extends User {
    district: string;
}

export interface Driver extends User {
    districtAdminId: string;
    licenseNumber: string;
    vehicleNumber: string;
    state?: string;
    district?: string;
    post?: string;
    pin?: string;
    bloodGroup?: string;
    emergencyContact?: string;
    status: ApprovalStatus;
    uniqueId?: string;
    photoUrl?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
}
