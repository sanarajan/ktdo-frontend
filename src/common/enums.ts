export const UserRole = {
    MAIN_ADMIN: 'MAIN_ADMIN',
    DISTRICT_ADMIN: 'DISTRICT_ADMIN',
    MEMBER: 'MEMBER'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const ApprovalStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
} as const;

export type ApprovalStatus = typeof ApprovalStatus[keyof typeof ApprovalStatus];
