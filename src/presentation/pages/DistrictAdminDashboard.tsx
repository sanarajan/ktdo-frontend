import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { ApprovalStatus } from '../../common/enums';
import { AdminRepository } from '../../data/repositories/AdminRepository';
import { pdf } from '@react-pdf/renderer';
import IdCardDocument from '../components/admin/IdCardDocument';
import { AddMemberDialog } from '../components/AddMemberDialog';
import { ViewDetailsDialog } from '../components/ViewDetailsDialog';
import { EditMemberDialog } from '../components/EditMemberDialog';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { RejectReasonDialog } from '../components/RejectReasonDialog';
import { toast } from 'react-toastify';
import { FaSignOutAlt, FaUser, FaPlus } from 'react-icons/fa';
import clsx from 'clsx';
import { getBase64 } from '../../utils/ImageHelper';
import { API_BASE_URL } from '../../common/constants';

const DistrictAdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [members, setMembers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMembers, setTotalMembers] = useState(0);
    const [showAddMember, setShowAddMember] = useState(false);
    const [viewMember, setViewMember] = useState<any>(null);
    const [editMember, setEditMember] = useState<any>(null);
    const [approvalLoadingId, setApprovalLoadingId] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        action: 'APPROVED' | 'REJECTED' | null;
        memberId: string | null;
    }>({ isOpen: false, action: null, memberId: null });
    const [rejectReasonDialog, setRejectReasonDialog] = useState<{
        isOpen: boolean;
        memberId: string | null;
    }>({ isOpen: false, memberId: null });
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        member: any | null;
    }>({ isOpen: false, member: null });
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, [currentPage, itemsPerPage, searchTerm]);

    const fetchMembers = async () => {
        try {
            const response = await AdminRepository.getMembers({
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm
            });
            console.log('Fetched Members for District Admin:', response);
            if (response && Array.isArray(response.members)) {
                setMembers(response.members);
                setTotalPages(response.pagination.totalPages);
                setTotalMembers(response.pagination.total);
            } else {
                console.error('Invalid members data format:', response);
                setMembers([]);
            }
        } catch (error) {
            console.error('Failed to fetch members', error);
            setMembers([]);
        }
    };

    const handleBlockToggle = async (id: string) => {
        try {
            await AdminRepository.toggleBlockStatus(id);
            toast.success('Member status updated');
            fetchMembers();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handlePrintId = async (member: any) => {
        try {
            // Prepare image URL
            let photoUrl = member.photoUrl;
            if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('data:')) {
                 const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');
                 const cleanUrl = photoUrl.startsWith('/') ? photoUrl.slice(1) : photoUrl;
                 photoUrl = `${serverUrl}/${cleanUrl}`;
            }

            // Convert to base64 to ensure it renders in PDF
            let base64Image = null;
            if (photoUrl) {
                try {
                    base64Image = await getBase64(photoUrl);
                } catch (err) {
                    console.error('Failed to load image for PDF', err);
                }
            }

            // Generate and open PDF
            const blob = await pdf(<IdCardDocument driver={{...member, photoUrl: base64Image || member.photoUrl}} />).toBlob();
            if (blob) {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                
                // Record the print in the database
                try {
                    await AdminRepository.recordPrintId(member._id);
                } catch (recordError) {
                    console.warn('Failed to record print count', recordError);
                    // Don't show error to user - PDF was still generated successfully
                }
            } else {
                toast.error('Failed to generate PDF Blob');
            }
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate ID Card');
        }
    };

    const handleStatusChange = async (memberId: string, action: 'APPROVED' | 'REJECTED', reason?: string) => {
        try {
            setApprovalLoadingId(memberId);
            await AdminRepository.updateMemberStatus(memberId, action, reason);
            toast.success(`Member ${action.toLowerCase()}${reason ? ' with reason sent to member' : ''}`);
            await fetchMembers();
            setConfirmDialog({ isOpen: false, action: null, memberId: null });
            setRejectReasonDialog({ isOpen: false, memberId: null });
            setViewMember(null);
        } catch (error) {
            toast.error('Failed to update member status');
        } finally {
            setApprovalLoadingId(null);
        }
    };

    const handleConfirmAction = (memberId: string, action: 'APPROVED' | 'REJECTED') => {
        if (action === 'REJECTED') {
            setRejectReasonDialog({ isOpen: true, memberId });
        } else {
            setConfirmDialog({ isOpen: true, action, memberId });
        }
    };

    const handleConfirmDialogConfirm = async () => {
        if (confirmDialog.memberId && confirmDialog.action) {
            await handleStatusChange(confirmDialog.memberId, confirmDialog.action);
        }
    };

    const handleRejectWithReason = async (reason: string) => {
        if (rejectReasonDialog.memberId) {
            await handleStatusChange(rejectReasonDialog.memberId, 'REJECTED', reason);
        }
    };

    const handleDeleteMember = async (memberId: string) => {
        try {
            setDeleteLoading(true);
            const result = await AdminRepository.deleteMember(memberId);
            const message = result.softDeleted 
                ? 'Member soft-deleted (already printed)' 
                : 'Member permanently deleted';
            toast.success(message);
            setDeleteDialog({ isOpen: false, member: null });
            setViewMember(null);
            await fetchMembers();
        } catch (error) {
            toast.error('Failed to delete member');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AuthRepository.logout();
        } catch (err) {
            console.warn('Logout API failed, proceeding to clear client state', err);
        }
        dispatch(logout());
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        navigate('/');
    };

    // Client-side filtering is removed in favor of server-side search
    // const filteredMembers = members.filter(member => ... );

    return (
        <div className="min-h-screen bg-[#1a1a1a]">
            {/* Header */}
            <nav className="bg-[#1a1a1a] border-b border-gray-700 shadow-lg shadow-black/50 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="KTDO Logo" className="w-10 h-10 object-contain" />
                            <h1 className="text-xl font-bold text-white flex flex-col">
                                KTDO
                                <span className="text-[10px] bg-brand px-1.5 py-0.5 rounded text-black w-fit">District Admin</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-white">
                                <FaUser />
                                <span>{user?.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-brand text-black font-medium rounded-lg hover:bg-brand-600 transition"
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">My Members</h2>
                    <p className="text-gray-400">Manage members assigned to your district</p>
                </div>

                {/* Search and Add Member */}
                <div className="mb-8 p-1 bg-[#1a1a1a] rounded-xl">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search by name, email, or vehicle number..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="flex-1 px-4 py-3 bg-[#242424] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-md shadow-black/30 transition-all"
                        />
                        <button
                            onClick={() => setShowAddMember(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-brand text-black font-bold rounded-lg hover:bg-brand-400 transition whitespace-nowrap shadow-md shadow-black/30 border border-brand-600"
                        >
                            <FaPlus /> Add Member
                        </button>
                    </div>
                </div>

                {/* Members Table */}
                <div className="bg-[#1a1a1a] rounded-xl shadow-2xl shadow-black/50 border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#242424] text-white border-b border-gray-700">
                                <tr>
                                    <th className="p-4 text-sm font-bold text-gray-200 uppercase tracking-wider">Name</th>
                                    <th className="p-4 text-sm font-bold text-gray-200 uppercase tracking-wider">Email</th>
                                    <th className="p-4 text-sm font-bold text-gray-200 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-sm font-bold text-gray-200 uppercase tracking-wider">Approval</th>
                                    <th className="p-4 text-sm font-bold text-gray-200 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 bg-[#1a1a1a]">
                                {members.map((member) => (
                                    <tr key={member._id} className="hover:bg-[#242424] transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-white">{member.name}</div>
                                            <div className="text-xs text-gray-400">{member.phone}</div>
                                        </td>
                                        <td className="p-4 text-gray-300">{member.email}</td>
                                        <td className="p-4">
                                            <span className={clsx(
                                                "px-2 py-1 rounded-full text-xs font-semibold",
                                                member.isBlocked
                                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            )}>
                                                {member.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {member.status === ApprovalStatus.APPROVED ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 cursor-not-allowed inline-block">
                                                    APPROVED
                                                </span>
                                            ) : member.status === ApprovalStatus.REJECTED ? (
                                                <button
                                                    disabled={approvalLoadingId === member._id}
                                                    onClick={() => setViewMember(member)}
                                                    className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer inline-block"
                                                    title={member.rejectionReason || 'Rejected'}
                                                >
                                                    REJECTED
                                                </button>
                                            ) : member.createdBy === 'MEMBER' ? (
                                                <button
                                                    disabled={approvalLoadingId === member._id}
                                                    onClick={() => setViewMember(member)}
                                                    className={clsx(
                                                        "px-2 py-1 rounded-full text-xs font-semibold",
                                                        approvalLoadingId === member._id ? "bg-yellow-300 text-yellow-800" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-pointer"
                                                    )}
                                                >
                                                    PENDING
                                                </button>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <button
                                                    onClick={() => handleBlockToggle(member._id)}
                                                    className={clsx(
                                                        "text-sm font-medium transition-colors",
                                                        member.isBlocked ? "text-green-500 hover:text-green-400" : "text-red-500 hover:text-red-400"
                                                    )}
                                                >
                                                    {member.isBlocked ? 'Unblock' : 'Block'}
                                                </button>
                                                {member.status === ApprovalStatus.APPROVED && !member.isBlocked && (
                                                    <button
                                                        onClick={() => handlePrintId(member)}
                                                        className="text-sm font-medium text-brand hover:text-brand-400"
                                                    >
                                                        {member.printCount && member.printCount > 0 ? 'Reprint' : 'Print ID'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setEditMember(member)}
                                                    className="text-sm font-medium text-gray-300 hover:text-white"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setViewMember(member)}
                                                    className="text-sm font-medium text-blue-400 hover:text-blue-300"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => setDeleteDialog({ isOpen: true, member })}
                                                    className="text-sm font-medium text-red-500 hover:text-red-400"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {members.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            {searchTerm ? 'No members found matching your search.' : 'No members assigned to your district yet.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalMembers > 0 && (
                        <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalMembers)} of {totalMembers} members
                                </div>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="text-sm border-gray-300 rounded-md shadow-sm focus:border-brand focus:ring-brand dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value={10}>10 per page</option>
                                    <option value={20}>20 per page</option>
                                    <option value={50}>50 per page</option>
                                    <option value={100}>100 per page</option>
                                </select>
                            </div>
                            
                            {totalPages > 1 && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-2 rounded-lg transition ${
                                                    currentPage === page
                                                        ? 'bg-brand text-black'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Add Member Dialog */}
                <AddMemberDialog
                    isOpen={showAddMember}
                    onClose={() => setShowAddMember(false)}
                    onSuccess={() => {
                        fetchMembers();
                        setShowAddMember(false);
                    }}
                />

                <ViewDetailsDialog
                    isOpen={!!viewMember}
                    onClose={() => setViewMember(null)}
                    data={viewMember}
                    title="Member Details"
                    onApprove={viewMember && (viewMember.status === ApprovalStatus.PENDING || viewMember.status === ApprovalStatus.REJECTED) && viewMember.createdBy === 'MEMBER' ? (id) => handleConfirmAction(id, 'APPROVED') : undefined}
                    onReject={viewMember && viewMember.status === ApprovalStatus.PENDING && viewMember.createdBy === 'MEMBER' ? (id) => handleConfirmAction(id, 'REJECTED') : undefined}
                    onPrintId={handlePrintId}
                    onDelete={(id) => setDeleteDialog({ isOpen: true, member: viewMember })}
                    actionLoading={viewMember ? approvalLoadingId === viewMember._id : false}
                />

                <EditMemberDialog
                    isOpen={!!editMember}
                    onClose={() => setEditMember(null)}
                    member={editMember}
                    onSuccess={() => {
                        fetchMembers();
                        setEditMember(null);
                    }}
                />

                <ConfirmationDialog
                    isOpen={confirmDialog.isOpen}
                    title={confirmDialog.action === 'APPROVED' ? 'Approve Member' : 'Reject Member'}
                    message={confirmDialog.action === 'APPROVED' ? 'Are you sure you want to approve this member?' : 'Are you sure you want to reject this member?'}
                    confirmText={confirmDialog.action === 'APPROVED' ? 'Approve' : 'Reject'}
                    isDangerous={confirmDialog.action === 'REJECTED'}
                    onConfirm={handleConfirmDialogConfirm}
                    onCancel={() => setConfirmDialog({ isOpen: false, action: null, memberId: null })}
                    isLoading={approvalLoadingId !== null}
                />

                <RejectReasonDialog
                    isOpen={rejectReasonDialog.isOpen}
                    onClose={() => setRejectReasonDialog({ isOpen: false, memberId: null })}
                    onConfirm={handleRejectWithReason}
                    isLoading={approvalLoadingId !== null}
                />

                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    title="Delete Member"
                    message={
                        deleteDialog.member?.printCount && deleteDialog.member.printCount > 0
                            ? 'This member has been printed. They will be soft-deleted to preserve audit trail.'
                            : 'This member will be permanently deleted from the system.'
                    }
                    confirmText="Delete"
                    isDangerous={true}
                    onConfirm={() => deleteDialog.member && handleDeleteMember(deleteDialog.member._id)}
                    onCancel={() => setDeleteDialog({ isOpen: false, member: null })}
                    isLoading={deleteLoading}
                />
            </div>
        </div>
    );
};

export default DistrictAdminDashboard;
