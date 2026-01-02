import { UserRole, ApprovalStatus } from './enums';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    houseName?: string;
    place?: string;
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
    state?: string;
    district?: string;
    pin?: string;
    bloodGroup?: string;
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
