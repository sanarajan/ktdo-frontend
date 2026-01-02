import { Dialog } from '@headlessui/react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { UserRole } from '../../common/enums';

interface ViewDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    title: string;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onPrintId?: (data: any) => void;
    onDelete?: (id: string) => void;
    actionLoading?: boolean;
}

export const ViewDetailsDialog = ({ isOpen, onClose, data, title, onApprove, onReject, onPrintId, onDelete, actionLoading }: ViewDetailsDialogProps) => {
    if (!data) return null;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
                <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl my-8 max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-white">
                            {title}
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                        {data.status === 'REJECTED' && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <FaExclamationTriangle className="text-red-600 dark:text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                                    This member is rejected.
                                </p>
                            </div>
                        )}
                        {data.status === 'REJECTED' && data.rejectionReason && (
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                <label className="text-sm font-semibold text-orange-700 dark:text-orange-400 block mb-2">Rejection Reason:</label>
                                <p className="text-sm text-orange-600 dark:text-orange-300">{data.rejectionReason}</p>
                            </div>
                        )}
                        {data.photoUrl && (
                            <div className="flex justify-center mb-4">
                                <img src={data.photoUrl} alt={data.name} className="w-32 h-32 rounded-lg object-cover border border-gray-300 shadow-sm" />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                                <p className="text-gray-800 dark:text-white font-medium">{data.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                                <p className="text-gray-800 dark:text-white">{data.email}</p>
                            </div>
                            {data.phone && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                                    <p className="text-gray-800 dark:text-white">{data.phone}</p>
                                </div>
                            )}
                            {data.role === UserRole.MEMBER && data.bloodGroup && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Blood Group</label>
                                    <p className="text-gray-800 dark:text-white">{data.bloodGroup}</p>
                                </div>
                            )}
                            {data.role === UserRole.MEMBER && (data.houseName || data.place) && (
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                                    <p className="text-gray-800 dark:text-white">
                                        {`${data.houseName || ''}${data.houseName && data.place ? ', ' : ''}${data.place || ''}`}
                                    </p>
                                </div>
                            )}
                            {data.district && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">District</label>
                                    <p className="text-gray-800 dark:text-white">{data.district}</p>
                                </div>
                            )}
                            {data.state && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">State</label>
                                    <p className="text-gray-800 dark:text-white">{data.state}</p>
                                </div>
                            )}
                            {data.role === UserRole.MEMBER && data.pin && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Pincode</label>
                                    <p className="text-gray-800 dark:text-white">{data.pin}</p>
                                </div>
                            )}
                            {data.role === UserRole.MEMBER && data.stateRtoCode && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">State RTO Code</label>
                                    <p className="text-gray-800 dark:text-white">{data.stateRtoCode}</p>
                                </div>
                            )}
                            {data.role === UserRole.MEMBER && data.uniqueId && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique ID</label>
                                    <p className="text-gray-800 dark:text-white font-mono">{data.uniqueId}</p>
                                </div>
                            )}
                            {data.role === UserRole.MEMBER && data.printCount !== undefined && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Print Count</label>
                                    <p className="text-gray-800 dark:text-white">{data.printCount}</p>
                                </div>
                            )}
                            {data.role === UserRole.MEMBER && data.createdBy && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</label>
                                    <p className="text-gray-800 dark:text-white">{data.createdBy}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                                <p className="text-gray-800 dark:text-white">{data.role}</p>
                            </div>
                            {data.role === UserRole.MEMBER && data.status && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                                    <p className="text-gray-800 dark:text-white">{data.status}</p>
                                </div>
                            )}
                            {data.isBlocked !== undefined && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</label>
                                    <p className={data.isBlocked ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                                        {data.isBlocked ? 'Blocked' : 'Active'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        {data.status === 'PENDING' && onApprove && onReject && (
                            <>
                                <button
                                    disabled={actionLoading}
                                    onClick={() => onApprove(data._id || data.id)}
                                    className={`px-4 py-2 rounded-lg text-white ${actionLoading ? 'bg-green-300' : 'bg-green-600 hover:bg-green-500'}`}
                                >
                                    {actionLoading ? 'Approving...' : 'Approve'}
                                </button>
                                <button
                                    disabled={actionLoading}
                                    onClick={() => onReject(data._id || data.id)}
                                    className={`px-4 py-2 rounded-lg text-white ${actionLoading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-500'}`}
                                >
                                    {actionLoading ? 'Rejecting...' : 'Reject'}
                                </button>
                            </>
                        )}
                        {data.status === 'REJECTED' && onApprove && (
                            <button
                                disabled={actionLoading}
                                onClick={() => onApprove(data._id || data.id)}
                                className={`px-4 py-2 rounded-lg text-white ${actionLoading ? 'bg-green-300' : 'bg-green-600 hover:bg-green-500'}`}
                            >
                                {actionLoading ? 'Approving...' : 'Approve'}
                            </button>
                        )}
                        {data.status === 'APPROVED' && !data.isBlocked && onPrintId && (
                            <button
                                onClick={() => onPrintId(data)}
                                className="px-4 py-2 bg-brand text-black rounded-lg hover:bg-brand-400 transition"
                            >
                                {data.printCount && data.printCount > 0 ? 'Reprint' : 'Print ID'}
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(data._id || data.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            Close
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};
