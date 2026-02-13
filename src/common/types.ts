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
    state?: string;
    district?: string;
}

export interface DistrictAdmin extends User {
    workingState: string;
    workingDistrict: string;
}

export interface Driver extends User {
    districtAdminId: string;
    workingState?: string;
    workingDistrict?: string;
    state?: string;
    district?: string;
    pin?: string;
    bloodGroup?: string;
    licenceNumber?: string;
    status: ApprovalStatus;
    uniqueId?: string;
    stateRtoCode?: string;
    photoUrl?: string;
    printCount?: number;
    createdBy?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
}
