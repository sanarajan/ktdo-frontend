import { useEffect, useState } from 'react';
import { AdminRepository } from '../../../data/repositories/AdminRepository';
import { Button } from '../Button';
import { AddMemberDialog } from '../AddMemberDialog';
import { ViewDetailsDialog } from '../ViewDetailsDialog';
import { EditMemberDialog } from '../EditMemberDialog';
import { pdf } from '@react-pdf/renderer';
import IdCardDocument from './IdCardDocument';
import { toast } from 'react-toastify';
import { ApprovalStatus } from '../../../common/enums';
import clsx from 'clsx';
import { FaPlus } from 'react-icons/fa';
import  {getBase64} from '../../../utils/ImageHelper';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { UserRole } from '../../../common/enums';

export const MemberManagement = () => {
    const [members, setMembers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMembers, setTotalMembers] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [viewMember, setViewMember] = useState<any>(null);
    const [editMember, setEditMember] = useState<any>(null);
    const { user } = useSelector((state: RootState) => state.auth);

    const fetchMembers = async () => {
        try {
            setIsLoading(true);
            const { members: data, pagination } = await AdminRepository.getMembers({
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm
            });
            console.log('Fetched Members:', data);
            if (Array.isArray(data)) {
                setMembers(data);
                setTotalPages(pagination.totalPages);
                setTotalMembers(pagination.total);
            } else {
                console.error('Invalid members data format:', data);
                setMembers([]);
            }
        } catch (error) {
            console.error('Failed to fetch members', error);
            setMembers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [currentPage, searchTerm, itemsPerPage]);

    // Reset to page 1 when search changes
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
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
        const base64Image = await getBase64(member.photoUrl);
const blob = await pdf(
    <IdCardDocument key={Date.now()} driver={{ ...member, photoUrl: base64Image }} />
).toBlob();
        // const blob = await pdf(
        //     <IdCardDocument
        //         key={Date.now()}   // 🔥 force re-render
        //         driver={member}
        //     />
        // ).toBlob();

        if (!blob) {
            toast.error('Failed to generate PDF Blob');
            return;
        }

        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (error) {
        console.error('PDF Generation Error:', error);
        toast.error('Failed to generate ID Card');
    }
};


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Member Directory</h3>
                    <p className="text-gray-500 text-sm mt-1">Manage all registered drivers and members</p>
                </div>
                {user?.role !== UserRole.MAIN_ADMIN && (
                    <Button onClick={() => setShowAddDialog(true)}>
                        <FaPlus className="mr-2" /> Add New Member
                    </Button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <input
                    type="text"
                    placeholder="Search by name, email, or phone number..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-brand text-black border-b border-brand-600">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-black">Image</th>
                                <th className="p-4 text-sm font-semibold text-black">Name</th>
                                <th className="p-4 text-sm font-semibold text-black">Email</th>
                                <th className="p-4 text-sm font-semibold text-black">Status</th>
                                <th className="p-4 text-sm font-semibold text-black">Approval</th>
                                <th className="p-4 text-sm font-semibold text-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : members.map((member) => (
                                <tr key={member._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4">
                                        {member.photoUrl ? (
                                            <img src={member.photoUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No Img</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800 dark:text-gray-200">{member.name}</div>
                                        <div className="text-xs text-gray-400">{member.phone}</div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{member.email}</td>
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
                                        <span className={clsx(
                                            "px-2 py-1 rounded-full text-xs font-semibold",
                                            member.status === ApprovalStatus.APPROVED
                                                ? "bg-green-100 text-green-700"
                                                : member.status === ApprovalStatus.REJECTED
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                        )}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {user?.role !== UserRole.MAIN_ADMIN && (
                                                <button
                                                    onClick={() => handleBlockToggle(member._id)}
                                                    className={clsx(
                                                        "text-sm font-medium transition-colors",
                                                        member.isBlocked ? "text-green-600 hover:text-green-500" : "text-red-600 hover:text-red-500"
                                                    )}
                                                >
                                                    {member.isBlocked ? 'Unblock' : 'Block'}
                                                </button>
                                            )}
                                            {member.status === ApprovalStatus.APPROVED && !member.isBlocked && (
                                                <button
                                                    onClick={() => handlePrintId(member)}
                                                    className="text-sm font-medium text-brand-600 dark:text-brand hover:text-brand-500"
                                                >
                                                    Print ID
                                                </button>
                                            )}
                                            {user?.role !== UserRole.MAIN_ADMIN && (
                                                <button
                                                    onClick={() => setEditMember(member)}
                                                    className="text-sm font-medium text-black hover:text-gray-700"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setViewMember(member)}
                                                className="text-sm font-medium text-gray-600 hover:text-gray-500"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && members.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        {searchTerm ? 'No results for your search.' : 'No members found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!isLoading && totalMembers > 0 && (
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

            <AddMemberDialog
                isOpen={showAddDialog}
                onClose={() => setShowAddDialog(false)}
                onSuccess={() => {
                    fetchMembers();
                    setShowAddDialog(false);
                }}
            />

            <ViewDetailsDialog
                isOpen={!!viewMember}
                onClose={() => setViewMember(null)}
                data={viewMember}
                title="Member Details"
                onPrintId={viewMember?.status === ApprovalStatus.APPROVED && !viewMember?.isBlocked ? handlePrintId : undefined}
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
        </div>
    );
};
