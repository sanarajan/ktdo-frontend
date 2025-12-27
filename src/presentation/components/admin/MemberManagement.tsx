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

export const MemberManagement = () => {
    const [members, setMembers] = useState<any[]>([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [viewMember, setViewMember] = useState<any>(null);
    const [editMember, setEditMember] = useState<any>(null);

    const fetchMembers = async () => {
        try {
            const data = await AdminRepository.getMembers();
            console.log('Fetched Members:', data);
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

    useEffect(() => {
        fetchMembers();
    }, []);

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
                <Button onClick={() => setShowAddDialog(true)}>
                    <FaPlus className="mr-2" /> Add New Member
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Image</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Approval</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {members.map((member) => (
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
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">No members found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
