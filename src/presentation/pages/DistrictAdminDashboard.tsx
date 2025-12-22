import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { ApprovalStatus } from '../../common/enums';
import { AdminRepository } from '../../data/repositories/AdminRepository';
import { pdf } from '@react-pdf/renderer';
import IdCardDocument from '../components/admin/IdCardDocument';
import { AddMemberDialog } from '../components/AddMemberDialog';
import { ViewDetailsDialog } from '../components/ViewDetailsDialog';
import { EditMemberDialog } from '../components/EditMemberDialog';
import { toast } from 'react-toastify';
import { FaSignOutAlt, FaUser, FaPlus } from 'react-icons/fa';
import clsx from 'clsx';

const DistrictAdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [members, setMembers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddMember, setShowAddMember] = useState(false);
    const [viewMember, setViewMember] = useState<any>(null);
    const [editMember, setEditMember] = useState<any>(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const data = await AdminRepository.getMembers();
            console.log('Fetched Members for District Admin:', data);
            if (Array.isArray(data)) {
                setMembers(data);
            } else {
                console.error('Invalid members data format:', data);
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
            const blob = await pdf(<IdCardDocument driver={member} />).toBlob();
            if (blob) {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            } else {
                toast.error('Failed to generate PDF Blob');
            }
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate ID Card');
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const filteredMembers = members.filter(member =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="KTDO Logo" className="w-10 h-10 object-contain" />
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex flex-col">
                                KTDO
                                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 w-fit">District Admin</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <FaUser />
                                <span>{user?.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
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
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">My Members</h2>
                    <p className="text-gray-500">Manage members assigned to your district</p>
                </div>

                {/* Search and Add Member */}
                <div className="mb-6 flex gap-4">
                    <input
                        type="text"
                        placeholder="Search by name, email, or vehicle number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        onClick={() => setShowAddMember(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
                    >
                        <FaPlus /> Add Member
                    </button>
                </div>

                {/* Members Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Approval</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredMembers.map((member) => (
                                    <tr key={member._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
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
                                                <button
                                                    onClick={() => handleBlockToggle(member._id)}
                                                    className={clsx(
                                                        "text-sm font-medium transition-colors",
                                                        member.isBlocked ? "text-green-600 hover:text-green-500" : "text-red-600 hover:text-red-500"
                                                    )}
                                                >
                                                    {member.isBlocked ? 'Unblock' : 'Block'}
                                                </button>
                                                <button
                                                    onClick={() => handlePrintId(member)}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                                >
                                                    Print ID
                                                </button>
                                                <button
                                                    onClick={() => setEditMember(member)}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                                >
                                                    Edit
                                                </button>
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
                                {filteredMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            {searchTerm ? 'No members found matching your search.' : 'No members assigned to your district yet.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
        </div>
    );
};

export default DistrictAdminDashboard;
